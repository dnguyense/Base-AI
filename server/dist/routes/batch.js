"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const batchProcessor_1 = require("../services/batchProcessor");
const pdfService_1 = require("../services/pdfService");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../batch-uploads');
        await fs_extra_1.default.ensureDir(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 10
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});
router.post('/upload', upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        const userId = req.body.userId || 'anonymous';
        const options = {
            quality: req.body.quality || 'medium',
            removeMetadata: req.body.removeMetadata === 'true',
            removeAnnotations: req.body.removeAnnotations === 'true',
            optimizeImages: req.body.optimizeImages === 'true',
            imageQuality: parseInt(req.body.imageQuality) || 60,
            customDPI: parseInt(req.body.customDPI) || 150
        };
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }
        const validationResults = await Promise.all(files.map(async (file) => {
            const validation = await pdfService_1.pdfService.validatePDFFile(file.path);
            return {
                file,
                validation
            };
        }));
        const invalidFiles = validationResults.filter(result => !result.validation.valid);
        if (invalidFiles.length > 0) {
            await Promise.all(files.map(file => fs_extra_1.default.remove(file.path)));
            return res.status(400).json({
                success: false,
                error: 'Some files are invalid',
                invalidFiles: invalidFiles.map(result => ({
                    filename: result.file.originalname,
                    error: result.validation.error
                }))
            });
        }
        const batchFiles = files.map(file => ({
            originalName: file.originalname,
            filePath: file.path,
            size: file.size
        }));
        const jobId = await batchProcessor_1.batchProcessor.createBatchJob(userId, batchFiles, options);
        res.json({
            success: true,
            jobId,
            message: 'Batch processing started',
            filesCount: files.length
        });
    }
    catch (error) {
        console.error('Batch upload error:', error);
        if (req.files) {
            const files = req.files;
            await Promise.all(files.map(file => fs_extra_1.default.remove(file.path)));
        }
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Batch upload failed'
        });
    }
});
router.get('/status/:jobId', (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = batchProcessor_1.batchProcessor.getJobStatus(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }
        const stats = batchProcessor_1.batchProcessor.getJobStats(jobId);
        res.json({
            success: true,
            job: {
                id: job.id,
                status: job.status,
                progress: job.progress,
                filesCount: job.files.length,
                createdAt: job.createdAt,
                completedAt: job.completedAt,
                error: job.error
            },
            files: job.files.map(file => ({
                id: file.id,
                name: file.originalName,
                size: file.size,
                status: file.status,
                progress: file.progress,
                error: file.error
            })),
            stats,
            results: job.results
        });
    }
    catch (error) {
        console.error('Get job status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get job status'
        });
    }
});
router.post('/cancel/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const cancelled = await batchProcessor_1.batchProcessor.cancelJob(jobId);
        if (!cancelled) {
            return res.status(400).json({
                success: false,
                error: 'Cannot cancel job (job not found or not cancellable)'
            });
        }
        res.json({
            success: true,
            message: 'Job cancelled successfully'
        });
    }
    catch (error) {
        console.error('Cancel job error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel job'
        });
    }
});
router.get('/download/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = batchProcessor_1.batchProcessor.getJobStatus(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }
        if (job.status !== 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Job not completed yet'
            });
        }
        const downloadResult = await batchProcessor_1.batchProcessor.createBatchDownload(jobId);
        if (!downloadResult.success) {
            return res.status(500).json({
                success: false,
                error: downloadResult.error
            });
        }
        const archivePath = downloadResult.downloadPath;
        const fileName = `compressed_batch_${jobId}.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', (await fs_extra_1.default.stat(archivePath)).size);
        const fileStream = fs_extra_1.default.createReadStream(archivePath);
        fileStream.pipe(res);
        fileStream.on('end', async () => {
            setTimeout(async () => {
                try {
                    await fs_extra_1.default.remove(archivePath);
                }
                catch (error) {
                    console.warn('Failed to cleanup archive:', error);
                }
            }, 60000);
        });
    }
    catch (error) {
        console.error('Download batch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create download'
        });
    }
});
router.get('/jobs/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        const jobs = batchProcessor_1.batchProcessor.getUserJobs(userId);
        const jobSummaries = jobs.map(job => ({
            id: job.id,
            status: job.status,
            progress: job.progress,
            filesCount: job.files.length,
            createdAt: job.createdAt,
            completedAt: job.completedAt,
            stats: batchProcessor_1.batchProcessor.getJobStats(job.id)
        }));
        res.json({
            success: true,
            jobs: jobSummaries
        });
    }
    catch (error) {
        console.error('Get user jobs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user jobs'
        });
    }
});
router.get('/events/:jobId', (req, res) => {
    const jobId = req.params.jobId;
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    const job = batchProcessor_1.batchProcessor.getJobStatus(jobId);
    if (job) {
        res.write(`data: ${JSON.stringify({ type: 'status', job })}\n\n`);
    }
    const onJobProgress = (data) => {
        if (data.jobId === jobId) {
            res.write(`data: ${JSON.stringify({ type: 'progress', data })}\n\n`);
        }
    };
    const onJobCompleted = (job) => {
        if (job.id === jobId) {
            res.write(`data: ${JSON.stringify({ type: 'completed', job })}\n\n`);
        }
    };
    const onFileCompleted = (data) => {
        if (data.jobId === jobId) {
            res.write(`data: ${JSON.stringify({ type: 'fileCompleted', data })}\n\n`);
        }
    };
    batchProcessor_1.batchProcessor.on('jobProgress', onJobProgress);
    batchProcessor_1.batchProcessor.on('jobCompleted', onJobCompleted);
    batchProcessor_1.batchProcessor.on('fileCompleted', onFileCompleted);
    req.on('close', () => {
        batchProcessor_1.batchProcessor.off('jobProgress', onJobProgress);
        batchProcessor_1.batchProcessor.off('jobCompleted', onJobCompleted);
        batchProcessor_1.batchProcessor.off('fileCompleted', onFileCompleted);
    });
});
exports.default = router;
//# sourceMappingURL=batch.js.map