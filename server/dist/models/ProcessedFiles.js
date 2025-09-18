"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class ProcessedFiles extends sequelize_1.Model {
    getSizeReduction() {
        if (!this.compressedFileSize || this.originalFileSize === 0)
            return 0;
        return this.originalFileSize - this.compressedFileSize;
    }
    getSizeReductionPercentage() {
        if (!this.compressedFileSize || this.originalFileSize === 0)
            return 0;
        return Math.round(((this.originalFileSize - this.compressedFileSize) / this.originalFileSize) * 100);
    }
    isExpired() {
        return new Date() > this.expiresAt;
    }
    canDownload() {
        return this.status === 'completed' &&
            !this.isExpired() &&
            this.downloadCount < this.maxDownloads;
    }
    async incrementDownloadCount() {
        this.downloadCount += 1;
        await this.save();
    }
    getProcessingTimeFormatted() {
        const seconds = Math.round(this.processingTimeMs / 1000);
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
    getFileSizeFormatted(sizeInBytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = sizeInBytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
    getOriginalSizeFormatted() {
        return this.getFileSizeFormatted(this.originalFileSize);
    }
    getCompressedSizeFormatted() {
        return this.getFileSizeFormatted(this.compressedFileSize || 0);
    }
    toJSON() {
        const values = Object.assign({}, this.get());
        return values;
    }
}
ProcessedFiles.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    originalFileName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 255],
        },
    },
    originalFileSize: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 1,
        },
        comment: 'File size in bytes',
    },
    compressedFileSize: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
        validate: {
            min: 0,
        },
        comment: 'Compressed file size in bytes',
    },
    compressionRatio: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100,
        },
        comment: 'Compression percentage (0-100)',
    },
    qualityLevel: {
        type: process.env.NODE_ENV === 'test'
            ? sequelize_1.DataTypes.STRING
            : sequelize_1.DataTypes.ENUM('low', 'medium', 'high', 'custom'),
        allowNull: false,
        validate: {
            isIn: [['low', 'medium', 'high', 'custom']]
        }
    },
    customQuality: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 10,
            max: 100,
        },
        comment: 'Custom quality level (10-100) when qualityLevel is custom',
    },
    processingTimeMs: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
        comment: 'Processing time in milliseconds',
    },
    status: {
        type: process.env.NODE_ENV === 'test'
            ? sequelize_1.DataTypes.STRING
            : sequelize_1.DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'expired'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'processing', 'completed', 'failed', 'expired']]
        }
    },
    originalFilePath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Path to original uploaded file',
    },
    compressedFilePath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        comment: 'Path to compressed file',
    },
    downloadToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        comment: 'Secure token for file downloads',
    },
    downloadCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    maxDownloads: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: {
            min: 1,
        },
        comment: 'Maximum number of downloads allowed',
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        comment: 'When the file and download link expire',
    },
    errorMessage: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Error message if processing failed',
    },
    metadata: {
        type: process.env.NODE_ENV === 'test'
            ? sequelize_1.DataTypes.TEXT
            : sequelize_1.DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional file metadata (pages, creation date, etc.)',
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    modelName: 'ProcessedFiles',
    tableName: 'processed_files',
    indexes: process.env.NODE_ENV === 'test' ? [] : [
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
});
exports.default = ProcessedFiles;
//# sourceMappingURL=ProcessedFiles.js.map