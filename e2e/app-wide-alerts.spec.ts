import { test, expect } from '@playwright/test';

test.describe('App-Wide Alert Standardization Suite (Zero Native Alerts)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Ensure native window.alert is NEVER called across any test
    page.on('dialog', async dialog => {
      throw new Error(`Native browser dialog triggered unexpectedly: ${dialog.message()}`);
    });
  });

  test('should display custom AlertNotification when clicking item while shift is closed', async ({ page }) => {
    // Login as Owner
    await expect(page.locator('h2:has-text("Sign in")')).toBeVisible();
    await page.click('button:has-text("Sign In")');

    // First go to Shift screen to close the open shift (shiftOpen defaults to true)
    await page.click('button:has-text("Shift")');
    const closeShiftBtn = page.locator('button:has-text("Close Shift & Reconcile")');
    const openShiftBtn = page.locator('button:has-text("Open Shift & Start Counter")');

    // Wait for Shift screen heading
    await expect(page.locator('h1:has-text("Shift Reconciliation")')).toBeVisible();

    if (await closeShiftBtn.isVisible()) {
      await page.locator('input[type="number"]').fill('200000');
      await closeShiftBtn.click();
      await expect(openShiftBtn).toBeVisible();
    }

    // Now navigate to POS tab ("Order / POS")
    await page.click('button:has-text("Order / POS")');
    await expect(page.locator('input[placeholder="Search active menu..."]')).toBeVisible();

    // Click any menu item card on the grid while shift is closed
    const firstMenuItem = page.locator('div[style*="cursor: pointer"]').filter({ hasText: 'Rp' }).first();
    await firstMenuItem.click();

    // Verify posAlert appears right under Category Pills with role="alert"
    const alertBox = page.locator('div[role="alert"]').filter({ hasText: 'Shift Closed' });
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText('Please open a shift in the Shift Reconciliation module before taking new orders');
  });

  test('should display custom AlertNotification inside Checkout modal when cash tendered is less than order total', async ({ page }) => {
    await expect(page.locator('h2:has-text("Sign in")')).toBeVisible();
    await page.click('button:has-text("Sign In")');

    // Ensure shift is open and add item to cart on POS screen
    await page.click('button:has-text("Order / POS")');
    await expect(page.locator('input[placeholder="Search active menu..."]')).toBeVisible();

    // Add item without modifier modal (simpler flow) or handle modifier modal if triggered
    const esTehCard = page.locator('div:has-text("Es Teh Manis")').last();
    if (await esTehCard.isVisible()) {
      await esTehCard.click();
    } else {
      const firstMenuItem = page.locator('div[style*="cursor: pointer"]').filter({ hasText: 'Rp' }).first();
      await firstMenuItem.click();
      const addToOrderBtn = page.locator('button:has-text("Add to Order")');
      if (await addToOrderBtn.isVisible({ timeout: 1500 })) {
        await addToOrderBtn.click();
      }
    }

    // Click Takeaway using JS evaluate so scrolling/header doesn't block it
    const takeawayBtn = page.locator('button:has-text("Takeaway")');
    if (await takeawayBtn.isVisible()) {
      await takeawayBtn.evaluate((el: HTMLElement) => el.click());
    }

    // Wait for Charge button (or Open Order pill on compact screens)
    const chargeBtn = page.locator('button:has-text("Charge")');
    const openOrderBtn = page.locator('button:has-text("Open Order")');

    if (await chargeBtn.isVisible()) {
      await chargeBtn.evaluate((el: HTMLElement) => el.click());
    } else if (await openOrderBtn.isVisible()) {
      await openOrderBtn.evaluate((el: HTMLElement) => el.click());
      await chargeBtn.waitFor({ state: 'attached' });
      await chargeBtn.evaluate((el: HTMLElement) => el.click());
    } else {
      await chargeBtn.waitFor({ state: 'attached', timeout: 5000 });
      await chargeBtn.evaluate((el: HTMLElement) => el.click());
    }

    // Inside Checkout Modal, fill cash input with a small number less than total (e.g., 1000)
    await page.locator('input[type="number"]').last().fill('1000');
    const completeBtn = page.locator('button:has-text("Complete Payment")');
    await completeBtn.waitFor({ state: 'attached' });
    await completeBtn.evaluate((el: HTMLElement) => el.click());

    // Verify checkoutAlert appears inside Checkout modal
    const alertBox = page.locator('div[role="alert"]').filter({ hasText: 'Insufficient Cash Tendered' });
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText('less than the order total');
  });

  test('should display custom AlertNotification inside Menu Item modal when name or price is missing', async ({ page }) => {
    await expect(page.locator('h2:has-text("Sign in")')).toBeVisible();
    await page.click('button:has-text("Sign In")');

    // Navigate to Menu tab ("Menu")
    await page.click('button:has-text("Menu")');
    await expect(page.locator('h1:has-text("Menu Management")')).toBeVisible();

    // Click "+ Item" button in header
    await page.click('button:has-text("Item")');
    await expect(page.locator('text=New item').first()).toBeVisible();

    // Click "Save item" without entering name or price (default is empty/0)
    await page.click('button:has-text("Save item")');

    // Verify modalAlert appears inside the modal
    const alertBox = page.locator('div[role="alert"]').filter({ hasText: 'Missing Item Details' });
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText('Please enter both the item name and price (greater than 0)');
  });

  test('should display custom AlertNotification inside Shift screen when trying to close shift without counted cash input', async ({ page }) => {
    await expect(page.locator('h2:has-text("Sign in")')).toBeVisible();
    await page.click('button:has-text("Sign In")');

    // Navigate to Shift tab ("Shift")
    await page.click('button:has-text("Shift")');
    await expect(page.locator('h1:has-text("Shift Reconciliation")')).toBeVisible();

    // Check if shift is closed or open
    const openShiftBtn = page.locator('button:has-text("Open Shift & Start Counter")');
    if (await openShiftBtn.isVisible()) {
      await openShiftBtn.click();
    }

    // Now shift is open, try to submit close shift form without filling closingInput
    const closeShiftBtn = page.locator('button:has-text("Close Shift & Reconcile")');
    await expect(closeShiftBtn).toBeVisible();

    // Ensure actual counted cash input is empty
    await page.locator('input[type="number"]').fill('');
    await closeShiftBtn.click();

    // Verify shiftAlert appears
    const alertBox = page.locator('div[role="alert"]').filter({ hasText: 'Counted Cash Required' });
    await expect(alertBox).toBeVisible();
    await expect(alertBox).toContainText('Please enter the physical cash amount counted in your drawer before closing the shift.');
  });
});
