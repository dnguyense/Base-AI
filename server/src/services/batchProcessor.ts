// @ts-nocheck
import { EventEmitter } from 'events';
import { pdfService, CompressionOptions, CompressionResult } from './pdfService';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

export interface BatchJob {
  id: string;
  userId: string;
  files: BatchFile[];
  options: CompressionOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  results?: BatchProcessingResult[];
  error?: string;
}

export interface BatchFile {
  id: string;
  originalName: string;
  filePath: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: CompressionResult;
  error?: string;
}

export interface BatchProcessingResult {
  fileId: string;
  success: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  outputPath: string;
  fileName: string;
  error?: string;
}

export class BatchProcessor extends EventEmitter {
  private jobs: Map<string, BatchJob> = new Map();
  private processingQueue: string[] = [];
  private maxConcurrentJobs: number = 3;
  private currentlyProcessing: Set<string> = new Set();
  private outputDir: string;

  constructor() {
    super();
    this.outputDir = path.join(__dirname, '../../batch-output');
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    await fs.ensureDir(this.outputDir);
  }

  /**
   * Create a new batch job
   */
  async createBatchJob(
    userId: string,
    files: { originalName: string; filePath: string; size: number }[],
    options: CompressionOptions
  ): Promise<string> {
    const jobId = uuidv4();
    
    const batchFiles: BatchFile[] = files.map((file, index) => ({
      id: `${jobId}-file-${index}`,
      originalName: file.originalName,
      filePath: file.filePath,
      size: file.size,
      status: 'pending',
      progress: 0
    }));

    const job: BatchJob = {
      id: jobId,
      userId,
      files: batchFiles,
      options,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      results: []
    };

    this.jobs.set(jobId, job);
    this.processingQueue.push(jobId);
    
    // Start processing if we have capacity
    this.processQueue();

    this.emit('jobCreated', job);
    return jobId;
  }

  /**
   * Get job status and progress
   */
  getJobStatus(jobId: string): BatchJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Cancel a batch job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'processing') {
      job.status = 'cancelled';
      this.currentlyProcessing.delete(jobId);
      this.emit('jobCancelled', job);
      return true;
    } else if (job.status === 'pending') {
      job.status = 'cancelled';
      const queueIndex = this.processingQueue.indexOf(jobId);
      if (queueIndex > -1) {
        this.processingQueue.splice(queueIndex, 1);
      }
      this.emit('jobCancelled', job);
      return true;
    }

    return false;
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    while (
      this.processingQueue.length > 0 && 
      this.currentlyProcessing.size < this.maxConcurrentJobs
    ) {
      const jobId = this.processingQueue.shift();
      if (!jobId) continue;

      const job = this.jobs.get(jobId);
      if (!job || job.status !== 'pending') continue;

      this.currentlyProcessing.add(jobId);
      this.processJob(jobId).finally(() => {
        this.currentlyProcessing.delete(jobId);
        this.processQueue(); // Process next job in queue
      });
    }
  }

  /**
   * Process a single batch job
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'processing';
      this.emit('jobStarted', job);

      const totalFiles = job.files.length;
      let completedFiles = 0;
      const results: BatchProcessingResult[] = [];

      for (const file of job.files) {
        if (job.status === 'cancelled') {
          break;
        }

        try {
          file.status = 'processing';
          this.emit('fileStarted', { jobId, file });

          // Simulate progress updates during compression
          const progressInterval = setInterval(() => {
            if (file.status === 'processing') {
              file.progress = Math.min(file.progress + 10, 90);
              this.updateJobProgress(jobId);
            }
          }, 100);

          // Compress the file
          const result = await pdfService.compressPDF(file.filePath, job.options);
          clearInterval(progressInterval);

          file.progress = 100;
          file.result = result;

          if (result.success) {
            file.status = 'completed';
            results.push({
              fileId: file.id,
              success: true,
              originalSize: result.originalSize,
              compressedSize: result.compressedSize,
              compressionRatio: result.compressionRatio,
              outputPath: result.outputPath,
              fileName: result.fileName
            });
          } else {
            file.status = 'failed';
            file.error = result.error;
            results.push({
              fileId: file.id,
              success: false,
              originalSize: 0,
              compressedSize: 0,
              compressionRatio: 0,
              outputPath: '',
              fileName: '',
              error: result.error
            });
          }

          this.emit('fileCompleted', { jobId, file });

        } catch (error) {
          file.status = 'failed';
          file.error = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            fileId: file.id,
            success: false,
            originalSize: 0,
            compressedSize: 0,
            compressionRatio: 0,
            outputPath: '',
            fileName: '',
            error: file.error
          });
          
          this.emit('fileError', { jobId, file, error });
        }

        completedFiles++;
        this.updateJobProgress(jobId);
      }

      // Update job status
      if (job.status === 'cancelled') {
        return;
      }

      job.results = results;
      job.completedAt = new Date();

      const successfulFiles = results.filter(r => r.success).length;
      if (successfulFiles === 0) {
        job.status = 'failed';
        job.error = 'All files failed to process';
      } else if (successfulFiles < results.length) {
        job.status = 'completed'; // Partial success
      } else {
        job.status = 'completed'; // Full success
      }

      job.progress = 100;
      this.emit('jobCompleted', job);

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      this.emit('jobError', { job, error });
    }
  }

  /**
   * Update job progress based on file completion
   */
  private updateJobProgress(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const totalFiles = job.files.length;
    const totalProgress = job.files.reduce((sum, file) => sum + file.progress, 0);
    job.progress = Math.round(totalProgress / totalFiles);

    this.emit('jobProgress', { jobId, progress: job.progress });
  }

  /**
   * Create batch download archive
   */
  async createBatchDownload(jobId: string): Promise<{ success: boolean; downloadPath?: string; error?: string }> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'completed') {
      return { success: false, error: 'Job not found or not completed' };
    }

    try {
      const archiver = require('archiver');
      const archivePath = path.join(this.outputDir, `batch-${jobId}.zip`);
      const output = fs.createWriteStream(archivePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve) => {
        output.on('close', () => {
          resolve({ success: true, downloadPath: archivePath });
        });

        archive.on('error', (err: Error) => {
          resolve({ success: false, error: err.message });
        });

        archive.pipe(output);

        // Add all successful files to archive
        job.results?.forEach((result, index) => {
          if (result.success && fs.existsSync(result.outputPath)) {
            const originalFile = job.files[index];
            archive.file(result.outputPath, { 
              name: `compressed_${originalFile.originalName}` 
            });
          }
        });

        archive.finalize();
      });

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Archive creation failed' 
      };
    }
  }

  /**
   * Get job statistics
   */
  getJobStats(jobId: string): {
    totalFiles: number;
    completedFiles: number;
    failedFiles: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    totalSavings: number;
  } | null {
    const job = this.jobs.get(jobId);
    if (!job || !job.results) return null;

    const stats = {
      totalFiles: job.files.length,
      completedFiles: job.results.filter(r => r.success).length,
      failedFiles: job.results.filter(r => !r.success).length,
      totalOriginalSize: job.results.reduce((sum, r) => sum + r.originalSize, 0),
      totalCompressedSize: job.results.reduce((sum, r) => sum + r.compressedSize, 0),
      totalSavings: 0
    };

    stats.totalSavings = stats.totalOriginalSize - stats.totalCompressedSize;
    return stats;
  }

  /**
   * Clean up old jobs and files
   */
  async cleanupOldJobs(maxAgeHours: number = 24): Promise<void> {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < cutoffTime && job.status !== 'processing') {
        // Clean up job files
        if (job.results) {
          for (const result of job.results) {
            if (result.outputPath) {
              await pdfService.cleanupFile(result.outputPath);
            }
          }
        }

        // Clean up batch archive if exists
        const archivePath = path.join(this.outputDir, `batch-${jobId}.zip`);
        if (await fs.pathExists(archivePath)) {
          await pdfService.cleanupFile(archivePath);
        }

        // Remove job from memory
        this.jobs.delete(jobId);
        this.emit('jobCleaned', { jobId });
      }
    }
  }

  /**
   * Get all jobs for a user
   */
  getUserJobs(userId: string): BatchJob[] {
    return Array.from(this.jobs.values()).filter(job => job.userId === userId);
  }

  /**
   * Set maximum concurrent jobs
   */
  setMaxConcurrentJobs(max: number): void {
    this.maxConcurrentJobs = Math.max(1, Math.min(10, max));
  }
}

// Create singleton instance
export const batchProcessor = new BatchProcessor();

// Start cleanup scheduler (run every hour)
setInterval(() => {
  batchProcessor.cleanupOldJobs(24);
}, 60 * 60 * 1000);