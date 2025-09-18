import { EventEmitter } from 'events';
import { PDFCompressionService, CompressionOptions } from '../../services/pdfService';
import fs from 'fs-extra';
import { PDFDocument } from 'pdf-lib';

jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

// Mock dependencies
jest.mock('fs-extra');
jest.mock('pdf-lib', () => ({
  PDFDocument: {
    load: jest.fn(),
    create: jest.fn(),
  },
  rgb: jest.fn(),
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPDFDocument = PDFDocument as jest.Mocked<typeof PDFDocument>;
const mockSpawn = require('child_process').spawn as jest.Mock;

describe('PDFCompressionService', () => {
  let pdfService: PDFCompressionService;
  let mockPdfDoc: any;

  beforeEach(() => {
    pdfService = new PDFCompressionService();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock PDF document
    mockPdfDoc = {
      save: jest.fn().mockResolvedValue(Buffer.from('compressed')),
      getPages: jest.fn().mockReturnValue([]),
      setTitle: jest.fn(),
      setAuthor: jest.fn(),
      setSubject: jest.fn(),
      setCreator: jest.fn(),
      setProducer: jest.fn(),
      setCreationDate: jest.fn(),
      setModificationDate: jest.fn(),
    };
    
    mockPDFDocument.load.mockResolvedValue(mockPdfDoc);
    mockFs.ensureDir.mockResolvedValue(undefined);
    mockFs.readFile.mockResolvedValue(Buffer.from('original pdf data'));
    mockFs.writeFile.mockResolvedValue(undefined);
    mockFs.stat.mockResolvedValue({ size: 1024 } as any);
    mockFs.remove.mockResolvedValue(undefined);

    mockSpawn.mockImplementation(() => {
      const proc = new EventEmitter() as any;
      setImmediate(() => proc.emit('error', Object.assign(new Error('gs not found'), { code: 'ENOENT' })));
      return proc;
    });
  });

  describe('compressPDF', () => {
    const mockFilePath = '/test/file.pdf';
    const mockOptions: CompressionOptions = {
      quality: 'medium',
      removeMetadata: true,
      removeAnnotations: true,
      optimizeImages: true,
      imageQuality: 60
    };

    it('should successfully compress a PDF file', async () => {
      const result = await pdfService.compressPDF(mockFilePath, mockOptions);

      expect(result.success).toBe(true);
      expect(result.originalSize).toBe(17); // Length of 'original pdf data'
      expect(result.compressedSize).toBe(10); // Length of 'compressed'
      expect(result.compressionRatio).toBeGreaterThanOrEqual(0);
      expect(result.outputPath).toContain('compressed_');
      expect(result.fileName).toContain('compressed_');
      
      expect(mockFs.readFile).toHaveBeenCalledWith(mockFilePath);
      expect(mockPDFDocument.load).toHaveBeenCalled();
      expect(mockPdfDoc.save).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should apply metadata removal when option is enabled', async () => {
      await pdfService.compressPDF(mockFilePath, mockOptions);

      expect(mockPdfDoc.setTitle).toHaveBeenCalledWith('');
      expect(mockPdfDoc.setAuthor).toHaveBeenCalledWith('');
      expect(mockPdfDoc.setCreator).toHaveBeenCalledWith('PDF Compressor Pro');
    });

    it('should handle compression errors gracefully', async () => {
      const error = new Error('PDF loading failed');
      mockPDFDocument.load.mockRejectedValue(error);

      const result = await pdfService.compressPDF(mockFilePath, mockOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('PDF loading failed');
      expect(result.originalSize).toBe(0);
      expect(result.compressedSize).toBe(0);
    });

    it('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await pdfService.compressPDF(mockFilePath, mockOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');
    });

    it('should handle different quality settings', async () => {
      const lowQualityOptions: CompressionOptions = { quality: 'low' };
      const highQualityOptions: CompressionOptions = { quality: 'high' };
      
      // Test low quality
      const lowResult = await pdfService.compressPDF(mockFilePath, lowQualityOptions);
      expect(lowResult.success).toBe(true);
      
      // Test high quality
      const highResult = await pdfService.compressPDF(mockFilePath, highQualityOptions);
      expect(highResult.success).toBe(true);
    });

    it('should handle custom quality settings', async () => {
      const customOptions: CompressionOptions = {
        quality: 'custom',
        imageQuality: 45,
        customDPI: 200
      };
      
      const result = await pdfService.compressPDF(mockFilePath, customOptions);
      expect(result.success).toBe(true);
    });

    it('uses native optimizer when ghostscript is available', async () => {
      const successProcess = () => {
        const proc = new EventEmitter() as any;
        setImmediate(() => proc.emit('close', 0));
        return proc;
      };

      mockSpawn
        .mockImplementationOnce(successProcess) // availability check
        .mockImplementationOnce(successProcess); // compression run

      const statSpy = jest.spyOn(mockFs, 'stat');
      statSpy.mockImplementation(async (targetPath: string) => {
        if (targetPath.includes('compressed_')) {
          return { size: 5 } as any;
        }
        return { size: 1024 } as any;
      });

      const result = await pdfService.compressPDF(mockFilePath, mockOptions);

      expect(result.success).toBe(true);
      expect(result.compressedSize).toBe(5);
      expect(mockSpawn).toHaveBeenCalledTimes(2);
    });
  });

  describe('validatePDFFile', () => {
    it('should validate a correct PDF file', async () => {
      const result = await PDFCompressionService.validatePDFFile('/test/valid.pdf');
      
      expect(result.valid).toBe(true);
      expect(mockFs.stat).toHaveBeenCalled();
      expect(mockPDFDocument.load).toHaveBeenCalled();
    });

    it('should reject files that are too large', async () => {
      mockFs.stat.mockResolvedValue({ size: 51 * 1024 * 1024 } as any); // 51MB
      
      const result = await PDFCompressionService.validatePDFFile('/test/large.pdf');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File size exceeds 50MB limit');
    });

    it('should reject invalid PDF files', async () => {
      mockPDFDocument.load.mockRejectedValue(new Error('Invalid PDF'));
      
      const result = await PDFCompressionService.validatePDFFile('/test/invalid.pdf');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid PDF');
    });

    it('should handle file stat errors', async () => {
      mockFs.stat.mockRejectedValue(new Error('File not found'));
      
      const result = await PDFCompressionService.validatePDFFile('/test/missing.pdf');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File not found');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(PDFCompressionService.formatFileSize(0)).toBe('0 Bytes');
      expect(PDFCompressionService.formatFileSize(1024)).toBe('1 KB');
      expect(PDFCompressionService.formatFileSize(1048576)).toBe('1 MB');
      expect(PDFCompressionService.formatFileSize(1073741824)).toBe('1 GB');
      expect(PDFCompressionService.formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('cleanupFile', () => {
    it('should successfully remove a file', async () => {
      await pdfService.cleanupFile('/test/file.pdf');
      
      expect(mockFs.remove).toHaveBeenCalledWith('/test/file.pdf');
    });

    it('should handle removal errors gracefully', async () => {
      mockFs.remove.mockRejectedValue(new Error('Permission denied'));
      
      // Should not throw
      await expect(pdfService.cleanupFile('/test/file.pdf')).resolves.toBeUndefined();
    });
  });

  describe('getters', () => {
    it('should return correct upload directory', () => {
      const uploadDir = pdfService.getUploadDir();
      expect(uploadDir).toContain('uploads');
    });

    it('should return correct output directory', () => {
      const outputDir = pdfService.getOutputDir();
      expect(outputDir).toContain('compressed');
    });
  });

  describe('calculateCompressionRatio', () => {
    it('should calculate compression ratio correctly', () => {
      // Access private method through any
      const service = pdfService as any;
      
      expect(service.calculateCompressionRatio(1000, 500)).toBe(50);
      expect(service.calculateCompressionRatio(1000, 800)).toBe(20);
      expect(service.calculateCompressionRatio(0, 500)).toBe(0);
    });
  });
});
