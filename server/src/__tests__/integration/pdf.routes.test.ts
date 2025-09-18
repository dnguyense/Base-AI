import request from 'supertest';
import fs from 'fs-extra';
import path from 'path';
import { app } from '../../index';

const describeIfServerAllowed = process.env.JEST_ALLOW_SERVER === 'true' ? describe : describe.skip;

const createPdfFixture = async (name: string, content = '%PDF-1.4\n%fake pdf'): Promise<string> => {
  const fixturesDir = path.join(__dirname, '../fixtures');
  await fs.ensureDir(fixturesDir);
  const filePath = path.join(fixturesDir, name);
  await fs.writeFile(filePath, content);
  return filePath;
};

describeIfServerAllowed('PDF API integration', () => {
  afterAll(async () => {
    const fixturesDir = path.join(__dirname, '../fixtures');
    await fs.remove(fixturesDir);
    const uploadsDir = path.join(__dirname, '../../../uploads');
    const compressedDir = path.join(__dirname, '../../../compressed');
    await fs.emptyDir(uploadsDir);
    await fs.emptyDir(compressedDir);
  });

  it('uploads, compresses, and downloads a PDF', async () => {
    const testPdf = await createPdfFixture('sample.pdf');

    const uploadResponse = await request(app)
      .post('/api/v1/pdf/upload')
      .attach('files', testPdf)
      .expect(200);

    expect(uploadResponse.body.success).toBe(true);
    const [uploaded] = uploadResponse.body.files;
    expect(uploaded).toMatchObject({
      id: expect.any(String),
      originalName: 'sample.pdf',
      fileName: expect.any(String),
      storageName: expect.any(String),
    });

    const compressionResponse = await request(app)
      .post('/api/v1/pdf/compress')
      .send({
        files: [{
          id: uploaded.id,
          name: uploaded.originalName,
          size: uploaded.size,
          storageName: uploaded.storageName,
        }],
        options: { quality: 'medium' },
      })
      .expect(200);

    expect(compressionResponse.body.success).toBe(true);
    const [result] = compressionResponse.body.results;
    expect(result).toMatchObject({
      success: true,
      originalSize: expect.any(Number),
      compressedSize: expect.any(Number),
      downloadUrl: expect.any(String),
    });

    const downloadPath = result.downloadUrl as string;
    const downloadResponse = await request(app)
      .get(downloadPath)
      .expect(200);

    expect(downloadResponse.headers['content-type']).toBe('application/pdf');
  });
});
