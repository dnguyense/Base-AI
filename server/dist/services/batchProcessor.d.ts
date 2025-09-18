import { EventEmitter } from 'events';
import { CompressionOptions, CompressionResult } from './pdfService';
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
export declare class BatchProcessor extends EventEmitter {
    private jobs;
    private processingQueue;
    private maxConcurrentJobs;
    private currentlyProcessing;
    private outputDir;
    constructor();
    private ensureDirectories;
    createBatchJob(userId: string, files: {
        originalName: string;
        filePath: string;
        size: number;
    }[], options: CompressionOptions): Promise<string>;
    getJobStatus(jobId: string): BatchJob | null;
    cancelJob(jobId: string): Promise<boolean>;
    private processQueue;
    private processJob;
    private updateJobProgress;
    createBatchDownload(jobId: string): Promise<{
        success: boolean;
        downloadPath?: string;
        error?: string;
    }>;
    getJobStats(jobId: string): {
        totalFiles: number;
        completedFiles: number;
        failedFiles: number;
        totalOriginalSize: number;
        totalCompressedSize: number;
        totalSavings: number;
    } | null;
    cleanupOldJobs(maxAgeHours?: number): Promise<void>;
    getUserJobs(userId: string): BatchJob[];
    setMaxConcurrentJobs(max: number): void;
}
export declare const batchProcessor: BatchProcessor;
//# sourceMappingURL=batchProcessor.d.ts.map