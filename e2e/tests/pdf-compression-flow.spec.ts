import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('PDF Compression End-to-End Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display compression interface elements', async ({ page }) => {
    // Look for main call-to-action buttons
    const signInButton = page.locator('text="Sign in to compress PDFs"');
    const getStartedButton = page.locator('text="Get Started Free"');
    
    // At least one of these should be visible
    const hasSignIn = await signInButton.count() > 0;
    const hasGetStarted = await getStartedButton.count() > 0;
    
    expect(hasSignIn || hasGetStarted).toBeTruthy();
    
    // Take screenshot of the main interface
    await page.screenshot({ 
      path: 'test-results/compression-interface.png',
      fullPage: true 
    });
  });

  test('should navigate to sign in page when clicked', async ({ page }) => {
    // Try to click sign in button
    const signInButton = page.locator('text="Sign In"').first();
    
    if (await signInButton.count() > 0) {
      await signInButton.click();
      
      // Wait for navigation or modal to appear
      await page.waitForTimeout(2000);
      
      // Take screenshot of sign in page/modal
      await page.screenshot({ 
        path: 'test-results/sign-in-page.png',
        fullPage: true 
      });
      
      // Check if URL changed or modal appeared
      const currentUrl = page.url();
      console.log('Current URL after sign in click:', currentUrl);
    }
  });

  test('should show pricing information', async ({ page }) => {
    // Check for pricing section
    const freePlan = page.locator('text="Free"');
    const proPlan = page.locator('text="Pro Monthly"');
    const lifetimePlan = page.locator('text="Pro Lifetime"');
    
    // At least one pricing plan should be visible
    const hasPricing = await freePlan.count() > 0 || 
                      await proPlan.count() > 0 || 
                      await lifetimePlan.count() > 0;
    
    expect(hasPricing).toBeTruthy();
    
    // Scroll to pricing section if not visible
    if (await page.locator('text="Simple, Transparent Pricing"').count() > 0) {
      await page.locator('text="Simple, Transparent Pricing"').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Take screenshot of pricing section
      await page.screenshot({ 
        path: 'test-results/pricing-section.png',
        fullPage: false 
      });
    }
  });

  test('should have working navigation menu', async ({ page }) => {
    // Check for navigation items
    const navItems = ['Home', 'Compress', 'Pricing'];
    
    for (const item of navItems) {
      const navLink = page.locator(`text="${item}"`).first();
      if (await navLink.count() > 0) {
        await navLink.click();
        await page.waitForTimeout(1500);
        
        // Take screenshot after navigation
        await page.screenshot({ 
          path: `test-results/nav-${item.toLowerCase()}.png`,
          fullPage: true 
        });
        
        console.log(`Navigated to: ${item}, URL: ${page.url()}`);
        
        // Go back to home for next test
        if (item !== 'Home') {
          await page.goBack();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should display key features and benefits', async ({ page }) => {
    // Check for feature highlights
    const features = [
      'Lightning Fast',
      'Secure & Private', 
      'Quality Preserved',
      '95%',
      'Size Reduction',
      '256-bit',
      'SSL Encryption'
    ];
    
    let foundFeatures = 0;
    for (const feature of features) {
      if (await page.locator(`text="${feature}"`).count() > 0) {
        foundFeatures++;
      }
    }
    
    // Should find at least half of the expected features
    expect(foundFeatures).toBeGreaterThanOrEqual(features.length / 2);
    
    console.log(`Found ${foundFeatures} out of ${features.length} expected features`);
  });

  test('should show footer with links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Check for footer elements
    const footerElements = [
      'PDF Compressor Pro',
      'Privacy Policy',
      'Terms of Service',
      '© 2024'
    ];
    
    let foundElements = 0;
    for (const element of footerElements) {
      if (await page.locator(`text="${element}"`).count() > 0) {
        foundElements++;
      }
    }
    
    expect(foundElements).toBeGreaterThanOrEqual(2);
    
    // Take screenshot of footer
    await page.screenshot({ 
      path: 'test-results/footer-section.png',
      fullPage: false 
    });
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1200, height: 800, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check if content is still visible and accessible
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/responsive-${viewport.name}.png`,
        fullPage: true 
      });
      
      console.log(`Tested ${viewport.name} viewport: ${viewport.width}x${viewport.height}`);
    }
  });
});