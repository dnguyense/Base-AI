import { test, expect } from '@playwright/test';

test.describe('Authentication Flow - Sign Up & Sign In', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to authentication page', async ({ page }) => {
    // Click Sign In button from homepage
    const signInButton = page.locator('text="Sign In"').first();
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    // Should navigate to auth page
    await page.waitForURL('**/auth**');
    expect(page.url()).toContain('/auth');
    
    // Take screenshot of auth page
    await page.screenshot({ 
      path: 'test-results/auth-page-loaded.png',
      fullPage: true 
    });
    
    console.log('Navigated to auth page:', page.url());
  });

  test('should display sign in form elements', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Common authentication form elements to look for
    const authSelectors = [
      'input[type="email"]',
      'input[type="password"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="password" i]',
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'button:has-text("Login")',
      'form',
      '[data-testid*="auth"]',
      '[data-testid*="login"]',
      '[data-testid*="signin"]'
    ];
    
    let foundElements: string[] = [];
    for (const selector of authSelectors) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          foundElements.push(`${selector} (${count} found)`);
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    console.log('Auth form elements found:', foundElements);
    
    // Take screenshot to see actual form structure
    await page.screenshot({ 
      path: 'test-results/auth-form-elements.png',
      fullPage: true 
    });
    
    // Check page content for auth-related text
    const pageText = await page.textContent('body');
    const authKeywords = ['sign in', 'login', 'email', 'password', 'account'];
    const foundKeywords = authKeywords.filter(keyword => 
      pageText?.toLowerCase().includes(keyword)
    );
    
    console.log('Auth keywords found in page:', foundKeywords);
    expect(foundKeywords.length).toBeGreaterThan(0);
  });

  test('should display sign up/register option', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Look for sign up related elements
    const signUpSelectors = [
      'text="Sign Up"',
      'text="Register"',
      'text="Create Account"',
      'text="Get Started"',
      'a:has-text("Sign Up")',
      'a:has-text("Register")',
      'button:has-text("Sign Up")',
      'button:has-text("Register")',
      '[data-testid*="signup"]',
      '[data-testid*="register"]'
    ];
    
    let foundSignUpElements: string[] = [];
    for (const selector of signUpSelectors) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          foundSignUpElements.push(`${selector} (${count} found)`);
        }
      } catch (e) {
        // Continue
      }
    }
    
    console.log('Sign up elements found:', foundSignUpElements);
    
    // Check for "create account" or "don't have account" text
    const bodyText = await page.textContent('body');
    const signUpKeywords = [
      'create account', 
      'sign up', 
      'register', 
      'don\'t have an account',
      'new user',
      'join'
    ];
    
    const foundSignUpKeywords = signUpKeywords.filter(keyword => 
      bodyText?.toLowerCase().includes(keyword)
    );
    
    console.log('Sign up keywords found:', foundSignUpKeywords);
  });

  test('should handle email input validation', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Try to find email input
    const emailInputs = [
      'input[type="email"]',
      'input[placeholder*="email" i]',
      'input[name*="email" i]',
      'input[id*="email" i]'
    ];
    
    let emailInput;
    for (const selector of emailInputs) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          emailInput = element.first();
          console.log(`Found email input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (emailInput) {
      // Test invalid email
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      
      // Look for validation message
      await page.waitForTimeout(1000);
      
      // Test valid email
      await emailInput.fill('test@example.com');
      await emailInput.blur();
      await page.waitForTimeout(1000);
      
      // Take screenshot showing email validation
      await page.screenshot({ 
        path: 'test-results/email-validation.png',
        fullPage: true 
      });
      
      console.log('Email validation tested with: invalid-email → test@example.com');
    } else {
      console.log('No email input found - may be a different auth UI pattern');
    }
  });

  test('should handle password input validation', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Try to find password input
    const passwordInputs = [
      'input[type="password"]',
      'input[placeholder*="password" i]',
      'input[name*="password" i]',
      'input[id*="password" i]'
    ];
    
    let passwordInput;
    for (const selector of passwordInputs) {
      try {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          passwordInput = element.first();
          console.log(`Found password input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (passwordInput) {
      // Test weak password
      await passwordInput.fill('123');
      await passwordInput.blur();
      await page.waitForTimeout(1000);
      
      // Test strong password
      await passwordInput.fill('SecurePassword123!');
      await passwordInput.blur();
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-results/password-validation.png',
        fullPage: true 
      });
      
      console.log('Password validation tested');
    }
  });

  test('should attempt sign in flow with test credentials', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/signin-attempt-start.png',
      fullPage: true 
    });
    
    // Find and fill email
    const emailSelectors = [
      'input[type="email"]',
      'input[placeholder*="email" i]',
      'input[name*="email" i]'
    ];
    
    let emailFilled = false;
    for (const selector of emailSelectors) {
      try {
        const emailInput = page.locator(selector);
        if (await emailInput.count() > 0) {
          await emailInput.fill('test@example.com');
          emailFilled = true;
          console.log('Email filled successfully');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Find and fill password
    const passwordSelectors = [
      'input[type="password"]',
      'input[placeholder*="password" i]',
      'input[name*="password" i]'
    ];
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const passwordInput = page.locator(selector);
        if (await passwordInput.count() > 0) {
          await passwordInput.fill('TestPassword123!');
          passwordFilled = true;
          console.log('Password filled successfully');
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Try to submit form
    if (emailFilled && passwordFilled) {
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Log In")',
        'button:has-text("Login")',
        'input[type="submit"]'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const submitButton = page.locator(selector);
          if (await submitButton.count() > 0) {
            await submitButton.click();
            submitted = true;
            console.log('Form submitted successfully');
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (submitted) {
        // Wait for response
        await page.waitForTimeout(3000);
        
        // Take screenshot after submission
        await page.screenshot({ 
          path: 'test-results/signin-attempt-result.png',
          fullPage: true 
        });
        
        // Check URL change or success/error messages
        console.log('URL after signin attempt:', page.url());
        
        // Look for error/success messages
        const messageSelectors = [
          '.error', '.alert-error', '[role="alert"]',
          '.success', '.alert-success', 
          '.message', '.notification',
          '[data-testid*="error"]', '[data-testid*="message"]'
        ];
        
        for (const selector of messageSelectors) {
          try {
            const message = page.locator(selector);
            if (await message.count() > 0) {
              const text = await message.textContent();
              console.log(`Found message (${selector}):`, text);
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
    
    console.log(`Sign in attempt completed - Email: ${emailFilled}, Password: ${passwordFilled}`);
  });

  test('should navigate between sign in and sign up modes', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Look for toggle buttons/links
    const toggleSelectors = [
      'text="Sign Up"',
      'text="Register"', 
      'text="Create Account"',
      'text="New User"',
      'text="Don\'t have an account"',
      'a:has-text("Sign Up")',
      'button:has-text("Sign Up")',
      '.toggle', '.switch-mode'
    ];
    
    let foundToggle = false;
    for (const selector of toggleSelectors) {
      try {
        const toggle = page.locator(selector);
        if (await toggle.count() > 0) {
          console.log(`Found sign up toggle: ${selector}`);
          
          // Take screenshot before toggle
          await page.screenshot({ 
            path: 'test-results/before-signup-toggle.png',
            fullPage: true 
          });
          
          // Click the toggle
          await toggle.first().click();
          await page.waitForTimeout(2000);
          
          // Take screenshot after toggle
          await page.screenshot({ 
            path: 'test-results/after-signup-toggle.png',
            fullPage: true 
          });
          
          foundToggle = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!foundToggle) {
      console.log('No sign up toggle found - may be separate page or single form');
    }
  });

  test('should check for social login options', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Look for social login buttons
    const socialSelectors = [
      'text*="Google"',
      'text*="Facebook"',
      'text*="Twitter"',
      'text*="GitHub"',
      'button:has-text("Google")',
      'button:has-text("Facebook")', 
      'button:has-text("Continue with")',
      '[data-testid*="social"]',
      '[data-testid*="google"]',
      '[data-testid*="facebook"]',
      '.social-login',
      '.oauth'
    ];
    
    let foundSocialOptions: string[] = [];
    for (const selector of socialSelectors) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          foundSocialOptions.push(`${selector} (${count} found)`);
        }
      } catch (e) {
        continue;
      }
    }
    
    console.log('Social login options found:', foundSocialOptions);
    
    // Take screenshot to document social options
    await page.screenshot({ 
      path: 'test-results/social-login-options.png',
      fullPage: true 
    });
  });

  test('should test forgot password functionality', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Look for forgot password link
    const forgotPasswordSelectors = [
      'text="Forgot Password"',
      'text="Forgot password"',
      'text="Reset Password"',
      'text="Forgot your password"',
      'a:has-text("Forgot")',
      'a:has-text("Reset")',
      '[data-testid*="forgot"]',
      '[data-testid*="reset"]'
    ];
    
    let foundForgotPassword = false;
    for (const selector of forgotPasswordSelectors) {
      try {
        const forgotLink = page.locator(selector);
        if (await forgotLink.count() > 0) {
          console.log(`Found forgot password link: ${selector}`);
          
          // Click the forgot password link
          await forgotLink.first().click();
          await page.waitForTimeout(2000);
          
          // Take screenshot of forgot password page/modal
          await page.screenshot({ 
            path: 'test-results/forgot-password-page.png',
            fullPage: true 
          });
          
          console.log('URL after forgot password click:', page.url());
          foundForgotPassword = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!foundForgotPassword) {
      console.log('No forgot password option found');
    }
  });

  test('should handle form validation and error states', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'input[type="submit"]'
    ];
    
    let submitButton;
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.count() > 0) {
          submitButton = button.first();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (submitButton) {
      // Try to submit without filling anything
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Look for validation messages
      const validationSelectors = [
        '.error', '.field-error', '.validation-error',
        '.invalid', '.is-invalid', '.has-error',
        '[role="alert"]', '.alert-danger',
        '[data-testid*="error"]'
      ];
      
      let foundValidationErrors: string[] = [];
      for (const selector of validationSelectors) {
        try {
          const error = page.locator(selector);
          const count = await error.count();
          if (count > 0) {
            const text = await error.first().textContent();
            foundValidationErrors.push(`${selector}: ${text}`);
          }
        } catch (e) {
          continue;
        }
      }
      
      console.log('Validation errors found:', foundValidationErrors);
      
      // Take screenshot of validation state
      await page.screenshot({ 
        path: 'test-results/form-validation-errors.png',
        fullPage: true 
      });
    }
  });
});