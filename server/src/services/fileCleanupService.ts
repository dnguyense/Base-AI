import fs from 'fs-extra';
import path from 'path';
import * as cron from 'node-cron';
import { EventEmitter } from 'events';
import { env } from '../config/env';

export interface CleanupConfig {
  maxAgeHours: number;
  maxStorageMB: number;
  cleanupIntervalHours: number;
  retentionPolicies: {
    temporary: number; // hours
    processed: number; // hours
    batch: number; // hours
    user: number; // hours
  };
}

export interface CleanupStats {
  filesDeleted: number;
  spaceFreeKB: number;
  errors: number;
  duration: number;
  timestamp: Date;
}

export interface FileInfo {
  path: string;
  size: number;
  created: Date;
  lastAccessed: Date;
  type: 'temporary' | 'processed' | 'batch' | 'user';
}

export class FileCleanupService extends EventEmitter {
  private config: CleanupConfig;
  private isRunning: boolean = false;
  private cleanupTask: cron.ScheduledTask | null = null;
  private baseDirectories: string[];
  private cleanupHistory: CleanupStats[] = [];
  private maxHistoryEntries: number = 100;

  constructor(config: Partial<CleanupConfig> = {}) {
    super();
    
    this.config = {
      maxAgeHours: config.maxAgeHours || 24,
      maxStorageMB: config.maxStorageMB || 1000,
      cleanupIntervalHours: config.cleanupIntervalHours || 1,
      retentionPolicies: {
        temporary: 2, // 2 hours
        processed: 24, // 24 hours
        batch: 48, // 48 hours
        user: 72, // 72 hours
        ...config.retentionPolicies
      }
    };

    this.baseDirectories = [
      path.join(__dirname, '../../uploads'),
      path.join(__dirname, '../../temp'),
      path.join(__dirname, '../../batch-output'),
      path.join(__dirname, '../../processed')
    ];

    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    for (const dir of this.baseDirectories) {
      await fs.ensureDir(dir);
    }
  }

  /**
   * Start the automated cleanup scheduler
   */
  public startScheduler(): void {
    if (this.cleanupTask) {
      this.stopScheduler();
    }

    // Run cleanup every hour by default
    const cronExpression = `0 */${this.config.cleanupIntervalHours} * * *`;
    
    this.cleanupTask = cron.schedule(cronExpression, () => {
      this.runCleanup().catch(error => {
        this.emit('error', error);
        console.error('Scheduled cleanup failed:', error);
      });
    });

    this.cleanupTask.start();
    this.emit('schedulerStarted', { interval: this.config.cleanupIntervalHours });
    console.log(`File cleanup scheduler started - runs every ${this.config.cleanupIntervalHours} hour(s)`);
  }

  /**
   * Stop the automated cleanup scheduler
   */
  public stopScheduler(): void {
    if (this.cleanupTask) {
      this.cleanupTask.destroy();
      this.cleanupTask = null;
      this.emit('schedulerStopped');
      console.log('File cleanup scheduler stopped');
    }
  }

  /**
   * Run cleanup manually
   */
  public async runCleanup(force: boolean = false): Promise<CleanupStats> {
    if (this.isRunning && !force) {
      throw new Error('Cleanup is already running');
    }

    this.isRunning = true;
    const startTime = Date.now();
    let stats: CleanupStats = {
      filesDeleted: 0,
      spaceFreeKB: 0,
      errors: 0,
      duration: 0,
      timestamp: new Date()
    };

    try {
      this.emit('cleanupStarted');
      console.log('Starting file cleanup process...');

      // Check storage usage first
      const storageInfo = await this.getStorageInfo();
      const needsCleanup = force || 
        storageInfo.totalMB > this.config.maxStorageMB || 
        await this.hasExpiredFiles();

      if (!needsCleanup) {
        console.log('No cleanup needed');
        this.emit('cleanupCompleted', stats);
        return stats;
      }

      // Scan and categorize files
      const filesToCleanup = await this.scanFiles();
      
      // Sort by priority (temporary files first, then by age)
      filesToCleanup.sort((a, b) => {
        const typePriority = { temporary: 0, processed: 1, batch: 2, user: 3 };
        if (typePriority[a.type] !== typePriority[b.type]) {
          return typePriority[a.type] - typePriority[b.type];
        }
        return a.created.getTime() - b.created.getTime(); // Older first
      });

      // Delete files
      for (const fileInfo of filesToCleanup) {
        try {
          if (await this.shouldDeleteFile(fileInfo)) {
            await this.deleteFile(fileInfo);
            stats.filesDeleted++;
            stats.spaceFreeKB += fileInfo.size / 1024;
          }
        } catch (error) {
          stats.errors++;
          console.error(`Failed to delete file ${fileInfo.path}:`, error);
          this.emit('fileDeleteError', { file: fileInfo, error });
        }
      }

      // Clean up empty directories
      await this.cleanupEmptyDirectories();

      stats.duration = Date.now() - startTime;
      this.addToHistory(stats);

      console.log(`Cleanup completed: ${stats.filesDeleted} files deleted, ${Math.round(stats.spaceFreeKB / 1024)}MB freed`);
      this.emit('cleanupCompleted', stats);

      return stats;

    } catch (error) {
      stats.duration = Date.now() - startTime;
      stats.errors++;
      this.addToHistory(stats);
      
      console.error('Cleanup failed:', error);
      this.emit('cleanupError', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Scan directories for files to potentially clean up
   */
  private async scanFiles(): Promise<FileInfo[]> {
    const files: FileInfo[] = [];

    for (const baseDir of this.baseDirectories) {
      if (!(await fs.pathExists(baseDir))) continue;

      const scanResults = await this.scanDirectory(baseDir);
      files.push(...scanResults);
    }

    return files;
  }

  /**
   * Recursively scan a directory
   */
  private async scanDirectory(dirPath: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.scanDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          try {
            const stats = await fs.stat(fullPath);
            const fileInfo: FileInfo = {
              path: fullPath,
              size: stats.size,
              created: stats.birthtime,
              lastAccessed: stats.atime,
              type: this.categorizeFile(fullPath)
            };
            files.push(fileInfo);
          } catch (error) {
            console.warn(`Failed to stat file ${fullPath}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to read directory ${dirPath}:`, error);
    }

    return files;
  }

  /**
   * Categorize file based on its location and name
   */
  private categorizeFile(filePath: string): FileInfo['type'] {
    const relativePath = path.relative(__dirname, filePath);
    
    if (relativePath.includes('temp') || filePath.includes('.tmp')) {
      return 'temporary';
    } else if (relativePath.includes('batch-output')) {
      return 'batch';
    } else if (relativePath.includes('processed')) {
      return 'processed';
    } else {
      return 'user';
    }
  }

  /**
   * Determine if a file should be deleted based on retention policies
   */
  private async shouldDeleteFile(fileInfo: FileInfo): Promise<boolean> {
    const ageHours = (Date.now() - fileInfo.created.getTime()) / (1000 * 60 * 60);
    const maxAge = this.config.retentionPolicies[fileInfo.type];
    
    return ageHours > maxAge;
  }

  /**
   * Delete a single file
   */
  private async deleteFile(fileInfo: FileInfo): Promise<void> {
    await fs.remove(fileInfo.path);
    this.emit('fileDeleted', fileInfo);
  }

  /**
   * Clean up empty directories
   */
  private async cleanupEmptyDirectories(): Promise<void> {
    for (const baseDir of this.baseDirectories) {
      await this.removeEmptyDirs(baseDir);
    }
  }

  /**
   * Recursively remove empty directories
   */
  private async removeEmptyDirs(dirPath: string): Promise<void> {
    if (!(await fs.pathExists(dirPath))) return;

    try {
      const entries = await fs.readdir(dirPath);
      
      // Recursively process subdirectories first
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          await this.removeEmptyDirs(fullPath);
        }
      }

      // Check if directory is empty after processing subdirectories
      const currentEntries = await fs.readdir(dirPath);
      if (currentEntries.length === 0 && !this.baseDirectories.includes(dirPath)) {
        await fs.rmdir(dirPath);
        console.log(`Removed empty directory: ${dirPath}`);
      }
    } catch (error) {
      console.warn(`Failed to process directory ${dirPath}:`, error);
    }
  }

  /**
   * Get storage information
   */
  public async getStorageInfo(): Promise<{
    totalMB: number;
    fileCount: number;
    directories: { [key: string]: { sizeMB: number; fileCount: number } };
  }> {
    let totalSize = 0;
    let fileCount = 0;
    const directories: { [key: string]: { sizeMB: number; fileCount: number } } = {};

    for (const baseDir of this.baseDirectories) {
      const dirName = path.basename(baseDir);
      directories[dirName] = { sizeMB: 0, fileCount: 0 };

      if (!(await fs.pathExists(baseDir))) continue;

      const files = await this.scanDirectory(baseDir);
      for (const file of files) {
        totalSize += file.size;
        fileCount++;
        directories[dirName].sizeMB += file.size / (1024 * 1024);
        directories[dirName].fileCount++;
      }
    }

    return {
      totalMB: totalSize / (1024 * 1024),
      fileCount,
      directories
    };
  }

  /**
   * Check if there are any expired files
   */
  private async hasExpiredFiles(): Promise<boolean> {
    const files = await this.scanFiles();
    return files.some(file => this.shouldDeleteFile(file));
  }

  /**
   * Add cleanup stats to history
   */
  private addToHistory(stats: CleanupStats): void {
    this.cleanupHistory.unshift(stats);
    if (this.cleanupHistory.length > this.maxHistoryEntries) {
      this.cleanupHistory = this.cleanupHistory.slice(0, this.maxHistoryEntries);
    }
  }

  /**
   * Get cleanup history
   */
  public getCleanupHistory(limit?: number): CleanupStats[] {
    return limit ? this.cleanupHistory.slice(0, limit) : this.cleanupHistory;
  }

  /**
   * Emergency cleanup - remove all files older than specified hours
   */
  public async emergencyCleanup(maxAgeHours: number = 1): Promise<CleanupStats> {
    console.log(`Starting emergency cleanup - removing files older than ${maxAgeHours} hours`);
    
    const originalConfig = { ...this.config };
    
    // Temporarily set aggressive cleanup policies
    this.config.retentionPolicies = {
      temporary: Math.min(maxAgeHours, 0.5), // 30 minutes max
      processed: maxAgeHours,
      batch: maxAgeHours,
      user: maxAgeHours
    };

    try {
      const result = await this.runCleanup(true);
      this.emit('emergencyCleanupCompleted', result);
      return result;
    } finally {
      // Restore original config
      this.config = originalConfig;
    }
  }

  /**
   * Get service status
   */
  public getStatus(): {
    isRunning: boolean;
    schedulerActive: boolean;
    config: CleanupConfig;
    lastCleanup?: CleanupStats;
  } {
    return {
      isRunning: this.isRunning,
      schedulerActive: this.cleanupTask !== null,
      config: this.config,
      lastCleanup: this.cleanupHistory[0]
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<CleanupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
    
    // Restart scheduler if interval changed
    if (newConfig.cleanupIntervalHours && this.cleanupTask) {
      this.stopScheduler();
      this.startScheduler();
    }
  }
}

// Create singleton instance
export const fileCleanupService = new FileCleanupService({
  maxAgeHours: 24,
  maxStorageMB: 1000,
  cleanupIntervalHours: 1,
  retentionPolicies: {
    temporary: 2,   // 2 hours
    processed: 24,  // 24 hours
    batch: 48,      // 48 hours
    user: 72        // 72 hours
  }
});

// Start the scheduler automatically (disabled during tests)
if (!env.isTest) {
  fileCleanupService.startScheduler();
}
