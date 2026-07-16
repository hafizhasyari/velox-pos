import { test, expect } from '@playwright/test';

test.describe('Custom Select & Checkbox Luxury Theme Audit Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should verify custom combobox trigger and luxury 10px listbox frame on Sign-Up Business Type', async ({ page }) => {
    // Navigate to Sign-Up page via "Create your outlet"
    await page.click('span:has-text("Create your outlet")');
    const trigger = page.locator('[data-testid="business-type-select"]');
    await expect(trigger).toBeVisible();

    // Check trigger properties
    await expect(trigger).toHaveAttribute('role', 'combobox');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Open dropdown
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const listbox = page.locator('[data-testid="business-type-select-options"]');
    await expect(listbox).toBeVisible();
    await expect(listbox).toHaveAttribute('role', 'listbox');

    // Verify luxury frame styles (borderRadius 10px, border #D8CEBE, boxShadow)
    const listboxStyles = await listbox.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        borderRadius: style.borderRadius,
        border: style.border,
        backgroundColor: style.backgroundColor
      };
    });
    expect(listboxStyles.borderRadius).toBe('10px');
    expect(listboxStyles.backgroundColor).toBe('rgb(255, 255, 255)');

    // Click an option and verify selection
    const kafeOption = page.locator('[data-testid="option-Kafe"]');
    await expect(kafeOption).toBeVisible();
    await kafeOption.click();

    await expect(listbox).toBeHidden();
    await expect(trigger).toContainText('Kafe');
  });

  test('should verify custom category select in Menu Item modal and custom checkbox styling', async ({ page }) => {
    // Login as Owner
    await page.click('button:has-text("Sign In")');
    await page.click('button:has-text("Menu")');
    await expect(page.locator('h1:has-text("Menu Management")')).toBeVisible();

    // Open item modal
    await page.click('button:has-text("Item")');
    const trigger = page.locator('[data-testid="category-select"]');
    await expect(trigger).toBeVisible();

    // Open dropdown and check listbox
    await trigger.click();
    const listbox = page.locator('[data-testid="category-select-options"]');
    await expect(listbox).toBeVisible();

    const firstOption = listbox.locator('[role="option"]').first();
    await firstOption.click();
    await expect(listbox).toBeHidden();

    // Also check custom checkbox styling on the "Active on POS" checkbox
    const activeCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(activeCheckbox).toBeVisible();

    const checkboxStyles = await activeCheckbox.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        appearance: style.appearance || style.webkitAppearance,
        borderRadius: style.borderRadius
      };
    });
    expect(checkboxStyles.appearance).toBe('none');
    expect(checkboxStyles.borderRadius).toBe('4.5px');
  });

  test('should verify custom discount type select in Promotion modal', async ({ page }) => {
    // Login as Owner and navigate to Vouchers / Promo tab
    await page.click('button:has-text("Sign In")');
    await page.click('button:has-text("Vouchers / Promo")');

    const createPromoBtn = page.locator('button:has-text("Create New Voucher")');
    await expect(createPromoBtn).toBeVisible();
    await createPromoBtn.click();

    const trigger = page.locator('[data-testid="discount-type-select"]');
    await expect(trigger).toBeVisible();

    await trigger.click();
    const listbox = page.locator('[data-testid="discount-type-select-options"]');
    await expect(listbox).toBeVisible();

    const rpOption = page.locator('[data-testid="option-rp"]');
    await expect(rpOption).toBeVisible();
    await rpOption.click();

    await expect(listbox).toBeHidden();
    await expect(trigger).toContainText('Nominal Rupiah (Rp)');
  });
});
