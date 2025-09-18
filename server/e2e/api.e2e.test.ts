import { test, expect } from '@playwright/test';

test.describe('PDF Compressor API E2E Tests', () => {
  
  test('Health check endpoint should return success', async ({ request }) => {
    const response = await request.get('/health');
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('status', 'OK');
    expect(responseBody).toHaveProperty('timestamp');
  });

  test('API root endpoint should return API information', async ({ request }) => {
    const response = await request.get('/');
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('message', 'PDF Compressor Pro API');
    expect(responseBody).toHaveProperty('version', '1.0.0');
    expect(responseBody).toHaveProperty('status', 'running');
  });

  test('API v1 endpoint should return API information', async ({ request }) => {
    const response = await request.get('/api/v1');
    
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('message', 'PDF Compressor Pro API v1');
    expect(responseBody).toHaveProperty('version', '1.0.0');
    expect(responseBody.endpoints).toHaveProperty('auth', '/api/v1/auth (Active)');
  });

  test('Non-existent endpoint should return 404', async ({ request }) => {
    const response = await request.get('/non-existent-endpoint');
    
    expect(response.status()).toBe(404);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success', false);
    expect(responseBody).toHaveProperty('message');
  });

});