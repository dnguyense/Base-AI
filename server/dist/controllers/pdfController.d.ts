import { Request, Response } from 'express';
import { CompressionOptions } from '../services/pdfService';
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
    }>;
    options: CompressionOptions;
}
export declare class PDFController {
    static uploadFiles(req: Request, res: Response): Promise<void>;
    static compressFiles(req: Request, res: Response): Promise<void>;
    static downloadFile(req: Request, res: Response): Promise<void>;
    static getStatus(req: Request, res: Response): Promise<void>;
    static getCompressionOptions(req: Request, res: Response): Promise<void>;
    private static validateCompressionOptions;
}
export default PDFController;
//# sourceMappingURL=pdfController.d.ts.map