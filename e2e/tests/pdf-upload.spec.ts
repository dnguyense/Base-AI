import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('PDF Upload Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/PDF Compressor Pro/);
  });

  test('should display upload interface correctly', async ({ page }) => {
    // Check if upload area is visible
    await expect(page.getByTestId('upload-area')).toBeVisible();
    
    // Check upload button
    await expect(page.getByRole('button', { name: /upload|browse/i })).toBeVisible();
    
    // Check drag and drop text
    await expect(page.getByText(/drag.*drop.*files/i)).toBeVisible();
  });

  test('should upload a PDF file successfully', async ({ page }) => {
    // Create a test PDF file
    const testPdfPath = path.join(__dirname, '../fixtures/test-upload.pdf');
    const testPdfContent = '%PDF-1.4\n%Test PDF content for e2e testing\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000015 00000 n \n0000000074 00000 n \n0000000131 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF';
    
    // Ensure test file exists
    fs.writeFileSync(testPdfPath, testPdfContent);
    
    try {
      // Upload the file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testPdfPath);
      
      // Wait for upload to complete
      await expect(page.getByText(/upload.*success/i)).toBeVisible({ timeout: 10000 });
      
      // Check if file appears in the file list
      await expect(page.getByText('test-upload.pdf')).toBeVisible();
      
      // Check if file size is displayed
      await expect(page.locator('[data-testid="file-size"]')).toBeVisible();
      
    } finally {
      // Clean up test file
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
      }
    }
  });

  test('should reject non-PDF files', async ({ page }) => {
    // Create a test text file
    const testTxtPath = path.join(__dirname, '../fixtures/test.txt');
    fs.writeFileSync(testTxtPath, 'This is not a PDF file');
    
    try {
      // Try to upload the text file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testTxtPath);
      
      // Should show error message
      await expect(page.getByText(/only.*pdf.*files.*allowed/i)).toBeVisible({ timeout: 5000 });
      
    } finally {
      // Clean up test file
      if (fs.existsSync(testTxtPath)) {
        fs.unlinkSync(testTxtPath);
      }
    }
  });

  test('should handle multiple file uploads', async ({ page }) => {
    const testFiles = [];
    const testDir = path.join(__dirname, '../fixtures');
    
    // Create multiple test PDF files
    for (let i = 1; i <= 3; i++) {
      const testPdfPath = path.join(testDir, `test${i}.pdf`);
      const testPdfContent = `%PDF-1.4\n%Test PDF ${i} content\n%%EOF`;
      fs.writeFileSync(testPdfPath, testPdfContent);
      testFiles.push(testPdfPath);
    }
    
    try {
      // Upload multiple files
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFiles);
      
      // Wait for uploads to complete
      await expect(page.getByText(/upload.*success/i)).toBeVisible({ timeout: 15000 });
      
      // Check that all files are listed
      for (let i = 1; i <= 3; i++) {
        await expect(page.getByText(`test${i}.pdf`)).toBeVisible();
      }
      
      // Check file count
      const fileItems = page.locator('[data-testid="file-item"]');
      await expect(fileItems).toHaveCount(3);
      
    } finally {
      // Clean up test files
      testFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  test('should show file size limits', async ({ page }) => {
    // Check if file size limit information is displayed
    await expect(page.getByText(/50.*mb.*limit|maximum.*file.*size/i)).toBeVisible();
  });

  test('should handle drag and drop upload', async ({ page }) => {
    const testPdfPath = path.join(__dirname, '../fixtures/drag-drop-test.pdf');
    const testPdfContent = '%PDF-1.4\n%Drag and drop test PDF\n%%EOF';
    fs.writeFileSync(testPdfPath, testPdfContent);
    
    try {
      // Get the upload area
      const uploadArea = page.getByTestId('upload-area');
      
      // Simulate drag and drop
      await uploadArea.dispatchEvent('drop', {
        dataTransfer: {
          files: [new File([testPdfContent], 'drag-drop-test.pdf', { type: 'application/pdf' })]
        }
      });
      
      // Wait for upload to complete
      await expect(page.getByText(/upload.*success/i)).toBeVisible({ timeout: 10000 });
      
    } finally {
      // Clean up
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
      }
    }
  });

  test('should remove uploaded files', async ({ page }) => {
    const testPdfPath = path.join(__dirname, '../fixtures/remove-test.pdf');
    const testPdfContent = '%PDF-1.4\n%Remove test PDF\n%%EOF';
    fs.writeFileSync(testPdfPath, testPdfContent);
    
    try {
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testPdfPath);
      
      // Wait for upload
      await expect(page.getByText('remove-test.pdf')).toBeVisible();
      
      // Click remove button
      await page.getByRole('button', { name: /remove|delete/i }).first().click();
      
      // Confirm file is removed
      await expect(page.getByText('remove-test.pdf')).not.toBeVisible();
      
    } finally {
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
      }
    }
  });
});