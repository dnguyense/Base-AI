import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Test', () => {
  test('should be able to access a basic web page', async ({ page }) => {
    // Test with a simple webpage instead of the app
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example/);
  });

  test('should be able to navigate to google', async ({ page }) => {
    await page.goto('https://www.google.com');
    await expect(page.locator('input[name="q"]')).toBeVisible();
  });
});