import { test, expect } from '@playwright/test';
import { AuthPage } from '../fixtures/page-objects/AuthPage';
import { HomePage } from '../fixtures/page-objects/HomePage';
import { CompressPage } from '../fixtures/page-objects/CompressPage';
import { PricingPage } from '../fixtures/page-objects/PricingPage';
import { CheckoutPage } from '../fixtures/page-objects/CheckoutPage';
import { SettingsPage } from '../fixtures/page-objects/SettingsPage';

test.describe('Visual Regression Tests', () => {
  let homePage: HomePage;
  let authPage: AuthPage;
  let compressPage: CompressPage;
  let pricingPage: PricingPage;
  let checkoutPage: CheckoutPage;
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    authPage = new AuthPage(page);
    compressPage = new CompressPage(page);
    pricingPage = new PricingPage(page);
    checkoutPage = new CheckoutPage(page);
    settingsPage = new SettingsPage(page);
  });

  test.describe('Landing Page', () => {
    test('should match homepage layout', async ({ page }) => {
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot('homepage-full.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match hero section', async ({ page }) => {
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      // Screenshot of hero section
      await expect(homePage.heroSection).toHaveScreenshot('hero-section.png');
    });

    test('should match features section', async ({ page }) => {
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      // Screenshot of features section
      await expect(homePage.featuresSection).toHaveScreenshot('features-section.png');
    });

    test('should match testimonials section', async ({ page }) => {
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      // Screenshot of testimonials
      await expect(homePage.testimonialsSection).toHaveScreenshot('testimonials-section.png');
    });
  });

  test.describe('Authentication Pages', () => {
    test('should match login form', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.waitForPageLoad();
      
      await expect(authPage.loginForm).toHaveScreenshot('login-form.png');
    });

    test('should match signup form', async ({ page }) => {
      await authPage.navigateToSignUp();
      await authPage.waitForPageLoad();
      
      await expect(authPage.signUpForm).toHaveScreenshot('signup-form.png');
    });

    test('should match forgot password form', async ({ page }) => {
      await authPage.navigateToForgotPassword();
      await authPage.waitForPageLoad();
      
      await expect(authPage.forgotPasswordForm).toHaveScreenshot('forgot-password-form.png');
    });

    test('should match login form with validation errors', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.loginButton.click();
      
      await expect(authPage.loginForm).toHaveScreenshot('login-form-with-errors.png');
    });
  });

  test.describe('PDF Compression Interface', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('should match compression page initial state', async ({ page }) => {
      await compressPage.navigate();
      await compressPage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('compression-page-initial.png', {
        fullPage: true
      });
    });

    test('should match file upload area', async ({ page }) => {
      await compressPage.navigate();
      await compressPage.waitForPageLoad();
      
      await expect(compressPage.uploadArea).toHaveScreenshot('upload-area.png');
    });

    test('should match compression settings panel', async ({ page }) => {
      await compressPage.navigate();
      await compressPage.waitForPageLoad();
      await compressPage.toggleAdvancedSettings();
      
      await expect(compressPage.advancedSettings).toHaveScreenshot('compression-settings.png');
    });

    test('should match file preview with multiple files', async ({ page }) => {
      await compressPage.navigate();
      
      // Mock file upload
      await page.route('**/api/v1/upload', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              files: [
                { id: '1', name: 'document1.pdf', size: 1024000 },
                { id: '2', name: 'document2.pdf', size: 2048000 },
                { id: '3', name: 'document3.pdf', size: 512000 }
              ]
            }
          })
        });
      });

      await compressPage.uploadMultipleFiles(['test1.pdf', 'test2.pdf', 'test3.pdf']);
      
      await expect(compressPage.filesList).toHaveScreenshot('files-preview-multiple.png');
    });

    test('should match compression progress', async ({ page }) => {
      await compressPage.navigate();
      
      // Mock compression in progress
      await page.route('**/api/v1/compress', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { taskId: 'test-task-123' }
          })
        });
      });

      await page.route('**/api/v1/compress/progress/test-task-123', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { progress: 65, status: 'processing', message: 'Optimizing images...' }
          })
        });
      });

      await compressPage.uploadFile('test.pdf');
      await compressPage.startCompression();
      
      await expect(compressPage.progressContainer).toHaveScreenshot('compression-progress.png');
    });
  });

  test.describe('Pricing Page', () => {
    test('should match pricing cards with monthly billing', async ({ page }) => {
      await pricingPage.navigate();
      await pricingPage.waitForPageLoad();
      await pricingPage.selectMonthlyBilling();
      
      await expect(pricingPage.pricingCards).toHaveScreenshot('pricing-cards-monthly.png');
    });

    test('should match pricing cards with yearly billing', async ({ page }) => {
      await pricingPage.navigate();
      await pricingPage.waitForPageLoad();
      await pricingPage.selectYearlyBilling();
      
      await expect(pricingPage.pricingCards).toHaveScreenshot('pricing-cards-yearly.png');
    });

    test('should match FAQ section', async ({ page }) => {
      await pricingPage.navigate();
      await pricingPage.waitForPageLoad();
      
      await expect(pricingPage.faqSection).toHaveScreenshot('pricing-faq.png');
    });

    test('should match pricing comparison table', async ({ page }) => {
      await pricingPage.navigate();
      await pricingPage.waitForPageLoad();
      
      await expect(pricingPage.comparisonTable).toHaveScreenshot('pricing-comparison.png');
    });
  });

  test.describe('Checkout and Payment', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('should match checkout form', async ({ page }) => {
      await pricingPage.navigate();
      await pricingPage.selectPlan('pro', 'monthly');
      await checkoutPage.waitForPageLoad();
      
      await expect(checkoutPage.checkoutForm).toHaveScreenshot('checkout-form.png');
    });

    test('should match payment methods', async ({ page }) => {
      await pricingPage.navigate();
      await pricingPage.selectPlan('pro', 'monthly');
      await checkoutPage.waitForPageLoad();
      
      await expect(checkoutPage.paymentMethods).toHaveScreenshot('payment-methods.png');
    });

    test('should match order summary', async ({ page }) => {
      await pricingPage.navigate();
      await pricingPage.selectPlan('pro', 'yearly');
      await checkoutPage.waitForPageLoad();
      
      await expect(checkoutPage.orderSummary).toHaveScreenshot('order-summary.png');
    });

    test('should match payment success page', async ({ page }) => {
      await page.route('**/api/v1/subscription/create', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              subscriptionId: 'sub_123',
              status: 'active',
              plan: 'pro'
            }
          })
        });
      });

      await pricingPage.navigate();
      await pricingPage.selectPlan('basic', 'monthly');
      await checkoutPage.fillPaymentForm({
        cardNumber: '4242424242424242',
        expiry: '12/25',
        cvc: '123',
        name: 'Test User'
      });
      await checkoutPage.completePayment();
      
      await expect(page).toHaveScreenshot('payment-success.png', { fullPage: true });
    });
  });

  test.describe('Settings and Profile', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    test('should match profile settings', async ({ page }) => {
      await settingsPage.navigate();
      await settingsPage.navigateToProfile();
      
      await expect(settingsPage.profileSection).toHaveScreenshot('profile-settings.png');
    });

    test('should match security settings', async ({ page }) => {
      await settingsPage.navigate();
      await settingsPage.navigateToSecurity();
      
      await expect(settingsPage.securitySection).toHaveScreenshot('security-settings.png');
    });

    test('should match subscription settings', async ({ page }) => {
      await settingsPage.navigate();
      await settingsPage.navigateToSubscription();
      
      await expect(settingsPage.subscriptionSection).toHaveScreenshot('subscription-settings.png');
    });

    test('should match API settings', async ({ page }) => {
      await settingsPage.navigate();
      await settingsPage.navigateToAPI();
      
      await expect(settingsPage.apiSection).toHaveScreenshot('api-settings.png');
    });

    test('should match preferences settings', async ({ page }) => {
      await settingsPage.navigate();
      await settingsPage.navigateToPreferences();
      
      await expect(settingsPage.preferencesSection).toHaveScreenshot('preferences-settings.png');
    });
  });

  test.describe('Mobile Responsive Views', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    });

    test('should match mobile homepage', async ({ page }) => {
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('mobile-homepage.png', {
        fullPage: true
      });
    });

    test('should match mobile compression interface', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await compressPage.navigate();
      await compressPage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('mobile-compression.png', {
        fullPage: true
      });
    });

    test('should match mobile navigation menu', async ({ page }) => {
      await homePage.navigate();
      await page.click('[data-testid="mobile-menu-button"]');
      
      await expect(page.locator('[data-testid="mobile-menu"]')).toHaveScreenshot('mobile-navigation.png');
    });

    test('should match mobile pricing cards', async ({ page }) => {
      await pricingPage.navigate();
      await pricingPage.waitForPageLoad();
      
      await expect(pricingPage.pricingCards).toHaveScreenshot('mobile-pricing-cards.png');
    });
  });

  test.describe('Dark Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Enable dark mode
      await page.addInitScript(() => {
        window.localStorage.setItem('theme', 'dark');
      });
    });

    test('should match dark mode homepage', async ({ page }) => {
      await homePage.navigate();
      await homePage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('dark-homepage.png', {
        fullPage: true
      });
    });

    test('should match dark mode compression interface', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await compressPage.navigate();
      await compressPage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('dark-compression.png', {
        fullPage: true
      });
    });

    test('should match dark mode settings', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await settingsPage.navigate();
      await settingsPage.waitForPageLoad();
      
      await expect(page).toHaveScreenshot('dark-settings.png', {
        fullPage: true
      });
    });
  });

  test.describe('Error States', () => {
    test('should match 404 error page', async ({ page }) => {
      await page.goto('/non-existent-page');
      
      await expect(page).toHaveScreenshot('404-error.png', {
        fullPage: true
      });
    });

    test('should match network error state', async ({ page }) => {
      await page.route('**/api/**', (route) => {
        route.abort('failed');
      });
      
      await compressPage.navigate();
      await compressPage.waitForPageLoad();
      
      await expect(page.locator('[data-testid="error-message"]')).toHaveScreenshot('network-error.png');
    });

    test('should match file upload error', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await compressPage.navigate();
      
      // Mock upload error
      await page.route('**/api/v1/upload', (route) => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'File size too large. Maximum size is 50MB.'
          })
        });
      });
      
      await compressPage.uploadFile('large-file.pdf');
      
      await expect(page.locator('[data-testid="upload-error"]')).toHaveScreenshot('upload-error.png');
    });

    test('should match payment failure', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await page.route('**/api/v1/subscription/create', (route) => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Your card was declined.'
          })
        });
      });
      
      await pricingPage.navigate();
      await pricingPage.selectPlan('pro', 'monthly');
      await checkoutPage.fillPaymentForm({
        cardNumber: '4000000000000002', // Declined card
        expiry: '12/25',
        cvc: '123',
        name: 'Test User'
      });
      await checkoutPage.completePayment();
      
      await expect(page.locator('[data-testid="payment-error"]')).toHaveScreenshot('payment-error.png');
    });
  });

  test.describe('Loading States', () => {
    test('should match compression loading state', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await compressPage.navigate();
      
      // Mock slow compression response
      await page.route('**/api/v1/compress', async (route) => {
        await page.waitForTimeout(500);
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { taskId: 'test-task-123' }
          })
        });
      });
      
      await compressPage.uploadFile('test.pdf');
      await compressPage.compressionButton.click();
      
      // Capture loading state
      await expect(compressPage.loadingSpinner).toHaveScreenshot('compression-loading.png');
    });

    test('should match page loading skeleton', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/v1/subscription/current', async (route) => {
        await page.waitForTimeout(1000);
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { subscription: null }
          })
        });
      });
      
      await authPage.navigateToLogin();
      await authPage.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      await settingsPage.navigate();
      
      // Capture skeleton loading
      await expect(page.locator('[data-testid="skeleton-loader"]')).toHaveScreenshot('skeleton-loading.png');
    });
  });
});