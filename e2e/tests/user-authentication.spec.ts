import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  const testUser = {
    email: 'e2e-test@example.com',
    password: 'TestPassword123!',
    firstName: 'E2E',
    lastName: 'Tester'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login/register options for unauthenticated users', async ({ page }) => {
    // Check if login/register buttons are visible
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /register|sign up/i })).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    // Click register button
    await page.getByRole('button', { name: /register|sign up/i }).click();
    
    // Fill registration form
    await page.getByLabel(/first.*name/i).fill(testUser.firstName);
    await page.getByLabel(/last.*name/i).fill(testUser.lastName);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).first().fill(testUser.password);
    await page.getByLabel(/confirm.*password/i).fill(testUser.password);
    
    // Submit registration
    await page.getByRole('button', { name: /register|create.*account/i }).click();
    
    // Should redirect to dashboard or show success message
    await expect(page.getByText(/welcome|registration.*successful|dashboard/i)).toBeVisible({ timeout: 10000 });
    
    // Should show user profile or logout option
    await expect(page.getByRole('button', { name: /profile|logout/i })).toBeVisible();
  });

  test('should prevent registration with invalid data', async ({ page }) => {
    await page.getByRole('button', { name: /register|sign up/i }).click();
    
    // Test invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).first().fill(testUser.password);
    await page.getByLabel(/confirm.*password/i).fill(testUser.password);
    await page.getByRole('button', { name: /register|create.*account/i }).click();
    
    await expect(page.getByText(/valid.*email|email.*format/i)).toBeVisible();
    
    // Test weak password
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).first().fill('123');
    await page.getByLabel(/confirm.*password/i).fill('123');
    await page.getByRole('button', { name: /register|create.*account/i }).click();
    
    await expect(page.getByText(/password.*strong|password.*requirements/i)).toBeVisible();
    
    // Test password mismatch
    await page.getByLabel(/password/i).first().fill(testUser.password);
    await page.getByLabel(/confirm.*password/i).fill('DifferentPassword123!');
    await page.getByRole('button', { name: /register|create.*account/i }).click();
    
    await expect(page.getByText(/passwords.*match|password.*confirmation/i)).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // First register the user (assuming registration endpoint exists)
    // This could be done via API or by running the registration test first
    
    // Click login button
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Fill login form
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    
    // Submit login
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page.getByText(/welcome.*back|dashboard/i)).toBeVisible({ timeout: 10000 });
    
    // Should show authenticated user interface
    await expect(page.getByRole('button', { name: /profile|logout/i })).toBeVisible();
  });

  test('should prevent login with invalid credentials', async ({ page }) => {
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Test with wrong email
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    await expect(page.getByText(/invalid.*credentials|login.*failed/i)).toBeVisible();
    
    // Test with wrong password
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    await expect(page.getByText(/invalid.*credentials|login.*failed/i)).toBeVisible();
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Click forgot password link
    await page.getByRole('link', { name: /forgot.*password/i }).click();
    
    // Enter email
    await page.getByLabel(/email/i).fill(testUser.email);
    
    // Submit forgot password request
    await page.getByRole('button', { name: /send.*reset|reset.*password/i }).click();
    
    // Should show confirmation message
    await expect(page.getByText(/reset.*instructions.*sent|check.*email/i)).toBeVisible();
  });

  test('should display user profile when authenticated', async ({ page }) => {
    // Login first (this assumes we have a way to authenticate)
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
    
    // Click profile button
    await page.getByRole('button', { name: /profile/i }).click();
    
    // Should show user information
    await expect(page.getByText(/test@example\.com|Test User/i)).toBeVisible();
    
    // Should show profile edit options
    await expect(page.getByRole('button', { name: /edit.*profile|update.*profile/i })).toBeVisible();
  });

  test('should update user profile', async ({ page }) => {
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
    await page.getByRole('button', { name: /profile/i }).click();
    
    // Click edit profile
    await page.getByRole('button', { name: /edit.*profile/i }).click();
    
    // Update profile information
    await page.getByLabel(/first.*name/i).fill('Updated');
    await page.getByLabel(/last.*name/i).fill('Name');
    
    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();
    
    // Should show success message
    await expect(page.getByText(/profile.*updated|changes.*saved/i)).toBeVisible();
    
    // Should display updated information
    await expect(page.getByText(/Updated Name/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
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
    
    // Click logout
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    
    // Should redirect to home/login page
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
    
    // Should clear authentication state
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(authToken).toBeNull();
  });

  test('should restrict access to protected features for unauthenticated users', async ({ page }) => {
    // Try to access a protected feature (e.g., compression history)
    await page.goto('/history');
    
    // Should redirect to login or show login required message
    await expect(page.getByText(/login.*required|please.*sign.*in/i)).toBeVisible();
  });

  test('should show authentication status in header', async ({ page }) => {
    // Check unauthenticated state
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
    
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
    
    // Check authenticated state
    await expect(page.getByText(/Test User|test@example\.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  });
});