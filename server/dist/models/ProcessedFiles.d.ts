import { Model, Optional } from 'sequelize';
export interface ProcessedFilesAttributes {
    id: number;
    userId: number;
    originalFileName: string;
    originalFileSize: number;
    compressedFileSize: number;
    compressionRatio: number;
    qualityLevel: 'low' | 'medium' | 'high' | 'custom';
    customQuality?: number;
    processingTimeMs: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    originalFilePath: string;
    compressedFilePath?: string;
    downloadToken: string;
    downloadCount: number;
    maxDownloads: number;
    expiresAt: Date;
    errorMessage?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
interface ProcessedFilesCreationAttributes extends Optional<ProcessedFilesAttributes, 'id' | 'compressedFileSize' | 'compressionRatio' | 'customQuality' | 'compressedFilePath' | 'downloadCount' | 'errorMessage' | 'metadata' | 'createdAt' | 'updatedAt'> {
}
declare class ProcessedFiles extends Model<ProcessedFilesAttributes, ProcessedFilesCreationAttributes> implements ProcessedFilesAttributes {
    id: number;
    userId: number;
    originalFileName: string;
    originalFileSize: number;
    compressedFileSize: number;
    compressionRatio: number;
    qualityLevel: 'low' | 'medium' | 'high' | 'custom';
    customQuality?: number;
    processingTimeMs: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    originalFilePath: string;
    compressedFilePath?: string;
    downloadToken: string;
    downloadCount: number;
    maxDownloads: number;
    expiresAt: Date;
    errorMessage?: string;
    metadata?: Record<string, any>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    getSizeReduction(): number;
    getSizeReductionPercentage(): number;
    isExpired(): boolean;
    canDownload(): boolean;
    incrementDownloadCount(): Promise<void>;
    getProcessingTimeFormatted(): string;
    getFileSizeFormatted(sizeInBytes: number): string;
    getOriginalSizeFormatted(): string;
    getCompressedSizeFormatted(): string;
    toJSON(): ProcessedFilesAttributes;
}
export default ProcessedFiles;
//# sourceMappingURL=ProcessedFiles.d.ts.map