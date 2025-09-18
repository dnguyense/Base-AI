import { test, expect } from '@playwright/test';

test.describe('PDF Compressor Pro - Live Application', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for React app to load
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Check page title
    await expect(page).toHaveTitle(/PDF Compressor Pro/);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/homepage-loaded.png' });
  });

  test('should display main application interface', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to fully load
    await page.waitForLoadState('networkidle');
    
    // Check if React app mounted properly
    const rootElement = page.locator('#root');
    await expect(rootElement).not.toBeEmpty();
    
    // Look for common PDF compression UI elements
    // These selectors might need adjustment based on actual app structure
    const possibleSelectors = [
      '[data-testid*="upload"]',
      '[data-testid*="compress"]',
      'input[type="file"]',
      'button:has-text("Upload")',
      'button:has-text("Choose")',
      'div:has-text("drag"i)',
      'div:has-text("drop"i)',
      'div:has-text("pdf"i)'
    ];
    
    // Try to find at least one UI element
    let foundElement = false;
    for (const selector of possibleSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          foundElement = true;
          console.log(`Found UI element: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Take a screenshot to see what's actually rendered
    await page.screenshot({ 
      path: 'test-results/app-interface.png',
      fullPage: true 
    });
    
    // Log page content for debugging
    const bodyText = await page.textContent('body');
    console.log('Page content:', bodyText);
  });

  test('should have proper meta tags and SEO', async ({ page }) => {
    await page.goto('/');
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /PDF Compressor Pro/);
    
    // Check viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if there are any console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
    
    // Allow some common React warnings but fail on actual errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Warning:') && 
      !error.includes('[HMR]') &&
      !error.includes('webpack')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if page is responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/mobile-view.png',
      fullPage: true 
    });
  });
});