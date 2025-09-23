import type { CompressionOptions } from '../services/pdfService';
import {
  ALLOWED_COMPRESSION_QUALITIES,
  BATCH_CUSTOM_DPI_RANGE,
  BATCH_IMAGE_QUALITY_RANGE,
  DEFAULT_BATCH_CUSTOM_DPI,
  DEFAULT_BATCH_IMAGE_QUALITY,
} from '../config/upload';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

const TRUE_VALUES = new Set(['true', '1', 'yes', 'y', 'on']);
const FALSE_VALUES = new Set(['false', '0', 'no', 'n', 'off']);

const parseBoolean = (
  value: unknown,
  field: string,
  errors: ValidationErrorDetail[],
  defaultValue: boolean
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalised)) {
      return true;
    }
    if (FALSE_VALUES.has(normalised)) {
      return false;
    }
  }

  errors.push({ field, message: `${field} must be a boolean` });
  return defaultValue;
};

const parseNumber = (
  value: unknown,
  field: string,
  min: number,
  max: number,
  defaultValue: number,
  errors: ValidationErrorDetail[]
): number => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    errors.push({ field, message: `${field} must be a number` });
    return defaultValue;
  }

  if (parsed < min || parsed > max) {
    errors.push({ field, message: `${field} must be between ${min} and ${max}` });
    return defaultValue;
  }

  return Math.round(parsed);
};

export interface BatchOptionsValidationResult {
  options: CompressionOptions;
  errors: ValidationErrorDetail[];
}

export const validateAndNormalizeBatchOptions = (
  body: Record<string, unknown> = {}
): BatchOptionsValidationResult => {
  const errors: ValidationErrorDetail[] = [];

  const qualityRaw = typeof body.quality === 'string' ? body.quality.trim().toLowerCase() : undefined;
  let quality: CompressionOptions['quality'] = 'medium';
  if (qualityRaw) {
    if (ALLOWED_COMPRESSION_QUALITIES.includes(qualityRaw as (typeof ALLOWED_COMPRESSION_QUALITIES)[number])) {
      quality = qualityRaw as CompressionOptions['quality'];
    } else {
      errors.push({ field: 'quality', message: `quality must be one of ${ALLOWED_COMPRESSION_QUALITIES.join(', ')}` });
    }
  }

  const removeMetadata = parseBoolean(body.removeMetadata, 'removeMetadata', errors, false);
  const removeAnnotations = parseBoolean(body.removeAnnotations, 'removeAnnotations', errors, false);
  const optimizeImages = parseBoolean(body.optimizeImages, 'optimizeImages', errors, false);

  const imageQuality = parseNumber(
    body.imageQuality,
    'imageQuality',
    BATCH_IMAGE_QUALITY_RANGE.min,
    BATCH_IMAGE_QUALITY_RANGE.max,
    DEFAULT_BATCH_IMAGE_QUALITY,
    errors
  );

  const customDPI = parseNumber(
    body.customDPI,
    'customDPI',
    BATCH_CUSTOM_DPI_RANGE.min,
    BATCH_CUSTOM_DPI_RANGE.max,
    DEFAULT_BATCH_CUSTOM_DPI,
    errors
  );

  return {
    options: {
      quality,
      removeMetadata,
      removeAnnotations,
      optimizeImages,
      imageQuality,
      customDPI,
    },
    errors,
  };
};
