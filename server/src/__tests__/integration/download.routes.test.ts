import request from 'supertest';
import { promises as fs } from 'fs';
import path from 'path';
import { app } from '../../index';

const describeIfServerAllowed = process.env.JEST_ALLOW_SERVER === 'true' ? describe : describe.skip;

const uniqueEmail = () => `download-int-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const createFixturePdf = async (name: string) => {
  const fixturesDir = path.join(__dirname, '../fixtures/downloads');
  await fs.mkdir(fixturesDir, { recursive: true });
  const filePath = path.join(fixturesDir, name);
  await fs.writeFile(filePath, '%PDF-1.4\n%FakePDF\n1 0 obj\n<< /Type /Catalog >>\nendobj');
  return filePath;
};

afterAll(async () => {
  const fixturesDir = path.join(__dirname, '../fixtures/downloads');
  await fs.rm(fixturesDir, { recursive: true, force: true });
});

describeIfServerAllowed('Download Routes Integration', () => {
  it('generates token, downloads file, and reports analytics', async () => {
    const email = uniqueEmail();
    const password = 'Download123!';

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({ email, password, firstName: 'Down', lastName: 'Loader' })
      .expect(201);

    const accessToken = registerResponse.body.data.tokens.accessToken as string;

    const filePath = await createFixturePdf('downloadable.pdf');

    const tokenResponse = await request(app)
      .post('/api/v1/download/token')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fileId: 'file-123',
        fileName: 'downloadable.pdf',
        filePath,
      })
      .expect(200);

    const downloadToken = tokenResponse.body.data.downloadToken as string;
    expect(downloadToken).toBeDefined();

    const downloadResponse = await request(app)
      .get(`/api/v1/download/${downloadToken}`)
      .expect(200);

    expect(downloadResponse.headers['content-type']).toBe('application/pdf');

    const analyticsResponse = await request(app)
      .get('/api/v1/download/analytics/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(analyticsResponse.body.data.statistics.totalDownloads).toBeGreaterThanOrEqual(1);

    const auditResponse = await request(app)
      .get('/api/v1/download/audit/trail')
      .expect(200);

    expect(auditResponse.body.data.auditTrail.length).toBeGreaterThan(0);
  });
});
