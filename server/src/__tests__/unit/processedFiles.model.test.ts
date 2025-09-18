import ProcessedFiles from '../../models/ProcessedFiles';

describe('ProcessedFiles model helpers', () => {
  const baseAttributes = {
    id: 1,
    userId: 1,
    originalFileName: 'sample.pdf',
    originalFileSize: 2_000_000,
    compressedFileSize: 800_000,
    compressionRatio: 60,
    qualityLevel: 'medium' as const,
    processingTimeMs: 4200,
    status: 'completed' as const,
    originalFilePath: '/tmp/original.pdf',
    compressedFilePath: '/tmp/compressed.pdf',
    downloadToken: 'token-123',
    downloadCount: 0,
    maxDownloads: 3,
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('computes size reduction metrics', () => {
    const record = ProcessedFiles.build(baseAttributes);

    expect(record.getSizeReduction()).toBe(baseAttributes.originalFileSize - baseAttributes.compressedFileSize);
    expect(record.getSizeReductionPercentage()).toBeGreaterThan(0);
  });

  it('reflects download eligibility', () => {
    const record = ProcessedFiles.build(baseAttributes);
    expect(record.canDownload()).toBe(true);

    record.downloadCount = record.maxDownloads;
    expect(record.canDownload()).toBe(false);

    record.downloadCount = 0;
    record.expiresAt = new Date(Date.now() - 1000);
    expect(record.canDownload()).toBe(false);
  });

  it('increments download counts via helper', async () => {
    const record = ProcessedFiles.build(baseAttributes);
    const saveSpy = jest.spyOn(record, 'save').mockResolvedValue(record);

    await record.incrementDownloadCount();

    expect(record.downloadCount).toBe(1);
    expect(saveSpy).toHaveBeenCalled();

    saveSpy.mockRestore();
  });

  it('formats metadata helpers', () => {
    const record = ProcessedFiles.build(baseAttributes);

    expect(record.getOriginalSizeFormatted()).toMatch(/(KB|MB|GB)/);
    expect(record.getCompressedSizeFormatted()).toMatch(/(KB|MB|GB)/);
    expect(record.getProcessingTimeFormatted()).toMatch(/s/);
  });
});
