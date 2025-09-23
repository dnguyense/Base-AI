import { validateAndNormalizeBatchOptions } from '../../utils/batchOptions';
import {
  ALLOWED_COMPRESSION_QUALITIES,
  BATCH_CUSTOM_DPI_RANGE,
  BATCH_IMAGE_QUALITY_RANGE,
  DEFAULT_BATCH_CUSTOM_DPI,
  DEFAULT_BATCH_IMAGE_QUALITY,
} from '../../config/upload';

describe('validateAndNormalizeBatchOptions', () => {
  it('returns defaults when no values are provided', () => {
    const { options, errors } = validateAndNormalizeBatchOptions();

    expect(errors).toHaveLength(0);
    expect(options).toMatchObject({
      quality: 'medium',
      removeMetadata: false,
      removeAnnotations: false,
      optimizeImages: false,
      imageQuality: DEFAULT_BATCH_IMAGE_QUALITY,
      customDPI: DEFAULT_BATCH_CUSTOM_DPI,
    });
  });

  it('normalises valid values', () => {
    const { options, errors } = validateAndNormalizeBatchOptions({
      quality: 'HIGH',
      removeMetadata: 'true',
      removeAnnotations: 'yes',
      optimizeImages: '1',
      imageQuality: String(BATCH_IMAGE_QUALITY_RANGE.max),
      customDPI: String(BATCH_CUSTOM_DPI_RANGE.min),
    });

    expect(errors).toHaveLength(0);
    expect(options).toMatchObject({
      quality: 'high',
      removeMetadata: true,
      removeAnnotations: true,
      optimizeImages: true,
      imageQuality: BATCH_IMAGE_QUALITY_RANGE.max,
      customDPI: BATCH_CUSTOM_DPI_RANGE.min,
    });
  });

  it('collects validation errors for invalid inputs', () => {
    const { errors } = validateAndNormalizeBatchOptions({
      quality: 'invalid',
      removeMetadata: 'not-bool',
      imageQuality: String(BATCH_IMAGE_QUALITY_RANGE.max + 1),
      customDPI: 'abc',
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'quality' }),
        expect.objectContaining({ field: 'removeMetadata' }),
        expect.objectContaining({ field: 'imageQuality' }),
        expect.objectContaining({ field: 'customDPI' }),
      ])
    );
  });

  it('updates only specified fields and retains defaults for others', () => {
    const { options, errors } = validateAndNormalizeBatchOptions({
      quality: ALLOWED_COMPRESSION_QUALITIES[0],
      removeAnnotations: 'false',
    });

    expect(errors).toHaveLength(0);
    expect(options).toMatchObject({
      quality: ALLOWED_COMPRESSION_QUALITIES[0],
      removeMetadata: false,
      removeAnnotations: false,
      optimizeImages: false,
      imageQuality: DEFAULT_BATCH_IMAGE_QUALITY,
      customDPI: DEFAULT_BATCH_CUSTOM_DPI,
    });
  });
});
