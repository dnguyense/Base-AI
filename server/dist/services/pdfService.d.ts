export interface CompressionOptions {
    quality: 'low' | 'medium' | 'high' | 'custom';
    removeMetadata?: boolean;
    removeAnnotations?: boolean;
    removeImages?: boolean;
    optimizeImages?: boolean;
    imageQuality?: number;
    customDPI?: number;
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
export declare class PDFCompressionService {
    private uploadDir;
    private outputDir;
    constructor();
    private ensureDirectories;
    compressPDF(filePath: string, options: CompressionOptions): Promise<CompressionResult>;
    private applyCompressionOptions;
    private applyQualityCompression;
    private optimizePageImages;
    private reducePageQuality;
    private calculateCompressionRatio;
    static formatFileSize(bytes: number): string;
    static validatePDFFile(filePath: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
    cleanupFile(filePath: string): Promise<void>;
    getUploadDir(): string;
    getOutputDir(): string;
}
export declare const pdfService: PDFCompressionService;
//# sourceMappingURL=pdfService.d.ts.map