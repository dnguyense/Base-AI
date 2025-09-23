import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { batchProcessor } from '../services/batchProcessor';
import { PDFCompressionService } from '../services/pdfService';
import {
  ALLOWED_PDF_MIME_TYPES,
  MAX_BATCH_FILE_SIZE_BYTES,
  MAX_BATCH_FILES_PER_REQUEST,
  MAX_BATCH_TOTAL_UPLOAD_SIZE_BYTES,
} from '../config/upload';
import { calculateTotalUploadSize, cleanupUploadedFiles } from '../utils/upload';
import { validateAndNormalizeBatchOptions } from '../utils/batchOptions';

const router = express.Router();

// Configure multer for batch file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../batch-uploads');
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_BATCH_FILE_SIZE_BYTES,
    files: MAX_BATCH_FILES_PER_REQUEST,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_PDF_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_PDF_MIME_TYPES)[number])) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * POST /api/v1/batch/upload
 * Upload multiple PDF files and start batch processing
 */
router.post('/upload', upload.array('files', MAX_BATCH_FILES_PER_REQUEST), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];

    if (!files.length) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
      return;
    }

    const { options, errors: baseErrors } = validateAndNormalizeBatchOptions(req.body as Record<string, unknown>);
    const validationErrors = [...baseErrors];

    let userId = 'anonymous';
    if (Object.prototype.hasOwnProperty.call(req.body ?? {}, 'userId')) {
      const userIdValue = (req.body as Record<string, unknown>).userId;
      if (typeof userIdValue === 'string') {
        const trimmed = userIdValue.trim();
        if (!trimmed) {
          validationErrors.push({ field: 'userId', message: 'userId cannot be empty' });
        } else {
          userId = trimmed;
        }
      } else if (userIdValue !== undefined && userIdValue !== null) {
        validationErrors.push({ field: 'userId', message: 'userId must be a string' });
      }
    }

    if (validationErrors.length > 0) {
      await cleanupUploadedFiles(files);
      res.status(400).json({
        success: false,
        error: 'Invalid batch options',
        details: validationErrors
      });
      return;
    }

    const totalUploadSize = calculateTotalUploadSize(files);
    if (totalUploadSize > MAX_BATCH_TOTAL_UPLOAD_SIZE_BYTES) {
      await cleanupUploadedFiles(files);
      res.status(413).json({
        success: false,
        error: `Total upload size ${PDFCompressionService.formatFileSize(totalUploadSize)} exceeds limit of ${PDFCompressionService.formatFileSize(MAX_BATCH_TOTAL_UPLOAD_SIZE_BYTES)}`,
        totalSize: totalUploadSize,
        maxTotalSize: MAX_BATCH_TOTAL_UPLOAD_SIZE_BYTES
      });
      return;
    }

    for (const file of files) {
      if (!ALLOWED_PDF_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_PDF_MIME_TYPES)[number])) {
        await cleanupUploadedFiles(files);
        res.status(400).json({
          success: false,
          error: `File ${file.originalname} must be a PDF`
        });
        return;
      }

      if (!file.size || file.size <= 0) {
        await cleanupUploadedFiles(files);
        res.status(400).json({
          success: false,
          error: `File ${file.originalname} is empty`
        });
        return;
      }

      if (file.size > MAX_BATCH_FILE_SIZE_BYTES) {
        await cleanupUploadedFiles(files);
        res.status(413).json({
          success: false,
          error: `File ${file.originalname} exceeds the ${PDFCompressionService.formatFileSize(MAX_BATCH_FILE_SIZE_BYTES)} size limit`,
          file: file.originalname,
          size: file.size,
          maxFileSize: MAX_BATCH_FILE_SIZE_BYTES
        });
        return;
      }
    }

    const validationResults = await Promise.all(
      files.map(async (file) => {
        const validation = await PDFCompressionService.validatePDFFile(file.path);
        return { file, validation };
      })
    );

    const invalidFiles = validationResults.filter(result => !result.validation.valid);
    if (invalidFiles.length > 0) {
      await cleanupUploadedFiles(files);

      res.status(400).json({
        success: false,
        error: 'Some files are invalid',
        invalidFiles: invalidFiles.map(result => ({
          filename: result.file.originalname,
          error: result.validation.error
        }))
      });
      return;
    }

    const batchFiles = files.map(file => ({
      originalName: file.originalname,
      filePath: file.path,
      size: file.size
    }));

    const jobId = await batchProcessor.createBatchJob(userId, batchFiles, options);

    res.json({
      success: true,
      jobId,
      message: 'Batch processing started',
      filesCount: files.length
    });

  } catch (error) {
    console.error('Batch upload error:', error);

    if (req.files) {
      await cleanupUploadedFiles(req.files as Express.Multer.File[]);
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Batch upload failed'
    });
  }
});

/**
 * GET /api/v1/batch/status/:jobId
 * Get batch job status and progress
 */
router.get('/status/:jobId', (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = batchProcessor.getJobStatus(jobId);

    if (!job) {
      res.status(404).json({
        success: false,
        error: 'Job not found'
      });
      return;
    }

    // Get job statistics
    const stats = batchProcessor.getJobStats(jobId);

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

  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job status'
    });
  }
});

/**
 * POST /api/v1/batch/cancel/:jobId
 * Cancel a batch processing job
 */
router.post('/cancel/:jobId', async (req, res): Promise<void> => {
  try {
    const jobId = req.params.jobId;
    const cancelled = await batchProcessor.cancelJob(jobId);

    if (!cancelled) {
      res.status(400).json({
        success: false,
        error: 'Cannot cancel job (job not found or not cancellable)'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Job cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel job'
    });
  }
});

/**
 * GET /api/v1/batch/download/:jobId
 * Create and download batch archive
 */
router.get('/download/:jobId', async (req, res): Promise<void> => {
  try {
    const jobId = req.params.jobId;
    const job = batchProcessor.getJobStatus(jobId);

    if (!job) {
      res.status(404).json({
        success: false,
        error: 'Job not found'
      });
      return;
    }

    if (job.status !== 'completed') {
      res.status(400).json({
        success: false,
        error: 'Job not completed yet'
      });
      return;
    }

    // Create batch download archive
    const downloadResult = await batchProcessor.createBatchDownload(jobId);

    if (!downloadResult.success) {
      res.status(500).json({
        success: false,
        error: downloadResult.error
      });
      return;
    }

    // Send the archive file
    const archivePath = downloadResult.downloadPath!;
    const fileName = `compressed_batch_${jobId}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', (await fs.stat(archivePath)).size);

    const fileStream = fs.createReadStream(archivePath);
    fileStream.pipe(res);

    // Clean up archive after download (optional)
    fileStream.on('end', async () => {
      setTimeout(async () => {
        try {
          await fs.remove(archivePath);
        } catch (error) {
          console.warn('Failed to cleanup archive:', error);
        }
      }, 60000); // Delete after 1 minute
    });

  } catch (error) {
    console.error('Download batch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create download'
    });
  }
});

/**
 * GET /api/v1/batch/jobs/:userId
 * Get all batch jobs for a user
 */
router.get('/jobs/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const jobs = batchProcessor.getUserJobs(userId);

    const jobSummaries = jobs.map(job => ({
      id: job.id,
      status: job.status,
      progress: job.progress,
      filesCount: job.files.length,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      stats: batchProcessor.getJobStats(job.id)
    }));

    res.json({
      success: true,
      jobs: jobSummaries
    });

  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user jobs'
    });
  }
});

/**
 * WebSocket-like endpoint for real-time updates (using Server-Sent Events)
 * GET /api/v1/batch/events/:jobId
 */
router.get('/events/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  
  // Setup SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial status
  const job = batchProcessor.getJobStatus(jobId);
  if (job) {
    res.write(`data: ${JSON.stringify({ type: 'status', job })}\n\n`);
  }

  // Listen for batch processor events
  const onJobProgress = (data: any) => {
    if (data.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ type: 'progress', data })}\n\n`);
    }
  };

  const onJobCompleted = (job: any) => {
    if (job.id === jobId) {
      res.write(`data: ${JSON.stringify({ type: 'completed', job })}\n\n`);
    }
  };

  const onFileCompleted = (data: any) => {
    if (data.jobId === jobId) {
      res.write(`data: ${JSON.stringify({ type: 'fileCompleted', data })}\n\n`);
    }
  };

  // Subscribe to events
  batchProcessor.on('jobProgress', onJobProgress);
  batchProcessor.on('jobCompleted', onJobCompleted);
  batchProcessor.on('fileCompleted', onFileCompleted);

  // Handle client disconnect
  req.on('close', () => {
    batchProcessor.off('jobProgress', onJobProgress);
    batchProcessor.off('jobCompleted', onJobCompleted);
    batchProcessor.off('fileCompleted', onFileCompleted);
  });
});

router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        error: `File size exceeds the ${PDFCompressionService.formatFileSize(MAX_BATCH_FILE_SIZE_BYTES)} limit`
      });
      return;
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: `Too many files. Maximum is ${MAX_BATCH_FILES_PER_REQUEST} files per request.`
      });
      return;
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: 'Unexpected file field. Use "files" as the field name.'
      });
      return;
    }
  }

  if (error?.message === 'Only PDF files are allowed') {
    res.status(400).json({
      success: false,
      error: 'Only PDF files are allowed.'
    });
    return;
  }

  console.error('Batch router error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error during batch upload.'
  });
});

export default router;
