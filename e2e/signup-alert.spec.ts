import { test, expect } from '@playwright/test';

test.describe('Sign-up Screen Custom Alert Notification Suite', () => {
  test('should display custom AlertNotification when creating account without checking Terms of Service', async ({ page }) => {
    // Intercept native window.alert to ensure it is NOT called
    let nativeAlertCalled = false;
    page.on('dialog', async dialog => {
      nativeAlertCalled = true;
      await dialog.dismiss();
    });

    await page.goto('/');

    // Switch to Sign-up screen
    await page.click('span:has-text("Create your outlet")');
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();

    // Fill out required text fields
    await page.fill('input[placeholder="Warung Makan Ibu Sari"]', 'Warung Kopi Barokah');
    await page.fill('input[placeholder="Ibu Sari"]', 'Budi Santoso');
    await page.fill('input[placeholder="owner@warungibusari.id"]', 'budi@kopibarokah.id');
    await page.fill('input[placeholder="+62 812 3456 7890"]', '+62 812 9999 8888');
    await page.locator('input[placeholder="••••••••"]').first().fill('rahasia123');
    await page.locator('input[placeholder="••••••••"]').nth(1).fill('rahasia123');

    // DO NOT check Terms of Service checkbox, directly submit form
    await page.click('button:has-text("Create account")');

    // Verify custom AlertNotification container with role="alert" appears
    const alertBox = page.locator('div[role="alert"]');
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText('Terms of Service Required');
    await expect(alertBox).toContainText('Please check the box below to agree to the Terms of Service and Privacy Policy');

    // Verify native browser alert was NEVER called
    expect(nativeAlertCalled).toBe(false);

    // Now check the Terms of Service checkbox and verify alert auto-dismisses
    const termsCheckbox = page.locator('input[type="checkbox"]');
    await termsCheckbox.check();

    await expect(alertBox).toBeHidden();
  });
});
