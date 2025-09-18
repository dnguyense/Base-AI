import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { env } from '../config/env';

// ProcessedFiles attributes interface
export interface ProcessedFilesAttributes {
  id: number;
  userId: number;
  originalFileName: string;
  originalFileSize: number; // in bytes
  compressedFileSize: number; // in bytes
  compressionRatio: number; // percentage (0-100)
  qualityLevel: 'low' | 'medium' | 'high' | 'custom';
  customQuality?: number; // 10-100 for custom quality
  processingTimeMs: number; // processing time in milliseconds
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  originalFilePath: string;
  compressedFilePath?: string;
  downloadToken: string; // secure token for downloads
  downloadCount: number;
  maxDownloads: number;
  expiresAt: Date;
  errorMessage?: string;
  metadata?: Record<string, any>; // additional file metadata
  createdAt: Date;
  updatedAt: Date;
}

// Optional attributes for model creation
interface ProcessedFilesCreationAttributes extends Optional<ProcessedFilesAttributes,
  'id' | 'compressedFileSize' | 'compressionRatio' | 'customQuality' | 'compressedFilePath' |
  'downloadCount' | 'errorMessage' | 'metadata' | 'createdAt' | 'updatedAt'
> {}

// ProcessedFiles model class
class ProcessedFiles extends Model<ProcessedFilesAttributes, ProcessedFilesCreationAttributes> implements ProcessedFilesAttributes {
  public id!: number;
  public userId!: number;
  public originalFileName!: string;
  public originalFileSize!: number;
  public compressedFileSize!: number;
  public compressionRatio!: number;
  public qualityLevel!: 'low' | 'medium' | 'high' | 'custom';
  public customQuality?: number;
  public processingTimeMs!: number;
  public status!: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  public originalFilePath!: string;
  public compressedFilePath?: string;
  public downloadToken!: string;
  public downloadCount!: number;
  public maxDownloads!: number;
  public expiresAt!: Date;
  public errorMessage?: string;
  public metadata?: Record<string, any>;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public getSizeReduction(): number {
    if (!this.compressedFileSize || this.originalFileSize === 0) return 0;
    return this.originalFileSize - this.compressedFileSize;
  }

  public getSizeReductionPercentage(): number {
    if (!this.compressedFileSize || this.originalFileSize === 0) return 0;
    return Math.round(((this.originalFileSize - this.compressedFileSize) / this.originalFileSize) * 100);
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public canDownload(): boolean {
    return this.status === 'completed' && 
           !this.isExpired() && 
           this.downloadCount < this.maxDownloads;
  }

  public async incrementDownloadCount(): Promise<void> {
    this.downloadCount += 1;
    await this.save();
  }

  public getProcessingTimeFormatted(): string {
    const seconds = Math.round(this.processingTimeMs / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  public getFileSizeFormatted(sizeInBytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  public getOriginalSizeFormatted(): string {
    return this.getFileSizeFormatted(this.originalFileSize);
  }

  public getCompressedSizeFormatted(): string {
    return this.getFileSizeFormatted(this.compressedFileSize || 0);
  }

  public toJSON(): ProcessedFilesAttributes {
    const values = Object.assign({}, this.get());
    return values;
  }
}

// Define ProcessedFiles model
ProcessedFiles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    originalFileName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    originalFileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 1,
      },
      comment: 'File size in bytes',
    },
    compressedFileSize: {
      type: DataTypes.BIGINT,
      allowNull: true,
      validate: {
        min: 0,
      },
      comment: 'Compressed file size in bytes',
    },
    compressionRatio: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
      comment: 'Compression percentage (0-100)',
    },
    qualityLevel: {
      type: env.isTest
        ? DataTypes.STRING
        : DataTypes.ENUM('low', 'medium', 'high', 'custom'),
      allowNull: false,
      validate: {
        isIn: [['low', 'medium', 'high', 'custom']]
      }
    },
    customQuality: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 10,
        max: 100,
      },
      comment: 'Custom quality level (10-100) when qualityLevel is custom',
    },
    processingTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
      comment: 'Processing time in milliseconds',
    },
    status: {
      type: env.isTest
        ? DataTypes.STRING
        : DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'processing', 'completed', 'failed', 'expired']]
      }
    },
    originalFilePath: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Path to original uploaded file',
    },
    compressedFilePath: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Path to compressed file',
    },
    downloadToken: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Secure token for file downloads',
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    maxDownloads: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 1,
      },
      comment: 'Maximum number of downloads allowed',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the file and download link expire',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if processing failed',
    },
    metadata: {
      type: env.isTest
        ? DataTypes.TEXT
        : DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional file metadata (pages, creation date, etc.)',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ProcessedFiles',
    tableName: 'processed_files',
    indexes: env.isTest ? [] : [
      {
        unique: true,
        fields: ['download_token'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['expires_at'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['user_id', 'status'],
        name: 'idx_user_status',
      },
      {
        fields: ['status', 'expires_at'],
        name: 'idx_status_expiry',
      },
    ],
  }
);

export default ProcessedFiles;
