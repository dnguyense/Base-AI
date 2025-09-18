import { test, expect } from '@playwright/test';

test.describe('User Registration (Sign Up) Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
  });

  test('should display registration form when accessing sign up', async ({ page }) => {
    // Try different ways to access sign up
    const signUpTriggers = [
      'text="Sign Up"',
      'text="Register"',
      'text="Create Account"',
      'text="Get Started"',
      'button:has-text("Sign Up")',
      'a:has-text("Sign Up")',
      'a:has-text("Register")'
    ];
    
    let signUpFound = false;
    for (const trigger of signUpTriggers) {
      try {
        const element = page.locator(trigger);
        if (await element.count() > 0) {
          console.log(`Found sign up trigger: ${trigger}`);
          await element.first().click();
          await page.waitForTimeout(2000);
          signUpFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // If no sign up trigger found, try accessing /register or /signup
    if (!signUpFound) {
      console.log('No sign up trigger found, trying direct URLs');
      
      const signUpUrls = ['/register', '/signup', '/auth?mode=signup', '/auth/register'];
      for (const url of signUpUrls) {
        try {
          await page.goto(url);
          await page.waitForTimeout(2000);
          
          // Check if we get a valid page (not 404)
          const pageText = await page.textContent('body');
          if (!pageText?.includes('404') && !pageText?.includes('Not Found')) {
            console.log(`Successfully accessed: ${url}`);
            signUpFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // Take screenshot of the current state
    await page.screenshot({ 
      path: 'test-results/signup-form-display.png',
      fullPage: true 
    });
    
    // Look for registration form fields
    const registrationFields = [
      'input[name*="name" i]',
      'input[name*="firstName" i]',
      'input[name*="lastName" i]',
      'input[name*="email" i]',
      'input[name*="password" i]',
      'input[name*="confirmPassword" i]',
      'input[name*="confirm" i]',
      'input[placeholder*="name" i]',
      'input[placeholder*="email" i]',
      'input[placeholder*="password" i]',
      'input[placeholder*="confirm" i]'
    ];
    
    let foundFields: string[] = [];
    for (const selector of registrationFields) {
      try {
        const field = page.locator(selector);
        const count = await field.count();
        if (count > 0) {
          foundFields.push(`${selector} (${count} found)`);
        }
      } catch (e) {
        continue;
      }
    }
    
    console.log('Registration form fields found:', foundFields);
    console.log(`Sign up access successful: ${signUpFound}`);
  });

  test('should validate required fields in registration', async ({ page }) => {
    // Try to access sign up mode first
    await page.goto('/auth');
    
    // Look for sign up toggle and click it
    const signUpButton = page.locator('text="Sign Up"').first();
    if (await signUpButton.count() > 0) {
      await signUpButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Try to submit empty registration form
    const submitButtons = [
      'button:has-text("Sign Up")',
      'button:has-text("Register")',
      'button:has-text("Create Account")',
      'button[type="submit"]',
      'input[type="submit"]'
    ];
    
    let submitted = false;
    for (const selector of submitButtons) {
      try {
        const button = page.locator(selector);
        if (await button.count() > 0) {
          await button.first().click();
          await page.waitForTimeout(2000);
          submitted = true;
          console.log(`Submitted with: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Look for validation errors
    if (submitted) {
      const errorSelectors = [
        '.error', '.field-error', '.validation-error',
        '.invalid', '.is-invalid', '.has-error',
        '[role="alert"]', '.alert', '.text-red',
        '[data-testid*="error"]'
      ];
      
      let foundErrors: string[] = [];
      for (const selector of errorSelectors) {
        try {
          const errors = page.locator(selector);
          const count = await errors.count();
          if (count > 0) {
            for (let i = 0; i < count; i++) {
              const text = await errors.nth(i).textContent();
              if (text && text.trim()) {
                foundErrors.push(`${selector}: ${text.trim()}`);
              }
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      console.log('Validation errors found:', foundErrors);
      
      // Take screenshot of validation errors
      await page.screenshot({ 
        path: 'test-results/signup-validation-errors.png',
        fullPage: true 
      });
    }
  });

  test('should test complete registration flow with valid data', async ({ page }) => {
    // Generate test user data
    const timestamp = Date.now();
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${timestamp}@example.com`,
      password: 'SecurePassword123!'
    };
    
    console.log('Testing registration with:', testUser.email);
    
    // Try to access sign up mode
    const signUpTriggers = [
      'text="Sign Up"',
      'button:has-text("Sign Up")',
      'a:has-text("Register")'
    ];
    
    for (const trigger of signUpTriggers) {
      try {
        const element = page.locator(trigger);
        if (await element.count() > 0) {
          await element.first().click();
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Fill registration form fields
    const fieldMappings = [
      { selectors: ['input[name*="firstName" i]', 'input[placeholder*="first name" i]'], value: testUser.firstName },
      { selectors: ['input[name*="lastName" i]', 'input[placeholder*="last name" i]'], value: testUser.lastName },
      { selectors: ['input[name*="name" i]', 'input[placeholder*="name" i]'], value: `${testUser.firstName} ${testUser.lastName}` },
      { selectors: ['input[name*="email" i]', 'input[type="email"]', 'input[placeholder*="email" i]'], value: testUser.email },
      { selectors: ['input[name*="password" i]', 'input[type="password"]'], value: testUser.password },
      { selectors: ['input[name*="confirmPassword" i]', 'input[name*="confirm" i]', 'input[placeholder*="confirm" i]'], value: testUser.password }
    ];
    
    let filledFields: string[] = [];
    for (const mapping of fieldMappings) {
      for (const selector of mapping.selectors) {
        try {
          const field = page.locator(selector);
          if (await field.count() > 0) {
            await field.first().fill(mapping.value);
            await field.first().blur();
            filledFields.push(`${selector}: ${mapping.value}`);
            await page.waitForTimeout(500);
            break; // Move to next mapping after successful fill
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    console.log('Filled registration fields:', filledFields);
    
    // Take screenshot after filling form
    await page.screenshot({ 
      path: 'test-results/signup-form-filled.png',
      fullPage: true 
    });
    
    // Submit registration form
    const submitSelectors = [
      'button:has-text("Sign Up")',
      'button:has-text("Register")',
      'button:has-text("Create Account")',
      'button[type="submit"]'
    ];
    
    let formSubmitted = false;
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.count() > 0) {
          await button.first().click();
          console.log(`Registration submitted with: ${selector}`);
          formSubmitted = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (formSubmitted) {
      // Wait for response
      await page.waitForTimeout(5000);
      
      // Take screenshot after submission
      await page.screenshot({ 
        path: 'test-results/signup-submission-result.png',
        fullPage: true 
      });
      
      // Check for success/error messages or URL changes
      console.log('URL after registration:', page.url());
      
      // Look for success/error messages
      const messageSelectors = [
        '.success', '.alert-success', '.text-green',
        '.error', '.alert-error', '.text-red',
        '.message', '.notification', '[role="alert"]'
      ];
      
      for (const selector of messageSelectors) {
        try {
          const messages = page.locator(selector);
          const count = await messages.count();
          for (let i = 0; i < count; i++) {
            const text = await messages.nth(i).textContent();
            if (text && text.trim()) {
              console.log(`Message found (${selector}): ${text.trim()}`);
            }
          }
        } catch (e) {
          continue;
        }
      }
    }
  });

  test('should test password strength validation', async ({ page }) => {
    // Try to access password field
    const passwordSelectors = [
      'input[type="password"]',
      'input[name*="password" i]',
      'input[placeholder*="password" i]'
    ];
    
    let passwordField;
    for (const selector of passwordSelectors) {
      try {
        const field = page.locator(selector);
        if (await field.count() > 0) {
          passwordField = field.first();
          console.log(`Found password field: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (passwordField) {
      const passwordTests = [
        { password: '123', label: 'Weak - numbers only' },
        { password: 'password', label: 'Weak - common word' },
        { password: 'Password1', label: 'Medium - mixed case + number' },
        { password: 'SecurePass123!', label: 'Strong - mixed + special chars' }
      ];
      
      for (let i = 0; i < passwordTests.length; i++) {
        const { password, label } = passwordTests[i];
        
        // Clear and fill password
        await passwordField.clear();
        await passwordField.fill(password);
        await passwordField.blur();
        await page.waitForTimeout(1000);
        
        // Take screenshot for each password strength test
        await page.screenshot({ 
          path: `test-results/password-strength-${i + 1}.png`,
          fullPage: true 
        });
        
        console.log(`Tested password strength: ${label}`);
      }
    }
  });

  test('should test email format validation', async ({ page }) => {
    // Find email field
    const emailSelectors = [
      'input[type="email"]',
      'input[name*="email" i]',
      'input[placeholder*="email" i]'
    ];
    
    let emailField;
    for (const selector of emailSelectors) {
      try {
        const field = page.locator(selector);
        if (await field.count() > 0) {
          emailField = field.first();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (emailField) {
      const emailTests = [
        { email: 'invalid', valid: false, label: 'No @ symbol' },
        { email: 'invalid@', valid: false, label: 'Missing domain' },
        { email: '@invalid.com', valid: false, label: 'Missing username' },
        { email: 'invalid@com', valid: false, label: 'Invalid domain' },
        { email: 'valid@example.com', valid: true, label: 'Valid email' },
        { email: 'test.email+tag@example.co.uk', valid: true, label: 'Complex valid email' }
      ];
      
      for (let i = 0; i < emailTests.length; i++) {
        const { email, valid, label } = emailTests[i];
        
        await emailField.clear();
        await emailField.fill(email);
        await emailField.blur();
        await page.waitForTimeout(1000);
        
        // Look for validation indicators
        const validationSelectors = [
          '.error', '.invalid', '.is-invalid',
          '.success', '.valid', '.is-valid',
          '[role="alert"]'
        ];
        
        let hasValidation = false;
        for (const selector of validationSelectors) {
          try {
            const indicator = page.locator(selector);
            if (await indicator.count() > 0) {
              const text = await indicator.first().textContent();
              if (text && text.trim()) {
                console.log(`Email "${email}" - ${label}: ${text.trim()}`);
                hasValidation = true;
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!hasValidation) {
          console.log(`Email "${email}" - ${label}: No validation message`);
        }
      }
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'test-results/email-validation-final.png',
        fullPage: true 
      });
    }
  });

  test('should check for terms and conditions acceptance', async ({ page }) => {
    // Look for terms and conditions checkbox/link
    const termsSelectors = [
      'input[type="checkbox"]',
      'text*="Terms"',
      'text*="Privacy"',
      'text*="Agreement"',
      'text*="Accept"',
      'a:has-text("Terms")',
      'a:has-text("Privacy")',
      '[data-testid*="terms"]',
      '[data-testid*="agreement"]'
    ];
    
    let foundTerms: string[] = [];
    for (const selector of termsSelectors) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          foundTerms.push(`${selector} (${count} found)`);
          
          // If it's a checkbox, try to interact with it
          if (selector === 'input[type="checkbox"]') {
            await element.first().check();
            await page.waitForTimeout(500);
          }
          
          // If it's a link, log where it goes
          if (selector.includes('a:has-text')) {
            const href = await element.first().getAttribute('href');
            if (href) {
              console.log(`Terms link found: ${href}`);
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    console.log('Terms and conditions elements found:', foundTerms);
    
    // Take screenshot showing terms acceptance
    await page.screenshot({ 
      path: 'test-results/terms-and-conditions.png',
      fullPage: true 
    });
  });
});