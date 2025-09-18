"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFController = void 0;
const pdfService_1 = require("../services/pdfService");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class PDFController {
    static async uploadFiles(req, res) {
        try {
            const files = req.files;
            if (!files || (Array.isArray(files) && files.length === 0)) {
                res.status(400).json({
                    success: false,
                    error: 'No files uploaded'
                });
                return;
            }
            const uploadedFiles = Array.isArray(files) ? files : Object.values(files).flat();
            const processedFiles = [];
            for (const file of uploadedFiles) {
                if (file.mimetype !== 'application/pdf') {
                    await fs_extra_1.default.remove(file.path);
                    res.status(400).json({
                        success: false,
                        error: `File ${file.originalname} is not a PDF`
                    });
                    return;
                }
                const validation = await pdfService_1.PDFCompressionService.validatePDFFile(file.path);
                if (!validation.valid) {
                    await fs_extra_1.default.remove(file.path);
                    res.status(400).json({
                        success: false,
                        error: `Invalid PDF file ${file.originalname}: ${validation.error}`
                    });
                    return;
                }
                processedFiles.push({
                    id: (0, uuid_1.v4)(),
                    originalName: file.originalname,
                    fileName: file.filename,
                    size: file.size,
                    path: file.path,
                    mimetype: file.mimetype
                });
            }
            res.status(200).json({
                success: true,
                message: 'Files uploaded successfully',
                files: processedFiles
            });
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during file upload'
            });
        }
    }
    static async compressFiles(req, res) {
        try {
            const { files, options } = req.body;
            if (!files || files.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'No files specified for compression'
                });
                return;
            }
            const validatedOptions = PDFController.validateCompressionOptions(options);
            const compressionResults = [];
            const uploadDir = pdfService_1.pdfService.getUploadDir();
            for (const fileInfo of files) {
                const filePath = path_1.default.join(uploadDir, `${fileInfo.id}.pdf`);
                if (!(await fs_extra_1.default.pathExists(filePath))) {
                    compressionResults.push({
                        id: fileInfo.id,
                        success: false,
                        error: 'File not found'
                    });
                    continue;
                }
                const result = await pdfService_1.pdfService.compressPDF(filePath, validatedOptions);
                compressionResults.push({
                    id: fileInfo.id,
                    originalName: fileInfo.name,
                    originalSize: result.originalSize,
                    compressedSize: result.compressedSize,
                    compressionRatio: result.compressionRatio,
                    fileName: result.fileName,
                    downloadUrl: result.success ? `/api/v1/pdf/download/${result.fileName}` : null,
                    success: result.success,
                    error: result.error
                });
                if (result.success) {
                    await pdfService_1.pdfService.cleanupFile(filePath);
                }
            }
            res.status(200).json({
                success: true,
                message: 'Compression completed',
                results: compressionResults
            });
        }
        catch (error) {
            console.error('Compression error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during compression'
            });
        }
    }
    static async downloadFile(req, res) {
        try {
            const { fileName } = req.params;
            if (!fileName || !fileName.endsWith('.pdf')) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid file name'
                });
                return;
            }
            const filePath = path_1.default.join(pdfService_1.pdfService.getOutputDir(), fileName);
            if (!(await fs_extra_1.default.pathExists(filePath))) {
                res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
                return;
            }
            const stats = await fs_extra_1.default.stat(filePath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Cache-Control', 'no-cache');
            const fileStream = fs_extra_1.default.createReadStream(filePath);
            fileStream.pipe(res);
            fileStream.on('end', async () => {
                setTimeout(async () => {
                    await pdfService_1.pdfService.cleanupFile(filePath);
                }, 60000);
            });
        }
        catch (error) {
            console.error('Download error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during download'
            });
        }
    }
    static async getStatus(req, res) {
        try {
            const { jobId } = req.params;
            res.status(200).json({
                success: true,
                jobId,
                status: 'completed',
                message: 'Job status retrieved successfully'
            });
        }
        catch (error) {
            console.error('Status error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getCompressionOptions(req, res) {
        try {
            const options = {
                quality: {
                    type: 'select',
                    options: [
                        { value: 'low', label: 'Low Quality (Smallest file)', description: 'Maximum compression, lowest quality' },
                        { value: 'medium', label: 'Medium Quality (Recommended)', description: 'Balanced compression and quality' },
                        { value: 'high', label: 'High Quality (Larger file)', description: 'Minimal compression, best quality' },
                        { value: 'custom', label: 'Custom Settings', description: 'Configure your own settings' }
                    ],
                    default: 'medium'
                },
                removeMetadata: {
                    type: 'boolean',
                    label: 'Remove Metadata',
                    description: 'Remove document metadata to reduce file size',
                    default: true
                },
                removeAnnotations: {
                    type: 'boolean',
                    label: 'Remove Annotations',
                    description: 'Remove comments and annotations',
                    default: false
                },
                optimizeImages: {
                    type: 'boolean',
                    label: 'Optimize Images',
                    description: 'Compress embedded images',
                    default: true
                },
                imageQuality: {
                    type: 'range',
                    label: 'Image Quality',
                    description: 'Image compression quality (0-100)',
                    min: 10,
                    max: 100,
                    default: 60,
                    dependsOn: 'quality',
                    showWhen: 'custom'
                },
                customDPI: {
                    type: 'number',
                    label: 'DPI',
                    description: 'Dots per inch for image resolution',
                    min: 72,
                    max: 300,
                    default: 150,
                    dependsOn: 'quality',
                    showWhen: 'custom'
                }
            };
            res.status(200).json({
                success: true,
                options
            });
        }
        catch (error) {
            console.error('Options error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static validateCompressionOptions(options) {
        const defaults = {
            quality: 'medium',
            removeMetadata: true,
            removeAnnotations: false,
            removeImages: false,
            optimizeImages: true,
            imageQuality: 60,
            customDPI: 150
        };
        const validated = { ...defaults };
        if (!options) {
            return validated;
        }
        if (options.quality && ['low', 'medium', 'high', 'custom'].includes(options.quality)) {
            validated.quality = options.quality;
        }
        if (typeof options.removeMetadata === 'boolean') {
            validated.removeMetadata = options.removeMetadata;
        }
        if (typeof options.removeAnnotations === 'boolean') {
            validated.removeAnnotations = options.removeAnnotations;
        }
        if (typeof options.removeImages === 'boolean') {
            validated.removeImages = options.removeImages;
        }
        if (typeof options.optimizeImages === 'boolean') {
            validated.optimizeImages = options.optimizeImages;
        }
        if (options.imageQuality && options.imageQuality >= 10 && options.imageQuality <= 100) {
            validated.imageQuality = options.imageQuality;
        }
        if (options.customDPI && options.customDPI >= 72 && options.customDPI <= 300) {
            validated.customDPI = options.customDPI;
        }
        return validated;
    }
}
exports.PDFController = PDFController;
exports.default = PDFController;
//# sourceMappingURL=pdfController.js.map