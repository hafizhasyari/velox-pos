import { test, expect } from '@playwright/test';

test.describe('KDS Card Status & Timer Precision Audit Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should verify precision two-row header, status banner, and time pill on KDS card', async ({ page }) => {
    // 1. Create a quick order in POS to generate a kitchen ticket (will be ORD-1043)
    await page.click('button:has-text("Sign In")'); // Login as owner (lands on Dashboard)
    await page.click('button:has-text("Order / POS")');
    await expect(page.locator('input[placeholder="Search active menu..."]')).toBeVisible();

    // Select Table 4
    await page.click('button:has-text("Select Table")');
    await page.click('button:has-text("T-4")');

    // Add menu item to cart
    await page.click('div:has-text("Ayam Geprek") >> nth=-1');
    await page.click('button:has-text("Add to cart")');
    await expect(page.locator('div:has-text("Current Order")').first()).toBeVisible();

    // Charge Order
    await page.click('button:has-text("Charge")');
    await page.click('button:has-text("Exact")');
    await page.click('button:has-text("Complete Payment")');
    await page.click('button:has-text("Done")');

    // 2. Navigate to KDS tab
    await page.click('button:has-text("KDS / Kitchen")');
    await expect(page.locator('h1:has-text("Kitchen Display System")')).toBeVisible();

    // 3. Locate the initial ticket card (ORD-1042) or new ticket card (ORD-1043)
    const card = page.locator('[data-testid="kds-card-ORD-1043"]');
    await expect(card).toBeVisible();

    // 4. Verify Row 1 timer pill precision alignment
    const timerPill = page.locator('[data-testid="timer-pill-ORD-1043"]');
    await expect(timerPill).toBeVisible();
    await expect(timerPill).toContainText('0m ago');

    // Verify timer pill font weight and border
    const timerStyles = await timerPill.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontWeight: style.fontWeight,
        borderRadius: style.borderRadius
      };
    });
    expect(timerStyles.fontWeight).toBe('700');
    expect(timerStyles.borderRadius).toBe('6px');

    // 5. Verify Row 2 full-width status banner pill
    const statusBanner = page.locator('[data-testid="status-banner-ORD-1043"]');
    await expect(statusBanner).toBeVisible();
    await expect(statusBanner).toContainText('NEW ORDER');

    // 6. Transition to cooking and verify status banner updates precisely
    const startCookingBtn = card.locator('button:has-text("Start Cooking")');
    await startCookingBtn.click();
    await expect(statusBanner).toContainText('COOKING IN PROGRESS');

    // 7. Transition to ready and verify status banner
    const markReadyBtn = card.locator('button:has-text("Mark Ready")');
    await markReadyBtn.click();
    await expect(statusBanner).toContainText('READY TO SERVE');
  });
});
