"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileCleanupService = exports.FileCleanupService = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const cron = __importStar(require("node-cron"));
const events_1 = require("events");
class FileCleanupService extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.isRunning = false;
        this.cleanupTask = null;
        this.cleanupHistory = [];
        this.maxHistoryEntries = 100;
        this.config = {
            maxAgeHours: config.maxAgeHours || 24,
            maxStorageMB: config.maxStorageMB || 1000,
            cleanupIntervalHours: config.cleanupIntervalHours || 1,
            retentionPolicies: {
                temporary: 2,
                processed: 24,
                batch: 48,
                user: 72,
                ...config.retentionPolicies
            }
        };
        this.baseDirectories = [
            path_1.default.join(__dirname, '../../uploads'),
            path_1.default.join(__dirname, '../../temp'),
            path_1.default.join(__dirname, '../../batch-output'),
            path_1.default.join(__dirname, '../../processed')
        ];
        this.ensureDirectories();
    }
    async ensureDirectories() {
        for (const dir of this.baseDirectories) {
            await fs_extra_1.default.ensureDir(dir);
        }
    }
    startScheduler() {
        if (this.cleanupTask) {
            this.stopScheduler();
        }
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
    stopScheduler() {
        if (this.cleanupTask) {
            this.cleanupTask.destroy();
            this.cleanupTask = null;
            this.emit('schedulerStopped');
            console.log('File cleanup scheduler stopped');
        }
    }
    async runCleanup(force = false) {
        if (this.isRunning && !force) {
            throw new Error('Cleanup is already running');
        }
        this.isRunning = true;
        const startTime = Date.now();
        let stats = {
            filesDeleted: 0,
            spaceFreeKB: 0,
            errors: 0,
            duration: 0,
            timestamp: new Date()
        };
        try {
            this.emit('cleanupStarted');
            console.log('Starting file cleanup process...');
            const storageInfo = await this.getStorageInfo();
            const needsCleanup = force ||
                storageInfo.totalMB > this.config.maxStorageMB ||
                await this.hasExpiredFiles();
            if (!needsCleanup) {
                console.log('No cleanup needed');
                this.emit('cleanupCompleted', stats);
                return stats;
            }
            const filesToCleanup = await this.scanFiles();
            filesToCleanup.sort((a, b) => {
                const typePriority = { temporary: 0, processed: 1, batch: 2, user: 3 };
                if (typePriority[a.type] !== typePriority[b.type]) {
                    return typePriority[a.type] - typePriority[b.type];
                }
                return a.created.getTime() - b.created.getTime();
            });
            for (const fileInfo of filesToCleanup) {
                try {
                    if (await this.shouldDeleteFile(fileInfo)) {
                        await this.deleteFile(fileInfo);
                        stats.filesDeleted++;
                        stats.spaceFreeKB += fileInfo.size / 1024;
                    }
                }
                catch (error) {
                    stats.errors++;
                    console.error(`Failed to delete file ${fileInfo.path}:`, error);
                    this.emit('fileDeleteError', { file: fileInfo, error });
                }
            }
            await this.cleanupEmptyDirectories();
            stats.duration = Date.now() - startTime;
            this.addToHistory(stats);
            console.log(`Cleanup completed: ${stats.filesDeleted} files deleted, ${Math.round(stats.spaceFreeKB / 1024)}MB freed`);
            this.emit('cleanupCompleted', stats);
            return stats;
        }
        catch (error) {
            stats.duration = Date.now() - startTime;
            stats.errors++;
            this.addToHistory(stats);
            console.error('Cleanup failed:', error);
            this.emit('cleanupError', error);
            throw error;
        }
        finally {
            this.isRunning = false;
        }
    }
    async scanFiles() {
        const files = [];
        for (const baseDir of this.baseDirectories) {
            if (!(await fs_extra_1.default.pathExists(baseDir)))
                continue;
            const scanResults = await this.scanDirectory(baseDir);
            files.push(...scanResults);
        }
        return files;
    }
    async scanDirectory(dirPath) {
        const files = [];
        try {
            const entries = await fs_extra_1.default.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    const subFiles = await this.scanDirectory(fullPath);
                    files.push(...subFiles);
                }
                else if (entry.isFile()) {
                    try {
                        const stats = await fs_extra_1.default.stat(fullPath);
                        const fileInfo = {
                            path: fullPath,
                            size: stats.size,
                            created: stats.birthtime,
                            lastAccessed: stats.atime,
                            type: this.categorizeFile(fullPath)
                        };
                        files.push(fileInfo);
                    }
                    catch (error) {
                        console.warn(`Failed to stat file ${fullPath}:`, error);
                    }
                }
            }
        }
        catch (error) {
            console.warn(`Failed to read directory ${dirPath}:`, error);
        }
        return files;
    }
    categorizeFile(filePath) {
        const relativePath = path_1.default.relative(__dirname, filePath);
        if (relativePath.includes('temp') || filePath.includes('.tmp')) {
            return 'temporary';
        }
        else if (relativePath.includes('batch-output')) {
            return 'batch';
        }
        else if (relativePath.includes('processed')) {
            return 'processed';
        }
        else {
            return 'user';
        }
    }
    async shouldDeleteFile(fileInfo) {
        const ageHours = (Date.now() - fileInfo.created.getTime()) / (1000 * 60 * 60);
        const maxAge = this.config.retentionPolicies[fileInfo.type];
        return ageHours > maxAge;
    }
    async deleteFile(fileInfo) {
        await fs_extra_1.default.remove(fileInfo.path);
        this.emit('fileDeleted', fileInfo);
    }
    async cleanupEmptyDirectories() {
        for (const baseDir of this.baseDirectories) {
            await this.removeEmptyDirs(baseDir);
        }
    }
    async removeEmptyDirs(dirPath) {
        if (!(await fs_extra_1.default.pathExists(dirPath)))
            return;
        try {
            const entries = await fs_extra_1.default.readdir(dirPath);
            for (const entry of entries) {
                const fullPath = path_1.default.join(dirPath, entry);
                const stats = await fs_extra_1.default.stat(fullPath);
                if (stats.isDirectory()) {
                    await this.removeEmptyDirs(fullPath);
                }
            }
            const currentEntries = await fs_extra_1.default.readdir(dirPath);
            if (currentEntries.length === 0 && !this.baseDirectories.includes(dirPath)) {
                await fs_extra_1.default.rmdir(dirPath);
                console.log(`Removed empty directory: ${dirPath}`);
            }
        }
        catch (error) {
            console.warn(`Failed to process directory ${dirPath}:`, error);
        }
    }
    async getStorageInfo() {
        let totalSize = 0;
        let fileCount = 0;
        const directories = {};
        for (const baseDir of this.baseDirectories) {
            const dirName = path_1.default.basename(baseDir);
            directories[dirName] = { sizeMB: 0, fileCount: 0 };
            if (!(await fs_extra_1.default.pathExists(baseDir)))
                continue;
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
    async hasExpiredFiles() {
        const files = await this.scanFiles();
        return files.some(file => this.shouldDeleteFile(file));
    }
    addToHistory(stats) {
        this.cleanupHistory.unshift(stats);
        if (this.cleanupHistory.length > this.maxHistoryEntries) {
            this.cleanupHistory = this.cleanupHistory.slice(0, this.maxHistoryEntries);
        }
    }
    getCleanupHistory(limit) {
        return limit ? this.cleanupHistory.slice(0, limit) : this.cleanupHistory;
    }
    async emergencyCleanup(maxAgeHours = 1) {
        console.log(`Starting emergency cleanup - removing files older than ${maxAgeHours} hours`);
        const originalConfig = { ...this.config };
        this.config.retentionPolicies = {
            temporary: Math.min(maxAgeHours, 0.5),
            processed: maxAgeHours,
            batch: maxAgeHours,
            user: maxAgeHours
        };
        try {
            const result = await this.runCleanup(true);
            this.emit('emergencyCleanupCompleted', result);
            return result;
        }
        finally {
            this.config = originalConfig;
        }
    }
    getStatus() {
        return {
            isRunning: this.isRunning,
            schedulerActive: this.cleanupTask !== null,
            config: this.config,
            lastCleanup: this.cleanupHistory[0]
        };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.emit('configUpdated', this.config);
        if (newConfig.cleanupIntervalHours && this.cleanupTask) {
            this.stopScheduler();
            this.startScheduler();
        }
    }
}
exports.FileCleanupService = FileCleanupService;
exports.fileCleanupService = new FileCleanupService({
    maxAgeHours: 24,
    maxStorageMB: 1000,
    cleanupIntervalHours: 1,
    retentionPolicies: {
        temporary: 2,
        processed: 24,
        batch: 48,
        user: 72
    }
});
exports.fileCleanupService.startScheduler();
//# sourceMappingURL=fileCleanupService.js.map