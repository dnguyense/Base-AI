"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfService = exports.PDFCompressionService = void 0;
const pdf_lib_1 = require("pdf-lib");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class PDFCompressionService {
    constructor() {
        this.uploadDir = path_1.default.join(__dirname, '../../uploads');
        this.outputDir = path_1.default.join(__dirname, '../../compressed');
        this.ensureDirectories();
    }
    async ensureDirectories() {
        await fs_extra_1.default.ensureDir(this.uploadDir);
        await fs_extra_1.default.ensureDir(this.outputDir);
    }
    async compressPDF(filePath, options) {
        try {
            const originalBytes = await fs_extra_1.default.readFile(filePath);
            const originalSize = originalBytes.length;
            const pdfDoc = await pdf_lib_1.PDFDocument.load(originalBytes);
            await this.applyCompressionOptions(pdfDoc, options);
            const fileName = `compressed_${(0, uuid_1.v4)()}.pdf`;
            const outputPath = path_1.default.join(this.outputDir, fileName);
            const compressedBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                updateFieldAppearances: false
            });
            await fs_extra_1.default.writeFile(outputPath, compressedBytes);
            const compressedSize = compressedBytes.length;
            const compressionRatio = this.calculateCompressionRatio(originalSize, compressedSize);
            return {
                success: true,
                originalSize,
                compressedSize,
                compressionRatio,
                outputPath,
                fileName,
            };
        }
        catch (error) {
            console.error('PDF compression error:', error);
            return {
                success: false,
                originalSize: 0,
                compressedSize: 0,
                compressionRatio: 0,
                outputPath: '',
                fileName: '',
                error: error instanceof Error ? error.message : 'Unknown compression error'
            };
        }
    }
    async applyCompressionOptions(pdfDoc, options) {
        if (options.removeMetadata) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setCreator('PDF Compressor Pro');
            pdfDoc.setProducer('PDF Compressor Pro');
            pdfDoc.setCreationDate(new Date());
            pdfDoc.setModificationDate(new Date());
        }
        if (options.removeAnnotations) {
            const pages = pdfDoc.getPages();
            pages.forEach(page => {
                const annotations = page.node.get(page.node.context.obj('Annots'));
                if (annotations) {
                    page.node.delete(page.node.context.obj('Annots'));
                }
            });
        }
        await this.applyQualityCompression(pdfDoc, options);
    }
    async applyQualityCompression(pdfDoc, options) {
        const pages = pdfDoc.getPages();
        const qualitySettings = {
            low: { imageQuality: 30, dpi: 72 },
            medium: { imageQuality: 60, dpi: 150 },
            high: { imageQuality: 85, dpi: 300 },
            custom: {
                imageQuality: options.imageQuality || 60,
                dpi: options.customDPI || 150
            }
        };
        const settings = qualitySettings[options.quality];
        for (const page of pages) {
            if (options.optimizeImages) {
                await this.optimizePageImages(page, settings.imageQuality);
            }
            if (options.quality === 'low') {
                await this.reducePageQuality(page);
            }
        }
    }
    async optimizePageImages(page, quality) {
        try {
            const contentStreams = page.node.get(page.node.context.obj('Contents'));
            if (contentStreams) {
            }
        }
        catch (error) {
            console.warn('Image optimization failed:', error);
        }
    }
    async reducePageQuality(page) {
        try {
            const { width, height } = page.getSize();
        }
        catch (error) {
            console.warn('Page quality reduction failed:', error);
        }
    }
    calculateCompressionRatio(originalSize, compressedSize) {
        if (originalSize === 0)
            return 0;
        return Math.round(((originalSize - compressedSize) / originalSize) * 100);
    }
    static formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    static async validatePDFFile(filePath) {
        try {
            const fileStats = await fs_extra_1.default.stat(filePath);
            if (fileStats.size > 50 * 1024 * 1024) {
                return { valid: false, error: 'File size exceeds 50MB limit' };
            }
            const pdfBytes = await fs_extra_1.default.readFile(filePath);
            await pdf_lib_1.PDFDocument.load(pdfBytes);
            return { valid: true };
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Invalid PDF file'
            };
        }
    }
    async cleanupFile(filePath) {
        try {
            await fs_extra_1.default.remove(filePath);
        }
        catch (error) {
            console.warn('Failed to cleanup file:', filePath, error);
        }
    }
    getUploadDir() {
        return this.uploadDir;
    }
    getOutputDir() {
        return this.outputDir;
    }
}
exports.PDFCompressionService = PDFCompressionService;
exports.pdfService = new PDFCompressionService();
//# sourceMappingURL=pdfService.js.map