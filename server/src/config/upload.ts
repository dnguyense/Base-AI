export const ALLOWED_PDF_MIME_TYPES = ['application/pdf'] as const;

export const MAX_PDF_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_PDF_FILES_PER_REQUEST = 5;
export const MAX_PDF_TOTAL_UPLOAD_SIZE_BYTES = MAX_PDF_FILE_SIZE_BYTES * MAX_PDF_FILES_PER_REQUEST;

export const MAX_BATCH_FILE_SIZE_BYTES = MAX_PDF_FILE_SIZE_BYTES;
export const MAX_BATCH_FILES_PER_REQUEST = 10;
export const MAX_BATCH_TOTAL_UPLOAD_SIZE_BYTES = MAX_BATCH_FILE_SIZE_BYTES * MAX_BATCH_FILES_PER_REQUEST;

export const ALLOWED_COMPRESSION_QUALITIES = ['low', 'medium', 'high', 'custom'] as const;

export const DEFAULT_BATCH_IMAGE_QUALITY = 60;
export const DEFAULT_BATCH_CUSTOM_DPI = 150;

export const BATCH_IMAGE_QUALITY_RANGE = { min: 0, max: 100 } as const;
export const BATCH_CUSTOM_DPI_RANGE = { min: 72, max: 600 } as const;
