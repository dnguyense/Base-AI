import { test, expect } from '@playwright/test';
import { HomePage } from '../fixtures/page-objects/HomePage';
import { AuthPage } from '../fixtures/page-objects/AuthPage';
import { CompressPage } from '../fixtures/page-objects/CompressPage';
import { PricingPage } from '../fixtures/page-objects/PricingPage';

test.describe('Performance Tests', () => {
  let homePage: HomePage;
  let authPage: AuthPage;
  let compressPage: CompressPage;
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    authPage = new AuthPage(page);
    compressPage = new CompressPage(page);
    pricingPage = new PricingPage(page);
  });

  test.describe('Page Load Performance', () => {
    test('homepage should load within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 seconds max
      
      // Check for performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });
      
      expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500);
    });

    test('compression page should load quickly for authenticated users', async ({ page }) => {
      // Login first
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const startTime = Date.now();
      
      await compressPage.navigate();
      await compressPage.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // 2 seconds for authenticated pages
    });

    test('pricing page should load within budget', async ({ page }) => {
      const startTime = Date.now();
      
      await pricingPage.navigate();
      await pricingPage.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2500);
      
      // Check that pricing cards are visible quickly
      await expect(pricingPage.pricingCards.first()).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('API Response Performance', () => {
    test('login API should respond quickly', async ({ page }) => {
      await authPage.navigateToLogin();
      
      let apiResponseTime = 0;
      
      page.on('response', response => {
        if (response.url().includes('/api/v1/auth/login')) {
          apiResponseTime = response.timing().responseEnd;
        }
      });
      
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(apiResponseTime).toBeLessThan(1000); // 1 second max
    });

    test('file upload should handle large files efficiently', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await compressPage.navigate();
      
      let uploadStartTime: number;
      let uploadEndTime: number;
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/upload')) {
          uploadStartTime = Date.now();
        }
      });
      
      page.on('response', response => {
        if (response.url().includes('/api/v1/upload')) {
          uploadEndTime = Date.now();
        }
      });
      
      await compressPage.uploadFile('fixtures/test-files/large-sample.pdf');
      
      const uploadTime = uploadEndTime! - uploadStartTime!;
      expect(uploadTime).toBeLessThan(5000); // 5 seconds for large files
    });

    test('compression API should process files efficiently', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await compressPage.navigate();
      await compressPage.uploadFile('fixtures/test-files/sample.pdf');
      
      let compressionStartTime: number;
      let compressionEndTime: number;
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/compress')) {
          compressionStartTime = Date.now();
        }
      });
      
      // Mock compression response
      await page.route('**/api/v1/compress', (route) => {
        compressionEndTime = Date.now();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              taskId: 'perf-test-task',
              originalSize: 1024000,
              compressedSize: 512000,
              compressionRatio: 50
            }
          })
        });
      });
      
      await compressPage.startCompression();
      
      const compressionTime = compressionEndTime! - compressionStartTime!;
      expect(compressionTime).toBeLessThan(3000); // 3 seconds for small files
    });
  });

  test.describe('Resource Usage', () => {
    test('should not have memory leaks during file processing', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await compressPage.navigate();
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Process multiple files
      for (let i = 0; i < 5; i++) {
        await compressPage.uploadFile(`fixtures/test-files/sample.pdf`);
        await compressPage.startCompression();
        await compressPage.waitForCompressionComplete();
        await compressPage.clearFiles();
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Memory should not increase by more than 50MB
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should limit concurrent uploads', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await compressPage.navigate();
      
      let concurrentRequests = 0;
      let maxConcurrentRequests = 0;
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/upload')) {
          concurrentRequests++;
          maxConcurrentRequests = Math.max(maxConcurrentRequests, concurrentRequests);
        }
      });
      
      page.on('response', response => {
        if (response.url().includes('/api/v1/upload')) {
          concurrentRequests--;
        }
      });
      
      // Try to upload multiple files simultaneously
      const uploadPromises = [];
      for (let i = 0; i < 10; i++) {
        uploadPromises.push(compressPage.uploadFile(`fixtures/test-files/sample.pdf`));
      }
      
      await Promise.allSettled(uploadPromises);
      
      // Should limit concurrent uploads to prevent overwhelming the server
      expect(maxConcurrentRequests).toBeLessThanOrEqual(3);
    });
  });

  test.describe('User Experience Performance', () => {
    test('should show loading states quickly', async ({ page }) => {
      await authPage.navigateToLogin();
      
      // Delay the login API response
      await page.route('**/api/v1/auth/login', async (route) => {
        await page.waitForTimeout(1000); // 1 second delay
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              user: { id: '1', email: 'test@example.com', name: 'Test User' },
              token: 'mock-jwt-token'
            }
          })
        });
      });
      
      await authPage.fillLoginForm({
        email: 'test@example.com',
        password: 'password123'
      });
      
      const startTime = Date.now();
      await authPage.loginButton.click();
      
      // Loading indicator should appear quickly
      await expect(authPage.loadingSpinner).toBeVisible({ timeout: 200 });
      
      const loadingAppearTime = Date.now() - startTime;
      expect(loadingAppearTime).toBeLessThan(200); // Should show loading within 200ms
    });

    test('should debounce search inputs', async ({ page }) => {
      await homePage.navigate();
      
      let searchRequestCount = 0;
      
      page.on('request', request => {
        if (request.url().includes('/api/v1/search')) {
          searchRequestCount++;
        }
      });
      
      const searchInput = page.locator('[data-testid="search-input"]');
      
      // Type quickly to test debouncing
      await searchInput.type('test query', { delay: 50 });
      
      // Wait for debounce period
      await page.waitForTimeout(1000);
      
      // Should only make one search request due to debouncing
      expect(searchRequestCount).toBeLessThanOrEqual(1);
    });

    test('should handle rapid user interactions gracefully', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await compressPage.navigate();
      
      let errorCount = 0;
      
      page.on('pageerror', () => {
        errorCount++;
      });
      
      // Rapidly click compression button
      await compressPage.uploadFile('fixtures/test-files/sample.pdf');
      for (let i = 0; i < 10; i++) {
        compressPage.compressionButton.click({ timeout: 100 }).catch(() => {});
      }
      
      await page.waitForTimeout(2000);
      
      // Should not cause JavaScript errors
      expect(errorCount).toBe(0);
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G connection
      await page.route('**/*', async (route) => {
        await page.waitForTimeout(200); // Add 200ms delay to all requests
        route.continue();
      });
      
      const startTime = Date.now();
      
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      
      // Page should still load within reasonable time on slow connection
      expect(loadTime).toBeLessThan(8000); // 8 seconds max for slow connection
      
      // Essential content should be visible
      await expect(homePage.heroSection).toBeVisible();
      await expect(homePage.ctaButton).toBeVisible();
    });

    test('should work offline for cached content', async ({ page, context }) => {
      // First, load the page online to cache it
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      // Go offline
      await context.setOffline(true);
      
      // Navigate to cached page
      await homePage.navigate();
      
      // Should still show basic UI even offline
      await expect(homePage.logoLink).toBeVisible({ timeout: 5000 });
      
      // Online features should show appropriate offline messaging
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Go back online
      await context.setOffline(false);
    });

    test('should retry failed requests', async ({ page }) => {
      let requestCount = 0;
      
      await page.route('**/api/v1/auth/login', (route) => {
        requestCount++;
        if (requestCount < 3) {
          // Fail first 2 requests
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, error: 'Server error' })
          });
        } else {
          // Succeed on 3rd request
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                user: { id: '1', email: 'test@example.com', name: 'Test User' },
                token: 'mock-jwt-token'
              }
            })
          });
        }
      });
      
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Should eventually succeed after retries
      await expect(page).toHaveURL(/\/(dashboard|compress)/);
      expect(requestCount).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('Lighthouse Performance Audits', () => {
    test('homepage should meet Lighthouse performance standards', async ({ page }) => {
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      // Get basic performance metrics using the Performance API
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          loadComplete: navigation.loadEventEnd - navigation.navigationStart,
          firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          transferSize: navigation.transferSize || 0,
          resourceCount: performance.getEntriesByType('resource').length
        };
      });
      
      // Performance assertions based on Lighthouse standards
      expect(metrics.firstContentfulPaint).toBeLessThan(1800); // FCP < 1.8s
      expect(metrics.domContentLoaded).toBeLessThan(2500); // DCL < 2.5s
      expect(metrics.transferSize).toBeLessThan(1024 * 1024); // < 1MB initial transfer
      expect(metrics.resourceCount).toBeLessThan(50); // Reasonable resource count
    });

    test('should have good Core Web Vitals scores', async ({ page }) => {
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      // Simulate user interactions to measure CLS and FID
      await homePage.ctaButton.hover();
      await page.waitForTimeout(100);
      await homePage.ctaButton.click();
      
      // Get CLS and other layout metrics
      const vitalsMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Simplified vitals measurement
          let clsValue = 0;
          let fidValue = 0;
          let lcpValue = 0;
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              switch (entry.entryType) {
                case 'layout-shift':
                  if (!(entry as any).hadRecentInput) {
                    clsValue += (entry as any).value;
                  }
                  break;
                case 'first-input':
                  fidValue = (entry as any).processingStart - entry.startTime;
                  break;
                case 'largest-contentful-paint':
                  lcpValue = entry.startTime;
                  break;
              }
            }
          });
          
          observer.observe({ entryTypes: ['layout-shift', 'first-input', 'largest-contentful-paint'] });
          
          setTimeout(() => {
            resolve({ cls: clsValue, fid: fidValue, lcp: lcpValue });
          }, 3000);
        });
      });
      
      const { cls, fid, lcp } = vitalsMetrics as any;
      
      // Core Web Vitals thresholds
      expect(cls).toBeLessThan(0.1); // CLS < 0.1 (good)
      expect(lcp).toBeLessThan(2500); // LCP < 2.5s (good)
      if (fid > 0) {
        expect(fid).toBeLessThan(100); // FID < 100ms (good)
      }
    });
  });
});