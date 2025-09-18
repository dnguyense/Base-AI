import { Request, Response } from 'express';
import { PDFController } from '../../controllers/pdfController';
import { pdfService, PDFCompressionService } from '../../services/pdfService';
import fs from 'fs-extra';

// Mock dependencies
jest.mock('../../services/pdfService');
jest.mock('fs-extra');

const mockPdfService = pdfService as jest.Mocked<typeof pdfService>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockPDFCompressionService = PDFCompressionService as jest.MockedClass<typeof PDFCompressionService>;

describe('PDFController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
      send: jest.fn(),
      download: jest.fn(),
    };
    
    mockReq = {
      files: [],
      body: {},
      params: {},
    };

    jest.clearAllMocks();
    mockFs.remove.mockResolvedValue();
    
    // Reset all fs spies
    jest.restoreAllMocks();
  });

  describe('uploadFiles', () => {
    it('should return error when no files are uploaded', async () => {
      mockReq.files = [];

      await PDFController.uploadFiles(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'No files uploaded'
      });
    });

    it('should return error for non-PDF files', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        path: '/temp/test.txt',
        size: 1000,
      };
      
      mockReq.files = [mockFile as Express.Multer.File];

      await PDFController.uploadFiles(mockReq as Request, mockRes as Response);

      expect(mockFs.remove).toHaveBeenCalledWith(mockFile.path);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'File test.txt is not a PDF'
      });
    });

    it('should successfully process PDF files', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        path: '/temp/test.pdf',
        size: 1000,
        filename: 'test.pdf',
        destination: '/temp',
      };
      
      mockReq.files = [mockFile as Express.Multer.File];
      
      // Mock PDF validation (static method)
      mockPDFCompressionService.validatePDFFile = jest.fn().mockResolvedValue({ valid: true });

      await PDFController.uploadFiles(mockReq as Request, mockRes as Response);

      // The implementation doesn't set status explicitly for success, it defaults to 200
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Files uploaded successfully',
        files: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            originalName: 'test.pdf',
            fileName: 'test.pdf',
            size: 1000,
            path: '/temp/test.pdf',
            mimetype: 'application/pdf'
          })
        ])
      });
    });

    it('should return error for invalid PDF files', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'invalid.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        path: '/temp/invalid.pdf',
        size: 1000,
      };
      
      mockReq.files = [mockFile as Express.Multer.File];
      
      // Mock PDF validation failure (static method)
      mockPDFCompressionService.validatePDFFile = jest.fn().mockResolvedValue({ valid: false, error: 'Corrupted PDF file' });

      await PDFController.uploadFiles(mockReq as Request, mockRes as Response);

      expect(mockFs.remove).toHaveBeenCalledWith(mockFile.path);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid PDF file invalid.pdf: Corrupted PDF file'
      });
    });

    it('should handle multiple files', async () => {
      const mockFiles = [
        {
          fieldname: 'file',
          originalname: 'test1.pdf',
          encoding: '7bit',
          mimetype: 'application/pdf',
          path: '/temp/test1.pdf',
          size: 1000,
          filename: 'test1.pdf',
          destination: '/temp'
        },
        {
          fieldname: 'file',
          originalname: 'test2.pdf',
          encoding: '7bit',
          mimetype: 'application/pdf',
          path: '/temp/test2.pdf',
          size: 2000,
          filename: 'test2.pdf',
          destination: '/temp'
        }
      ];
      
      mockReq.files = mockFiles as Express.Multer.File[];
      
      // Mock PDF validation (static method)
      mockPDFCompressionService.validatePDFFile = jest.fn().mockResolvedValue({ valid: true });

      await PDFController.uploadFiles(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Files uploaded successfully',
        files: expect.arrayContaining([
          expect.objectContaining({ originalName: 'test1.pdf', size: 1000 }),
          expect.objectContaining({ originalName: 'test2.pdf', size: 2000 })
        ])
      });
    });
  });

  describe('compressFiles', () => {
    beforeEach(() => {
      mockReq.body = {
        files: [
          { id: 'file1', name: 'test1.pdf', size: 1000 }
        ],
        options: {
          quality: 'medium',
          removeMetadata: true,
          removeAnnotations: false,
          removeImages: false,
          optimizeImages: true,
          imageQuality: 60,
          customDPI: 150
        }
      };
    });

    it('should successfully compress files', async () => {
      // Mock fs.pathExists to return true
      jest.spyOn(fs, 'pathExists').mockResolvedValue(true);

      const mockCompressionResult = {
        success: true,
        originalSize: 1000,
        compressedSize: 500,
        compressionRatio: 50,
        outputPath: '/compressed/test.pdf',
        fileName: 'compressed_test.pdf'
      };

      mockPdfService.compressPDF.mockResolvedValue(mockCompressionResult);
      mockPdfService.getUploadDir.mockReturnValue('/uploads');
      mockPdfService.cleanupFile.mockResolvedValue();

      await PDFController.compressFiles(mockReq as Request, mockRes as Response);

      expect(mockPdfService.compressPDF).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Compression completed',
        results: expect.arrayContaining([
          expect.objectContaining({
            id: 'file1',
            originalName: 'test1.pdf',
            originalSize: 1000,
            compressedSize: 500,
            compressionRatio: 50,
            fileName: 'compressed_test.pdf',
            success: true,
            downloadUrl: '/api/v1/pdf/download/compressed_test.pdf'
          })
        ])
      });
    });

    it('should handle compression errors', async () => {
      // Mock fs.pathExists to return true
      jest.spyOn(fs, 'pathExists').mockResolvedValue(true);

      const mockCompressionResult = {
        success: false,
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        outputPath: '',
        fileName: '',
        error: 'Compression failed'
      };

      mockPdfService.compressPDF.mockResolvedValue(mockCompressionResult);
      mockPdfService.getUploadDir.mockReturnValue('/uploads');

      await PDFController.compressFiles(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Compression completed',
        results: expect.arrayContaining([
          expect.objectContaining({
            id: 'file1',
            originalName: 'test1.pdf',
            originalSize: 0,
            compressedSize: 0,
            compressionRatio: 0,
            fileName: '',
            downloadUrl: null,
            success: false,
            error: 'Compression failed'
          })
        ])
      });
    });

    it('should return error for missing files', async () => {
      mockReq.body = { options: { quality: 'medium' } };

      await PDFController.compressFiles(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'No files specified for compression'
      });
    });

    it('should handle missing options by using defaults', async () => {
      mockReq.body = { 
        files: [{ id: 'file1', name: 'test1.pdf', size: 1000 }] 
      };

      // Mock fs.pathExists to return true
      jest.spyOn(fs, 'pathExists').mockResolvedValue(true);

      // Mock successful compression
      const mockCompressionResult = {
        success: true,
        originalSize: 1000,
        compressedSize: 500,
        compressionRatio: 50,
        outputPath: '/compressed/test.pdf',
        fileName: 'compressed_test.pdf'
      };

      mockPdfService.compressPDF.mockResolvedValue(mockCompressionResult);
      mockPdfService.getUploadDir.mockReturnValue('/uploads');
      mockPdfService.cleanupFile.mockResolvedValue();

      await PDFController.compressFiles(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Compression completed',
        results: expect.arrayContaining([
          expect.objectContaining({
            id: 'file1',
            originalName: 'test1.pdf',
            success: true,
            compressionRatio: 50,
            downloadUrl: '/api/v1/pdf/download/compressed_test.pdf'
          })
        ])
      });
    });
  });
});