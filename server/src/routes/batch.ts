// @ts-nocheck
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { batchProcessor } from '../services/batchProcessor';
import { pdfService } from '../services/pdfService';
import { v4 as uuidv4 } from 'uuid';

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
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 10 // Maximum 10 files per batch
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
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
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const userId = req.body.userId || 'anonymous'; // In real app, get from auth
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

    // Validate all uploaded files
    const validationResults = await Promise.all(
      files.map(async (file) => {
        const validation = await pdfService.validatePDFFile(file.path);
        return {
          file,
          validation
        };
      })
    );

    // Check for validation errors
    const invalidFiles = validationResults.filter(result => !result.validation.valid);
    if (invalidFiles.length > 0) {
      // Clean up uploaded files
      await Promise.all(files.map(file => fs.remove(file.path)));
      
      return res.status(400).json({
        success: false,
        error: 'Some files are invalid',
        invalidFiles: invalidFiles.map(result => ({
          filename: result.file.originalname,
          error: result.validation.error
        }))
      });
    }

    // Create batch job
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
    
    // Clean up files if there was an error
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      await Promise.all(files.map(file => fs.remove(file.path)));
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
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
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
router.post('/cancel/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const cancelled = await batchProcessor.cancelJob(jobId);

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
router.get('/download/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = batchProcessor.getJobStatus(jobId);

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

    // Create batch download archive
    const downloadResult = await batchProcessor.createBatchDownload(jobId);

    if (!downloadResult.success) {
      return res.status(500).json({
        success: false,
        error: downloadResult.error
      });
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

export default router;