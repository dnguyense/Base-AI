"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchProcessor = exports.BatchProcessor = void 0;
const events_1 = require("events");
const pdfService_1 = require("./pdfService");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const uuid_1 = require("uuid");
class BatchProcessor extends events_1.EventEmitter {
    constructor() {
        super();
        this.jobs = new Map();
        this.processingQueue = [];
        this.maxConcurrentJobs = 3;
        this.currentlyProcessing = new Set();
        this.outputDir = path_1.default.join(__dirname, '../../batch-output');
        this.ensureDirectories();
    }
    async ensureDirectories() {
        await fs_extra_1.default.ensureDir(this.outputDir);
    }
    async createBatchJob(userId, files, options) {
        const jobId = (0, uuid_1.v4)();
        const batchFiles = files.map((file, index) => ({
            id: `${jobId}-file-${index}`,
            originalName: file.originalName,
            filePath: file.filePath,
            size: file.size,
            status: 'pending',
            progress: 0
        }));
        const job = {
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
        this.processQueue();
        this.emit('jobCreated', job);
        return jobId;
    }
    getJobStatus(jobId) {
        return this.jobs.get(jobId) || null;
    }
    async cancelJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return false;
        if (job.status === 'processing') {
            job.status = 'cancelled';
            this.currentlyProcessing.delete(jobId);
            this.emit('jobCancelled', job);
            return true;
        }
        else if (job.status === 'pending') {
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
    async processQueue() {
        while (this.processingQueue.length > 0 &&
            this.currentlyProcessing.size < this.maxConcurrentJobs) {
            const jobId = this.processingQueue.shift();
            if (!jobId)
                continue;
            const job = this.jobs.get(jobId);
            if (!job || job.status !== 'pending')
                continue;
            this.currentlyProcessing.add(jobId);
            this.processJob(jobId).finally(() => {
                this.currentlyProcessing.delete(jobId);
                this.processQueue();
            });
        }
    }
    async processJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return;
        try {
            job.status = 'processing';
            this.emit('jobStarted', job);
            const totalFiles = job.files.length;
            let completedFiles = 0;
            const results = [];
            for (const file of job.files) {
                if (job.status === 'cancelled') {
                    break;
                }
                try {
                    file.status = 'processing';
                    this.emit('fileStarted', { jobId, file });
                    const progressInterval = setInterval(() => {
                        if (file.status === 'processing') {
                            file.progress = Math.min(file.progress + 10, 90);
                            this.updateJobProgress(jobId);
                        }
                    }, 100);
                    const result = await pdfService_1.pdfService.compressPDF(file.filePath, job.options);
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
                    }
                    else {
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
                }
                catch (error) {
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
            if (job.status === 'cancelled') {
                return;
            }
            job.results = results;
            job.completedAt = new Date();
            const successfulFiles = results.filter(r => r.success).length;
            if (successfulFiles === 0) {
                job.status = 'failed';
                job.error = 'All files failed to process';
            }
            else if (successfulFiles < results.length) {
                job.status = 'completed';
            }
            else {
                job.status = 'completed';
            }
            job.progress = 100;
            this.emit('jobCompleted', job);
        }
        catch (error) {
            job.status = 'failed';
            job.error = error instanceof Error ? error.message : 'Unknown error';
            job.completedAt = new Date();
            this.emit('jobError', { job, error });
        }
    }
    updateJobProgress(jobId) {
        const job = this.jobs.get(jobId);
        if (!job)
            return;
        const totalFiles = job.files.length;
        const totalProgress = job.files.reduce((sum, file) => sum + file.progress, 0);
        job.progress = Math.round(totalProgress / totalFiles);
        this.emit('jobProgress', { jobId, progress: job.progress });
    }
    async createBatchDownload(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || job.status !== 'completed') {
            return { success: false, error: 'Job not found or not completed' };
        }
        try {
            const archiver = require('archiver');
            const archivePath = path_1.default.join(this.outputDir, `batch-${jobId}.zip`);
            const output = fs_extra_1.default.createWriteStream(archivePath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            return new Promise((resolve) => {
                output.on('close', () => {
                    resolve({ success: true, downloadPath: archivePath });
                });
                archive.on('error', (err) => {
                    resolve({ success: false, error: err.message });
                });
                archive.pipe(output);
                job.results?.forEach((result, index) => {
                    if (result.success && fs_extra_1.default.existsSync(result.outputPath)) {
                        const originalFile = job.files[index];
                        archive.file(result.outputPath, {
                            name: `compressed_${originalFile.originalName}`
                        });
                    }
                });
                archive.finalize();
            });
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Archive creation failed'
            };
        }
    }
    getJobStats(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || !job.results)
            return null;
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
    async cleanupOldJobs(maxAgeHours = 24) {
        const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
        for (const [jobId, job] of this.jobs.entries()) {
            if (job.createdAt < cutoffTime && job.status !== 'processing') {
                if (job.results) {
                    for (const result of job.results) {
                        if (result.outputPath) {
                            await pdfService_1.pdfService.cleanupFile(result.outputPath);
                        }
                    }
                }
                const archivePath = path_1.default.join(this.outputDir, `batch-${jobId}.zip`);
                if (await fs_extra_1.default.pathExists(archivePath)) {
                    await pdfService_1.pdfService.cleanupFile(archivePath);
                }
                this.jobs.delete(jobId);
                this.emit('jobCleaned', { jobId });
            }
        }
    }
    getUserJobs(userId) {
        return Array.from(this.jobs.values()).filter(job => job.userId === userId);
    }
    setMaxConcurrentJobs(max) {
        this.maxConcurrentJobs = Math.max(1, Math.min(10, max));
    }
}
exports.BatchProcessor = BatchProcessor;
exports.batchProcessor = new BatchProcessor();
setInterval(() => {
    exports.batchProcessor.cleanupOldJobs(24);
}, 60 * 60 * 1000);
//# sourceMappingURL=batchProcessor.js.map