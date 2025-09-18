import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

const makeEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

const samplePdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n', 'utf-8');

test.describe('API End-to-End Flows', () => {
  test('auth, compression, download, and subscription endpoints work together', async ({ request }) => {
    const email = makeEmail('playwright');
    const password = 'PwApi123!';

    const registerResponse = await request.post(`${API_BASE_URL}/api/auth/register`, {
      data: {
        email,
        password,
        firstName: 'Play',
        lastName: 'Wright',
      },
    });
    expect(registerResponse.ok()).toBeTruthy();

    const registerPayload = await registerResponse.json();
    expect(registerPayload.success).toBeTruthy();
    const { accessToken, refreshToken } = registerPayload.data.tokens;

    const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
      data: { email, password },
    });
    expect(loginResponse.ok()).toBeTruthy();

    const uploadResponse = await request.post(`${API_BASE_URL}/api/v1/pdf/upload`, {
      multipart: {
        files: {
          name: 'playwright.pdf',
          mimeType: 'application/pdf',
          buffer: samplePdf,
        },
      },
    });
    expect(uploadResponse.ok()).toBeTruthy();
    const uploadPayload = await uploadResponse.json();
    const [uploadedFile] = uploadPayload.files;

    const compressResponse = await request.post(`${API_BASE_URL}/api/v1/pdf/compress`, {
      data: {
        files: [
          {
            id: uploadedFile.id,
            name: uploadedFile.originalName || uploadedFile.name,
            size: uploadedFile.size,
            storageName: uploadedFile.storageName,
          },
        ],
        options: {
          quality: 'medium',
        },
      },
    });
    expect(compressResponse.ok()).toBeTruthy();
    const compressPayload = await compressResponse.json();
    const [result] = compressPayload.results;
    expect(result.success).toBeTruthy();
    expect(result.downloadUrl).toBeTruthy();

    const downloadResponse = await request.get(`${API_BASE_URL}${result.downloadUrl}`);
    expect(downloadResponse.ok()).toBeTruthy();
    expect(downloadResponse.headers()['content-type']).toBe('application/pdf');

    const refreshResponse = await request.post(`${API_BASE_URL}/api/auth/refresh-token`, {
      data: { refreshToken },
    });
    expect(refreshResponse.ok()).toBeTruthy();

    const plansResponse = await request.get(`${API_BASE_URL}/api/subscription/plans`);
    expect(plansResponse.ok()).toBeTruthy();
    const plansPayload = await plansResponse.json();
    expect(plansPayload.data.plans.length).toBeGreaterThan(0);

    const currentSubscriptionResponse = await request.get(`${API_BASE_URL}/api/subscription/current`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(currentSubscriptionResponse.ok()).toBeTruthy();
    const currentPayload = await currentSubscriptionResponse.json();
    expect(currentPayload.data.plan).toBeDefined();
  });
});
