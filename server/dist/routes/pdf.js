"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const pdfController_1 = require("../controllers/pdfController");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../uploads');
        await fs_extra_1.default.ensureDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}.pdf`;
        cb(null, uniqueName);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF files are allowed'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 5
    }
});
router.post('/upload', upload.array('files', 5), pdfController_1.PDFController.uploadFiles);
router.post('/compress', pdfController_1.PDFController.compressFiles);
router.get('/download/:fileName', pdfController_1.PDFController.downloadFile);
router.get('/status/:jobId', pdfController_1.PDFController.getStatus);
router.get('/options', pdfController_1.PDFController.getCompressionOptions);
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
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
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
exports.default = router;
//# sourceMappingURL=pdf.js.map