import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('PDF Compression Functionality', () => {
  let testPdfPath: string;

  test.beforeAll(async () => {
    // Create a test PDF file for compression tests
    testPdfPath = path.join(__dirname, '../fixtures/compression-test.pdf');
    const testPdfContent = '%PDF-1.4\n%Test PDF for compression\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000015 00000 n \n0000000074 00000 n \n0000000131 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF';
    fs.writeFileSync(testPdfPath, testPdfContent);
  });

  test.afterAll(async () => {
    // Clean up test file
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Upload test file first
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testPdfPath);
    await expect(page.getByText(/upload.*success/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display compression options', async ({ page }) => {
    // Navigate to compression settings or expand options
    await page.getByRole('button', { name: /compress|settings|options/i }).first().click();
    
    // Check quality options
    await expect(page.getByText(/quality/i)).toBeVisible();
    await expect(page.getByText(/low|medium|high/i)).toBeVisible();
    
    // Check additional options
    await expect(page.getByText(/remove.*metadata/i)).toBeVisible();
    await expect(page.getByText(/optimize.*images/i)).toBeVisible();
  });

  test('should compress PDF with default settings', async ({ page }) => {
    // Click compress button
    const compressButton = page.getByRole('button', { name: /compress/i }).first();
    await compressButton.click();
    
    // Wait for compression to complete
    await expect(page.getByText(/compression.*complete|success/i)).toBeVisible({ timeout: 30000 });
    
    // Check if download button appears
    await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
    
    // Check compression results are displayed
    await expect(page.getByText(/compression.*ratio|size.*reduced/i)).toBeVisible();
  });

  test('should compress PDF with different quality settings', async ({ page }) => {
    const qualityLevels = ['high', 'medium', 'low'];
    
    for (const quality of qualityLevels) {
      // Open compression settings
      await page.getByRole('button', { name: /settings|options/i }).first().click();
      
      // Select quality level
      await page.getByRole('radio', { name: new RegExp(quality, 'i') }).click();
      
      // Start compression
      await page.getByRole('button', { name: /compress/i }).first().click();
      
      // Wait for completion
      await expect(page.getByText(/compression.*complete/i)).toBeVisible({ timeout: 30000 });
      
      // Verify results
      await expect(page.getByText(/compression.*ratio/i)).toBeVisible();
      
      // Reset for next iteration
      await page.reload();
      await page.locator('input[type="file"]').setInputFiles(testPdfPath);
      await expect(page.getByText(/upload.*success/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should compress with custom options', async ({ page }) => {
    // Open advanced options
    await page.getByRole('button', { name: /advanced|custom|options/i }).first().click();
    
    // Enable remove metadata
    const metadataCheckbox = page.getByRole('checkbox', { name: /remove.*metadata/i });
    if (!await metadataCheckbox.isChecked()) {
      await metadataCheckbox.click();
    }
    
    // Enable optimize images
    const optimizeCheckbox = page.getByRole('checkbox', { name: /optimize.*images/i });
    if (!await optimizeCheckbox.isChecked()) {
      await optimizeCheckbox.click();
    }
    
    // Set custom image quality
    const imageQualitySlider = page.locator('[data-testid="image-quality-slider"]');
    if (await imageQualitySlider.isVisible()) {
      await imageQualitySlider.fill('60');
    }
    
    // Start compression
    await page.getByRole('button', { name: /compress/i }).first().click();
    
    // Wait for completion
    await expect(page.getByText(/compression.*complete/i)).toBeVisible({ timeout: 30000 });
    
    // Verify custom options were applied
    await expect(page.getByText(/metadata.*removed|images.*optimized/i)).toBeVisible();
  });

  test('should handle compression errors gracefully', async ({ page }) => {
    // This test would simulate a corrupted PDF or server error
    // For now, we'll test the UI response to errors
    
    // Mock a server error response
    await page.route('**/api/pdf/compress', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Compression failed due to corrupted file'
        })
      });
    });
    
    // Try to compress
    await page.getByRole('button', { name: /compress/i }).first().click();
    
    // Should show error message
    await expect(page.getByText(/compression.*failed|error.*occurred/i)).toBeVisible({ timeout: 10000 });
    
    // Should not show download button
    await expect(page.getByRole('button', { name: /download/i })).not.toBeVisible();
  });

  test('should show compression progress', async ({ page }) => {
    // Start compression
    await page.getByRole('button', { name: /compress/i }).first().click();
    
    // Should show progress indicator
    await expect(page.getByRole('progressbar')).toBeVisible();
    
    // Or loading spinner
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Progress text
    await expect(page.getByText(/compressing|processing/i)).toBeVisible();
  });

  test('should allow multiple file compression', async ({ page }) => {
    // Upload additional files
    const additionalFiles = [];
    for (let i = 1; i <= 2; i++) {
      const filePath = path.join(__dirname, `../fixtures/multi-test${i}.pdf`);
      fs.writeFileSync(filePath, `%PDF-1.4\n%Multi test ${i}\n%%EOF`);
      additionalFiles.push(filePath);
    }
    
    try {
      // Add more files
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles([testPdfPath, ...additionalFiles]);
      
      // Wait for all uploads
      await expect(page.getByText(/upload.*success/i)).toBeVisible({ timeout: 15000 });
      
      // Should have multiple files listed
      const fileItems = page.locator('[data-testid="file-item"]');
      await expect(fileItems).toHaveCount(3);
      
      // Click compress all
      await page.getByRole('button', { name: /compress.*all|batch.*compress/i }).click();
      
      // Wait for batch compression
      await expect(page.getByText(/compression.*complete/i)).toBeVisible({ timeout: 45000 });
      
      // Should show results for all files
      await expect(page.getByText(/3.*files.*compressed|batch.*complete/i)).toBeVisible();
      
    } finally {
      // Clean up
      additionalFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  test('should display file size comparison', async ({ page }) => {
    // Compress file
    await page.getByRole('button', { name: /compress/i }).first().click();
    await expect(page.getByText(/compression.*complete/i)).toBeVisible({ timeout: 30000 });
    
    // Should show original size
    await expect(page.getByText(/original.*size/i)).toBeVisible();
    
    // Should show compressed size
    await expect(page.getByText(/compressed.*size/i)).toBeVisible();
    
    // Should show compression ratio/percentage
    await expect(page.getByText(/\d+%.*saved|\d+%.*reduction/i)).toBeVisible();
  });

  test('should preview compression settings before processing', async ({ page }) => {
    // Open settings
    await page.getByRole('button', { name: /settings|preview/i }).first().click();
    
    // Should show estimated compression
    await expect(page.getByText(/estimated.*size|preview.*compression/i)).toBeVisible();
    
    // Should show selected options summary
    await expect(page.getByText(/quality.*selected|options.*summary/i)).toBeVisible();
  });
});