import { test, expect } from '@playwright/test';

test.describe('Visual Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Login as Owner (full access to all screens)
    await page.click('button:has-text("Owner")');
    await page.click('button:has-text("Sign In")');
  });

  const screens = [
    { name: 'dashboard', nav: 'Dashboard' },
    { name: 'menu', nav: 'Menu' },
    { name: 'promotions', nav: 'Vouchers / Promo' },
    { name: 'pos', nav: 'Order / POS' },
    { name: 'kds', nav: 'KDS / Kitchen' },
    { name: 'shift', nav: 'Shift' },
  ];

  for (const screen of screens) {
    test(`Screenshot baseline: ${screen.name} (desktop)`, async ({ page }) => {
      await page.click(`button:has-text("${screen.nav}")`);
      // Wait for animations and dynamic content to settle
      await page.waitForTimeout(600);
      await expect(page).toHaveScreenshot(`${screen.name}-desktop.png`, {
        maxDiffPixelRatio: 0.02, // allow 2% pixel diff tolerance for font rendering
        fullPage: true,
      });
    });
  }

  // Kasir role: verify only 3 nav items visible
  test('Screenshot baseline: kasir-pos (restricted nav)', async ({ page }) => {
    // Fresh login as Kasir (clear state and re-navigate)
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.click('button:has-text("Kasir")');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(600);
    await expect(page).toHaveScreenshot('kasir-pos-desktop.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });
});
