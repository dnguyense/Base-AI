import { Request, Response } from 'express';
import { pdfService, CompressionOptions, PDFCompressionService } from '../services/pdfService';
import fs from 'fs-extra';
import path from 'path';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export interface CompressionRequest {
  files: Array<{
    id: string;
    name: string;
    size: number;
    fileName?: string;
    storageName?: string;
  }>;
  options: CompressionOptions;
}

export class PDFController {
  /**
   * Upload PDF files for compression
   */
  static async uploadFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
      
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
        // Validate file type
        if (file.mimetype !== 'application/pdf') {
          await fs.remove(file.path);
          res.status(400).json({
            success: false,
            error: `File ${file.originalname} is not a PDF`
          });
          return;
        }

        // Validate PDF file
        const validation = await PDFCompressionService.validatePDFFile(file.path);
        if (!validation.valid) {
          await fs.remove(file.path);
          res.status(400).json({
            success: false,
            error: `Invalid PDF file ${file.originalname}: ${validation.error}`
          });
          return;
        }

        const storageName = file.filename;
        const storageId = path.parse(storageName).name;

        processedFiles.push({
          id: storageId,
          originalName: file.originalname,
          name: file.originalname,
          fileName: storageName,
          storageName,
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

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during file upload'
      });
    }
  }

  /**
   * Compress uploaded PDF files
   */
  static async compressFiles(req: Request, res: Response): Promise<void> {
    try {
      const { files, options } = req.body as CompressionRequest;

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No files specified for compression'
        });
        return;
      }

      // Validate compression options
      const validatedOptions = PDFController.validateCompressionOptions(options);
      
      const compressionResults = [];
      const uploadDir = pdfService.getUploadDir();

      for (const fileInfo of files) {
        const storageName = fileInfo.storageName || fileInfo.fileName || `${fileInfo.id}.pdf`;
        const filePath = path.join(uploadDir, storageName);
        const originalName = fileInfo.name || (fileInfo as any).originalName || storageName;

        // Check if file exists
        if (!(await fs.pathExists(filePath))) {
          compressionResults.push({
            id: fileInfo.id,
            success: false,
            originalName,
            error: 'File not found'
          });
          continue;
        }

        // Compress the file
        const result = await pdfService.compressPDF(filePath, validatedOptions);

        compressionResults.push({
          id: fileInfo.id,
          originalName,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          fileName: result.fileName,
          downloadUrl: result.success ? `/api/v1/pdf/download/${result.fileName}` : null,
          success: result.success,
          error: result.error
        });

        // Clean up original file after compression
        if (result.success) {
          await pdfService.cleanupFile(filePath);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Compression completed',
        results: compressionResults
      });

    } catch (error) {
      console.error('Compression error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during compression'
      });
    }
  }

  /**
   * Download compressed PDF file
   */
  static async downloadFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;
      
      if (!fileName || !fileName.endsWith('.pdf')) {
        res.status(400).json({
          success: false,
          error: 'Invalid file name'
        });
        return;
      }

      const filePath = path.join(pdfService.getOutputDir(), fileName);
      
      if (!(await fs.pathExists(filePath))) {
        res.status(404).json({
          success: false,
          error: 'File not found'
        });
        return;
      }

      const stats = await fs.stat(filePath);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Clean up file after download (optional - you might want to keep files for some time)
      fileStream.on('end', async () => {
        setTimeout(async () => {
          await pdfService.cleanupFile(filePath);
        }, 60000); // Delete after 1 minute
      });

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during download'
      });
    }
  }

  /**
   * Get compression job status
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      
      // In a real implementation, you would track compression jobs
      // For now, we'll return a simple status
      res.status(200).json({
        success: true,
        jobId,
        status: 'completed', // pending, processing, completed, failed
        message: 'Job status retrieved successfully'
      });

    } catch (error) {
      console.error('Status error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get available compression options
   */
  static async getCompressionOptions(req: Request, res: Response): Promise<void> {
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

    } catch (error) {
      console.error('Options error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Validate and normalize compression options
   */
  private static validateCompressionOptions(options?: Partial<CompressionOptions>): CompressionOptions {
    const defaults: CompressionOptions = {
      quality: 'medium',
      removeMetadata: true,
      removeAnnotations: false,
      removeImages: false,
      optimizeImages: true,
      imageQuality: 60,
      customDPI: 150
    };

    const validated: CompressionOptions = { ...defaults };

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

export default PDFController;
