import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface CompressionOptions {
  quality: 'low' | 'medium' | 'high' | 'custom';
  removeMetadata?: boolean;
  removeAnnotations?: boolean;
  removeImages?: boolean;
  optimizeImages?: boolean;
  imageQuality?: number; // 0-100
  customDPI?: number; // For custom quality
}

export interface CompressionResult {
  success: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  outputPath: string;
  fileName: string;
  error?: string;
}

export class PDFCompressionService {
  private uploadDir: string;
  private outputDir: string;
  private ghostscriptChecked = false;
  private ghostscriptAvailable = false;

  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.outputDir = path.join(__dirname, '../../compressed');
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    await fs.ensureDir(this.uploadDir);
    await fs.ensureDir(this.outputDir);
  }

  /**
   * Compress a PDF file based on provided options
   */
  async compressPDF(filePath: string, options: CompressionOptions): Promise<CompressionResult> {
    try {
      // Read the original PDF
      const originalBytes = await fs.readFile(filePath);
      const originalSize = originalBytes.length;

      // Generate output file name
      const fileName = `compressed_${uuidv4()}.pdf`;
      const outputPath = path.join(this.outputDir, fileName);

      const nativeResult = await this.tryNativeCompression(filePath, outputPath, originalSize, options);
      if (nativeResult) {
        return nativeResult;
      }

      return await this.compressWithPdfLib(originalBytes, originalSize, outputPath, fileName, options);
    } catch (error) {
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

  private async compressWithPdfLib(
    originalBytes: Buffer,
    originalSize: number,
    outputPath: string,
    fileName: string,
    options: CompressionOptions
  ): Promise<CompressionResult> {
    const pdfDoc = await PDFDocument.load(originalBytes);

    // Apply compression based on options
    await this.applyCompressionOptions(pdfDoc, options);

    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false
    });

    await fs.writeFile(outputPath, compressedBytes);

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

  private async tryNativeCompression(
    inputPath: string,
    outputPath: string,
    originalSize: number,
    options: CompressionOptions
  ): Promise<CompressionResult | null> {
    const available = await this.ensureGhostscriptAvailable();
    if (!available) {
      return null;
    }

    const args = this.buildGhostscriptArgs(inputPath, outputPath, options);

    try {
      await this.runGhostscript(args);
      const compressedStats = await fs.stat(outputPath);

      if (!compressedStats || compressedStats.size >= originalSize || compressedStats.size === 0) {
        await fs.remove(outputPath).catch(() => {});
        return null;
      }

      return {
        success: true,
        originalSize,
        compressedSize: compressedStats.size,
        compressionRatio: this.calculateCompressionRatio(originalSize, compressedStats.size),
        outputPath,
        fileName: path.basename(outputPath),
      };
    } catch (error) {
      await fs.remove(outputPath).catch(() => {});
      return null;
    }
  }

  private async ensureGhostscriptAvailable(): Promise<boolean> {
    if (this.ghostscriptChecked) {
      return this.ghostscriptAvailable;
    }

    this.ghostscriptChecked = true;

    try {
      await this.runGhostscript(['-version']);
      this.ghostscriptAvailable = true;
    } catch (error) {
      this.ghostscriptAvailable = false;
    }

    return this.ghostscriptAvailable;
  }

  private runGhostscript(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const gsProcess = spawn('gs', args, { stdio: 'ignore' });

      gsProcess.on('error', (error) => {
        reject(error);
      });

      gsProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Ghostscript exited with code ${code}`));
        }
      });
    });
  }

  private buildGhostscriptArgs(inputPath: string, outputPath: string, options: CompressionOptions): string[] {
    const preset = this.getGhostscriptPreset(options.quality);

    const args = [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${preset}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
    ];

    if (options.quality === 'custom' && options.imageQuality) {
      const dpi = options.customDPI || 150;
      args.push(
        '-dAutoFilterColorImages=false',
        '-dAutoFilterGrayImages=false',
        '-dColorImageDownsampleType=/Average',
        `-dColorImageResolution=${dpi}`,
        '-dGrayImageDownsampleType=/Average',
        `-dGrayImageResolution=${dpi}`,
        '-dMonoImageDownsampleType=/Subsample',
        `-dMonoImageResolution=${Math.max(72, Math.min(dpi, 600))}`,
        `-dJPEGQ=${Math.max(10, Math.min(options.imageQuality, 95))}`
      );
    }

    args.push(`-sOutputFile=${outputPath}`);
    args.push(inputPath);

    return args;
  }

  private getGhostscriptPreset(quality: CompressionOptions['quality']): string {
    switch (quality) {
      case 'low':
        return '/screen';
      case 'high':
        return '/printer';
      case 'custom':
        return '/default';
      case 'medium':
      default:
        return '/ebook';
    }
  }

  /**
   * Apply compression options to PDF document
   */
  private async applyCompressionOptions(pdfDoc: PDFDocument, options: CompressionOptions): Promise<void> {
    // Remove metadata if requested
    if (options.removeMetadata) {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setCreator('PDF Compressor Pro');
      pdfDoc.setProducer('PDF Compressor Pro');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());
    }

    // Remove annotations if requested
    if (options.removeAnnotations) {
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        // Remove annotations (simplified approach)
        const annotations = page.node.get(page.node.context.obj('Annots'));
        if (annotations) {
          page.node.delete(page.node.context.obj('Annots'));
        }
      });
    }

    // Apply quality-based compression
    await this.applyQualityCompression(pdfDoc, options);
  }

  /**
   * Apply quality-based compression settings
   */
  private async applyQualityCompression(pdfDoc: PDFDocument, options: CompressionOptions): Promise<void> {
    const pages = pdfDoc.getPages();
    
    // Quality settings mapping
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
    
    // Apply compression to each page
    for (const page of pages) {
      if (options.optimizeImages) {
        await this.optimizePageImages(page, settings.imageQuality);
      }
      
      // Reduce page quality for lower settings
      if (options.quality === 'low') {
        await this.reducePageQuality(page);
      }
    }
  }

  /**
   * Optimize images on a PDF page
   */
  private async optimizePageImages(page: PDFPage, quality: number): Promise<void> {
    try {
      // This is a simplified approach - in a real implementation,
      // you would need to extract, compress, and re-embed images
      // For now, we'll apply general page optimization
      
      // Reduce image quality by adjusting page content streams
      const contentStreams = page.node.get(page.node.context.obj('Contents'));
      if (contentStreams) {
        // Apply image quality reduction (simplified)
        // In a full implementation, you would parse and modify image objects
      }
    } catch (error) {
      console.warn('Image optimization failed:', error);
    }
  }

  /**
   * Reduce page quality for aggressive compression
   */
  private async reducePageQuality(page: PDFPage): Promise<void> {
    try {
      // Remove unnecessary elements and reduce quality
      const { width, height } = page.getSize();
      
      // Reduce page complexity (simplified approach)
      // In a real implementation, you might:
      // - Reduce color depth
      // - Remove unnecessary graphics states
      // - Simplify vector graphics
      
    } catch (error) {
      console.warn('Page quality reduction failed:', error);
    }
  }

  /**
   * Calculate compression ratio as percentage
   */
  private calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  }

  /**
   * Get file size in a human-readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate PDF file
   */
  static async validatePDFFile(filePath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const fileStats = await fs.stat(filePath);
      
      // Check file size (max 50MB)
      if (fileStats.size > 50 * 1024 * 1024) {
        return { valid: false, error: 'File size exceeds 50MB limit' };
      }

      // Try to load the PDF to validate it
      const pdfBytes = await fs.readFile(filePath);
      await PDFDocument.load(pdfBytes);
      
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid PDF file' 
      };
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.remove(filePath);
    } catch (error) {
      console.warn('Failed to cleanup file:', filePath, error);
    }
  }

  /**
   * Get upload directory path
   */
  getUploadDir(): string {
    return this.uploadDir;
  }

  /**
   * Get output directory path
   */
  getOutputDir(): string {
    return this.outputDir;
  }
}

// Create singleton instance
export const pdfService = new PDFCompressionService();
