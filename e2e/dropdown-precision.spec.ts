import { test, expect } from '@playwright/test';

test.describe('Dropdown Chevron Precision & Alignment Audit Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should verify precise custom chevron styling on Sign-Up Business Type dropdown', async ({ page }) => {
    // Navigate to Sign-Up page via "Create your outlet"
    await page.click('span:has-text("Create your outlet")');
    const businessSelect = page.locator('select').first();
    await expect(businessSelect).toBeVisible();

    // Check computed CSS properties to ensure appearance is reset and custom SVG is present
    const computedStyles = await businessSelect.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        appearance: style.appearance || style.webkitAppearance,
        backgroundImage: style.backgroundImage,
        paddingRight: style.paddingRight,
        borderRadius: style.borderRadius
      };
    });

    expect(computedStyles.appearance).toBe('none');
    expect(computedStyles.backgroundImage).toContain('data:image/svg+xml');
    expect(computedStyles.paddingRight).toBe('40px');
    expect(computedStyles.borderRadius).toBe('7px');

    // Verify option selection works smoothly
    await businessSelect.selectOption('Kafe');
    await expect(businessSelect).toHaveValue('Kafe');
  });

  test('should verify precise custom chevron styling on Menu Item Category dropdown', async ({ page }) => {
    // Login as Owner
    await page.click('button:has-text("Sign In")');
    await page.click('button:has-text("Menu")');
    await expect(page.locator('h1:has-text("Menu Management")')).toBeVisible();

    // Open item modal
    await page.click('button:has-text("Item")');
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();

    const computedStyles = await categorySelect.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        appearance: style.appearance || style.webkitAppearance,
        backgroundImage: style.backgroundImage,
        paddingRight: style.paddingRight
      };
    });

    expect(computedStyles.appearance).toBe('none');
    expect(computedStyles.backgroundImage).toContain('data:image/svg+xml');
    expect(computedStyles.paddingRight).toBe('40px');
  });

  test('should verify precise custom chevron styling on Promotion Discount Type dropdown', async ({ page }) => {
    // Login as Owner and navigate to Vouchers / Promo tab
    await page.click('button:has-text("Sign In")');
    await page.click('button:has-text("Vouchers / Promo")');

    const createPromoBtn = page.locator('button:has-text("Create New Voucher")');
    await expect(createPromoBtn).toBeVisible();
    await createPromoBtn.click();

    const discountSelect = page.locator('select').first();
    await expect(discountSelect).toBeVisible();

    const computedStyles = await discountSelect.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        appearance: style.appearance || style.webkitAppearance,
        backgroundImage: style.backgroundImage,
        paddingRight: style.paddingRight
      };
    });

    expect(computedStyles.appearance).toBe('none');
    expect(computedStyles.backgroundImage).toContain('data:image/svg+xml');
    expect(computedStyles.paddingRight).toBe('40px');

    await discountSelect.selectOption('rp');
    await expect(discountSelect).toHaveValue('rp');
  });
});
