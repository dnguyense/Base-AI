import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { PDFController } from '../controllers/pdfController';
import {
  ALLOWED_PDF_MIME_TYPES,
  MAX_PDF_FILE_SIZE_BYTES,
  MAX_PDF_FILES_PER_REQUEST,
} from '../config/upload';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    await fs.ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}.pdf`;
    cb(null, uniqueName);
  }
});

// File filter to only allow PDF files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_PDF_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_PDF_MIME_TYPES)[number])) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Configure upload limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_PDF_FILE_SIZE_BYTES,
    files: MAX_PDF_FILES_PER_REQUEST,
  }
});

// Routes
/**
 * @route POST /api/v1/pdf/upload
 * @desc Upload PDF files for compression
 * @access Public
 */
router.post('/upload', upload.array('files', 5), PDFController.uploadFiles);

/**
 * @route POST /api/v1/pdf/compress
 * @desc Compress uploaded PDF files
 * @access Public
 */
router.post('/compress', PDFController.compressFiles);

/**
 * @route GET /api/v1/pdf/download/:fileName
 * @desc Download compressed PDF file
 * @access Public
 */
router.get('/download/:fileName', PDFController.downloadFile);

/**
 * @route GET /api/v1/pdf/status/:jobId
 * @desc Get compression job status
 * @access Public
 */
router.get('/status/:jobId', PDFController.getStatus);

/**
 * @route GET /api/v1/pdf/options
 * @desc Get available compression options
 * @access Public
 */
router.get('/options', PDFController.getCompressionOptions);

/**
 * @route GET /api/v1/pdf
 * @desc PDF API documentation
 * @access Public
 */
router.get('/', (req, res) => {
  res.json({
    message: 'PDF Compression API',
    version: '1.0.0',
    endpoints: {
      upload: {
        method: 'POST',
        path: '/upload',
        description: 'Upload PDF files for compression',
        parameters: {
          files: 'PDF files (max 5 files, 50MB each)'
        }
      },
      compress: {
        method: 'POST',
        path: '/compress',
        description: 'Compress uploaded PDF files',
        parameters: {
          files: 'Array of file objects with id, name, size',
          options: 'Compression options object'
        }
      },
      download: {
        method: 'GET',
        path: '/download/:fileName',
        description: 'Download compressed PDF file',
        parameters: {
          fileName: 'Name of the compressed file'
        }
      },
      status: {
        method: 'GET',
        path: '/status/:jobId',
        description: 'Get compression job status',
        parameters: {
          jobId: 'Compression job ID'
        }
      },
      options: {
        method: 'GET',
        path: '/options',
        description: 'Get available compression options'
      }
    },
    usage: {
      step1: 'Upload PDF files using POST /upload',
      step2: 'Get compression options using GET /options',
      step3: 'Compress files using POST /compress with file IDs and options',
      step4: 'Download compressed files using GET /download/:fileName'
    },
    limits: {
      maxFileSize: '50MB per file',
      maxFiles: '5 files per request',
      supportedFormats: ['PDF']
    }
  });
});

// Error handler for multer
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 50MB per file.'
      });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 5 files per request.'
      });
      return;
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: 'Unexpected file field. Use "files" field name.'
      });
      return;
    }
  }
  
  if (error.message === 'Only PDF files are allowed') {
    res.status(400).json({
      success: false,
      error: 'Only PDF files are allowed.'
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error during file upload.'
  });
});

export default router;
