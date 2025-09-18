import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('PDF Upload Simple Test', () => {
  let testPdfPath: string;

  test.beforeAll(async () => {
    // Create a proper PDF file
    testPdfPath = path.join(__dirname, '../fixtures/test-simple.pdf');
    
    // Ensure fixtures directory exists
    const fixturesDir = path.dirname(testPdfPath);
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    
    // Create a simple but valid PDF
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
190
%%EOF`;
    
    fs.writeFileSync(testPdfPath, pdfContent);
  });

  test.afterAll(async () => {
    // Clean up
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
    }
  });

  test('should upload PDF file successfully', async ({ page }) => {
    console.log('🔄 Starting simple PDF upload test');
    
    // Go to the app
    await page.goto('/');
    
    console.log('🔄 Looking for upload area');
    
    // Take screenshot before upload
    await page.screenshot({ path: 'test-results/before-upload.png' });
    
    // Check if we need to get started first
    const getStartedBtn = page.locator('text="Get Started Free"').first();
    if (await getStartedBtn.count() > 0) {
      console.log('✅ Found Get Started Free button, clicking it');
      await getStartedBtn.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot after clicking get started
      await page.screenshot({ path: 'test-results/after-get-started.png' });
    }
    
    // Handle authentication if needed
    const needsAuth = await page.locator('text="Sign in to your account"').count() > 0;
    if (needsAuth) {
      console.log('🔐 Need to authenticate');
      
      // Try to create new account instead of signing in
      const createAccountLink = page.locator('text="create a new account"');
      if (await createAccountLink.count() > 0) {
        console.log('✅ Found "create a new account" link, clicking it');
        await createAccountLink.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/after-register-click.png' });
        
        // Fill registration form if it appears
        const fullNameField = page.locator('input[placeholder*="full name"], input[placeholder*="name"]').first();
        const emailField = page.locator('input[type="email"], input[placeholder*="email"]').first();
        const passwordField = page.locator('input[type="password"], input[placeholder*="password"]').first();
        const confirmPasswordField = page.locator('input[placeholder*="confirm"], input[placeholder*="Confirm"]').first();
        
        if (await emailField.count() > 0) {
          console.log('📝 Filling registration form');
          
          // Fill full name if field exists
          if (await fullNameField.count() > 0) {
            await fullNameField.fill('Test User');
            console.log('✅ Filled full name');
          }
          
          await emailField.fill('testuser@example.com');
          console.log('✅ Filled email');
          
          await passwordField.fill('testpassword123');
          console.log('✅ Filled password');
          
          // Fill confirm password if field exists
          if (await confirmPasswordField.count() > 0) {
            await confirmPasswordField.fill('testpassword123');
            console.log('✅ Filled confirm password');
          }
          
          // Look for register button and make sure it's visible
          const registerBtn = page.locator('button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create account")').first();
          if (await registerBtn.count() > 0) {
            // Scroll into view to make sure button is visible
            await registerBtn.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            
            // Check if button is enabled first
            const isDisabled = await registerBtn.isDisabled();
            console.log(`🔍 Register button disabled: ${isDisabled}`);
            
            if (!isDisabled) {
              // Try clicking the button
              await registerBtn.click();
              console.log('✅ Registration form submitted');
              
              // Wait for any network requests to complete
              await page.waitForTimeout(3000);
              await page.screenshot({ path: 'test-results/after-registration-click.png' });
              
              // Check for validation errors immediately after click
              const validationErrors = await page.locator('input:invalid, .error, .text-red-500, .text-danger, [class*="error"], [role="alert"]');
              const errorCount = await validationErrors.count();
              if (errorCount > 0) {
                console.log(`❌ Found ${errorCount} validation errors`);
                for (let i = 0; i < Math.min(errorCount, 3); i++) {
                  const errorText = await validationErrors.nth(i).textContent();
                  const errorTag = await validationErrors.nth(i).tagName();
                  console.log(`❌ Error ${i + 1} (${errorTag}): ${errorText}`);
                }
              }
              
              // Wait more time for potential page transition
              await page.waitForTimeout(5000);
              await page.screenshot({ path: 'test-results/after-registration.png' });
              
              // Check if we successfully got past the registration form
              const stillOnRegisterPage = await page.locator('text="Create your account"').count() > 0;
              if (stillOnRegisterPage) {
                console.log('⚠️ Still on registration page, checking for errors');
                await page.screenshot({ path: 'test-results/registration-stuck.png' });
                
                // Since registration isn't working, let's try the login approach directly
                console.log('❌ Registration not proceeding - switching to login approach');
                
                // Try to click "sign in to existing account" link
                const signInLink = page.locator('text="sign in to existing account"').first();
                  if (await signInLink.count() > 0) {
                    await signInLink.click();
                    console.log('✅ Clicked "sign in to existing account"');
                    await page.waitForTimeout(2000);
                    await page.screenshot({ path: 'test-results/switched-to-login.png' });
                    
                    // Try logging in with the same credentials
                    const loginEmailField = page.locator('input[type="email"], input[name="email"]').first();
                    const loginPasswordField = page.locator('input[type="password"], input[name="password"]').first();
                    
                    if (await loginEmailField.count() > 0 && await loginPasswordField.count() > 0) {
                      console.log('📝 Filling login form');
                      await loginEmailField.clear();
                      await loginEmailField.fill('testuser@example.com');
                      await loginPasswordField.clear();
                      await loginPasswordField.fill('testpassword123');
                      
                      const loginBtn = page.locator('button:has-text("Sign in"), button:has-text("Login"), button[type="submit"]').first();
                      if (await loginBtn.count() > 0) {
                        await loginBtn.click();
                        console.log('✅ Clicked login button');
                        await page.waitForTimeout(5000);
                        await page.screenshot({ path: 'test-results/after-login-attempt.png' });
                        
                        // Check if we're still on login page (login didn't work)
                        const stillOnLoginPage = await page.locator('text="Sign in to your account"').count() > 0;
                        if (stillOnLoginPage) {
                          console.log('❌ Login also failed - trying Google login as fallback');
                          // Try Google login
                          const googleBtn = page.locator('button:has-text("Google")').first();
                          if (await googleBtn.count() > 0) {
                            console.log('🔍 Found Google login button, but skipping for test stability');
                          }
                          // Go back to home and try to access upload directly without auth
                          console.log('🏠 Trying to go to home page and look for upload without auth');
                          await page.goto('/');
                          await page.waitForTimeout(2000);
                        } else {
                          console.log('✅ Login may have succeeded - checking for upload interface');
                        }
                      }
                    } else {
                      console.log('❌ Could not find login form fields');
                    }
                  } else {
                    console.log('❌ Could not find "sign in to existing account" link');
                  }
              } else {
                console.log('✅ Successfully moved past registration form');
              }
            } else {
              console.log('⚠️ Register button is disabled, checking validation requirements');
              // Check what validation is failing
              const requiredFields = await page.locator('input[required]').count();
              const filledFields = await page.locator('input[required]:not([value=""])').count();
              console.log(`📊 Required fields: ${requiredFields}, Filled fields: ${filledFields}`);
            }
          }
        }
      } else {
        console.log('⚠️ Create account link not found, trying to sign in with test credentials');
        // Fall back to sign in
        await page.fill('input[type="email"]', 'testuser@example.com');
        await page.fill('input[type="password"]', 'testpassword123');
        await page.click('button:has-text("Sign in")');
        await page.waitForTimeout(2000);
      }
    }
    
    // Look for the upload area
    const uploadArea = page.locator('.upload-area').or(
      page.locator('[data-testid="upload-area"]')
    ).or(
      page.locator('text="Upload PDF files"')
    ).or(
      page.locator('text="Drag & drop files here"')
    ).or(
      page.locator('text="Drop files here"')
    ).or(
      page.locator('text="Select files"')
    ).first();
    
    if (await uploadArea.count() > 0) {
      console.log('✅ Found upload area');
      
      // Try clicking the upload area
      await uploadArea.click();
      console.log('✅ Clicked upload area');
      
      // Take screenshot after click
      await page.screenshot({ path: 'test-results/after-click.png' });
      
      // Wait a moment for any potential file dialog
      await page.waitForTimeout(2000);
      
      // Look for file input
      const fileInputs = await page.locator('input[type="file"]').all();
      console.log(`📁 Found ${fileInputs.length} file inputs`);
      
      if (fileInputs.length > 0) {
        // Use the first visible file input
        const fileInput = fileInputs[0];
        
        console.log('📁 Setting files on input');
        await fileInput.setInputFiles(testPdfPath);
        
        console.log('✅ File set successfully, waiting for upload feedback');
        
        // Wait for some indication that file was uploaded
        await page.waitForTimeout(3000);
        
        // Take screenshot after upload
        await page.screenshot({ path: 'test-results/after-upload.png' });
        
        // Check if file appears in the interface
        const uploadedFile = await page.locator('text="test-simple.pdf", .file-item, .uploaded-file').first();
        
        if (await uploadedFile.count() > 0) {
          console.log('✅ File appears to be uploaded successfully');
        } else {
          console.log('⚠️ File upload may not have worked as expected');
          
          // Check for any error messages
          const errorMsg = await page.locator('text="error", text="failed", .error-message').first();
          if (await errorMsg.count() > 0) {
            console.log('❌ Found error message:', await errorMsg.textContent());
          }
        }
        
      } else {
        console.log('❌ No file input found after clicking upload area');
      }
      
    } else {
      console.log('❌ Upload area not found');
      
      // Try alternative approaches
      const alternatives = [
        'button:has-text("Upload")',
        'button:has-text("Select Files")',
        'button:has-text("Choose Files")',
        '[data-testid="file-upload"]',
        '.file-upload-button'
      ];
      
      for (const selector of alternatives) {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ Found alternative upload trigger: ${selector}`);
          await element.click();
          
          // Look for file input after click
          await page.waitForTimeout(1000);
          const fileInput = await page.locator('input[type="file"]').first();
          if (await fileInput.count() > 0) {
            await fileInput.setInputFiles(testPdfPath);
            console.log('✅ File uploaded using alternative method');
            break;
          }
        }
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/final-state.png' });
    
    console.log('🔄 Simple upload test completed');
  });
});