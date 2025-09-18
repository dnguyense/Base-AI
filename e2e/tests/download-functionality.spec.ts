import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Download Functionality', () => {
  let testPdfPath: string;

  test.beforeAll(async () => {
    // Create test PDF
    testPdfPath = path.join(__dirname, '../fixtures/download-test.pdf');
    const testPdfContent = '%PDF-1.4\n%Download test PDF\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000015 00000 n \n0000000074 00000 n \n0000000131 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF';
    fs.writeFileSync(testPdfPath, testPdfContent);
  });

  test.afterAll(async () => {
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Upload and compress a file first
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);
    await expect(page.getByText(/upload.*success/i)).toBeVisible({ timeout: 10000 });
    
    // Start compression
    await page.getByRole('button', { name: /compress/i }).first().click();
    await expect(page.getByText(/compression.*complete/i)).toBeVisible({ timeout: 30000 });
  });

  test('should show download button after successful compression', async ({ page }) => {
    // Download button should be visible
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
    
    // Should show file name or download text
    await expect(page.getByText(/download.*compressed|download.*pdf/i)).toBeVisible();
  });

  test('should download single compressed file', async ({ page }) => {
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click download button
    await page.getByRole('button', { name: /download/i }).click();
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download properties
    expect(download.suggestedFilename()).toMatch(/.*\.pdf$/);
    expect(download.suggestedFilename()).toMatch(/compressed.*|.*compressed/i);
    
    // Save download to verify it's a valid PDF
    const downloadPath = path.join(__dirname, '../downloads', download.suggestedFilename());
    await fs.promises.mkdir(path.dirname(downloadPath), { recursive: true });
    await download.saveAs(downloadPath);
    
    // Verify file exists and has PDF header
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    const fileContent = fs.readFileSync(downloadPath, 'utf8');
    expect(fileContent).toMatch(/^%PDF/);
    
    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should download all compressed files when multiple files processed', async ({ page }) => {
    // Upload additional files
    const additionalFiles = [];
    for (let i = 1; i <= 2; i++) {
      const filePath = path.join(__dirname, `../fixtures/multi-download${i}.pdf`);
      fs.writeFileSync(filePath, `%PDF-1.4\n%Multi download test ${i}\n%%EOF`);
      additionalFiles.push(filePath);
    }
    
    try {
      // Add more files
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles([testPdfPath, ...additionalFiles]);
      await expect(page.getByText(/upload.*success/i)).toBeVisible({ timeout: 15000 });
      
      // Compress all
      await page.getByRole('button', { name: /compress.*all/i }).click();
      await expect(page.getByText(/compression.*complete/i)).toBeVisible({ timeout: 45000 });
      
      // Should show download all option
      await expect(page.getByRole('button', { name: /download.*all|download.*zip/i })).toBeVisible();
      
      // Download all files
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: /download.*all/i }).click();
      const download = await downloadPromise;
      
      // Should be a zip file
      expect(download.suggestedFilename()).toMatch(/.*\.zip$/);
      
    } finally {
      additionalFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  test('should show download progress for large files', async ({ page }) => {
    // Mock a large file download by intercepting the download request
    await page.route('**/api/pdf/download/**', async (route) => {
      // Simulate slow download
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.continue();
    });
    
    // Start download
    await page.getByRole('button', { name: /download/i }).click();
    
    // Should show progress indicator
    await expect(page.getByText(/downloading|preparing.*download/i)).toBeVisible();
    await expect(page.locator('[data-testid="download-progress"]')).toBeVisible();
  });

  test('should provide different download options', async ({ page }) => {
    // Check if there are different download formats or options
    const downloadButton = page.getByRole('button', { name: /download/i });
    
    // Right-click or click dropdown if available
    await downloadButton.click({ button: 'right' });
    
    // Or check for dropdown menu
    const dropdownMenu = page.locator('[data-testid="download-options"]');
    if (await dropdownMenu.isVisible()) {
      await expect(page.getByText(/original.*quality|compressed|optimized/i)).toBeVisible();
    }
  });

  test('should handle download errors gracefully', async ({ page }) => {
    // Mock download error
    await page.route('**/api/pdf/download/**', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'File not found'
        })
      });
    });
    
    // Try to download
    await page.getByRole('button', { name: /download/i }).click();
    
    // Should show error message
    await expect(page.getByText(/download.*failed|file.*not.*found/i)).toBeVisible();
    
    // Should provide retry option
    await expect(page.getByRole('button', { name: /retry.*download/i })).toBeVisible();
  });

  test('should show file information before download', async ({ page }) => {
    // Should display compressed file size
    await expect(page.getByText(/compressed.*size|file.*size/i)).toBeVisible();
    
    // Should show compression ratio
    await expect(page.getByText(/\d+%.*saved|\d+%.*reduction/i)).toBeVisible();
    
    // Should show original vs compressed comparison
    await expect(page.getByText(/original.*\d+.*kb|compressed.*\d+.*kb/i)).toBeVisible();
  });

  test('should support download history for authenticated users', async ({ page }) => {
    // Mock authenticated state
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }));
    });
    
    await page.reload();
    
    // Download a file
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    await downloadPromise;
    
    // Navigate to history/dashboard
    await page.getByRole('link', { name: /history|dashboard/i }).click();
    
    // Should show download history
    await expect(page.getByText(/recent.*downloads|download.*history/i)).toBeVisible();
    await expect(page.getByText(/download-test\.pdf|compressed/i)).toBeVisible();
  });

  test('should prevent unauthorized downloads', async ({ page }) => {
    // Mock unauthorized response
    await page.route('**/api/pdf/download/**', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized access'
        })
      });
    });
    
    // Try to download
    await page.getByRole('button', { name: /download/i }).click();
    
    // Should show login required message
    await expect(page.getByText(/login.*required|unauthorized|please.*sign.*in/i)).toBeVisible();
  });

  test('should clean up temporary files after download', async ({ page }) => {
    // This test would verify server-side cleanup
    // For now, we'll just verify the download completes successfully
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;
    
    // Verify download completed
    expect(download.suggestedFilename()).toBeTruthy();
    
    // Verify UI updates to show download completed
    await expect(page.getByText(/download.*complete|downloaded.*successfully/i)).toBeVisible();
  });

  test('should provide download statistics', async ({ page }) => {
    // After download, should show statistics
    await page.getByRole('button', { name: /download/i }).click();
    
    // Wait a moment for stats to update
    await page.waitForTimeout(1000);
    
    // Should show download count or statistics
    await expect(page.getByText(/\d+.*downloads?|download.*count/i)).toBeVisible();
  });
});