-- Migration: Create processed_files table
-- Created: 2024-01-18
-- Description: File processing tracking table with download management

CREATE TABLE IF NOT EXISTS processed_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    original_file_size BIGINT NOT NULL CHECK (original_file_size > 0),
    compressed_file_size BIGINT CHECK (compressed_file_size >= 0),
    compression_ratio FLOAT NOT NULL DEFAULT 0 CHECK (compression_ratio >= 0 AND compression_ratio <= 100),
    quality_level VARCHAR(20) NOT NULL DEFAULT 'medium' 
        CHECK (quality_level IN ('low', 'medium', 'high', 'custom')),
    custom_quality INTEGER CHECK (custom_quality >= 10 AND custom_quality <= 100),
    processing_time_ms INTEGER NOT NULL DEFAULT 0 CHECK (processing_time_ms >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    original_file_path VARCHAR(500) NOT NULL,
    compressed_file_path VARCHAR(500),
    download_token VARCHAR(255) NOT NULL UNIQUE,
    download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
    max_downloads INTEGER NOT NULL DEFAULT 5 CHECK (max_downloads > 0),
    expires_at TIMESTAMP NOT NULL,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_processed_files_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_processed_files_user_id ON processed_files(user_id);
CREATE INDEX IF NOT EXISTS idx_processed_files_download_token ON processed_files(download_token);
CREATE INDEX IF NOT EXISTS idx_processed_files_status ON processed_files(status);
CREATE INDEX IF NOT EXISTS idx_processed_files_expires_at ON processed_files(expires_at);
CREATE INDEX IF NOT EXISTS idx_processed_files_created_at ON processed_files(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_processed_files_user_status ON processed_files(user_id, status);
CREATE INDEX IF NOT EXISTS idx_processed_files_status_expiry ON processed_files(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_processed_files_user_created ON processed_files(user_id, created_at);

-- Partial indexes for optimization (without time-based predicates)
CREATE INDEX IF NOT EXISTS idx_processed_files_active_downloads 
    ON processed_files(download_token, expires_at) 
    WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_processed_files_expired 
    ON processed_files(expires_at, status);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_processed_files_updated_at BEFORE UPDATE ON processed_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE processed_files IS 'File processing history and download management';
COMMENT ON COLUMN processed_files.original_file_size IS 'Original file size in bytes';
COMMENT ON COLUMN processed_files.compressed_file_size IS 'Compressed file size in bytes';
COMMENT ON COLUMN processed_files.compression_ratio IS 'Compression percentage achieved (0-100)';
COMMENT ON COLUMN processed_files.quality_level IS 'Compression quality setting used';
COMMENT ON COLUMN processed_files.custom_quality IS 'Custom quality value (10-100) when quality_level is custom';
COMMENT ON COLUMN processed_files.processing_time_ms IS 'Time taken to process file in milliseconds';
COMMENT ON COLUMN processed_files.download_token IS 'Secure token for accessing download';
COMMENT ON COLUMN processed_files.download_count IS 'Number of times file has been downloaded';
COMMENT ON COLUMN processed_files.max_downloads IS 'Maximum allowed downloads for this file';
COMMENT ON COLUMN processed_files.expires_at IS 'When file access expires';
COMMENT ON COLUMN processed_files.metadata IS 'Additional file metadata (pages, creation date, etc.)';