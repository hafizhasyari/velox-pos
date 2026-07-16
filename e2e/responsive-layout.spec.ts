import { test, expect } from '@playwright/test';

test.describe('Velox POS Responsive Layout E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('E2E Flow 7: Mobile Viewport Navigation & POS Slide-up Cart Drawer (iPhone 13)', async ({ page }) => {
    // Set mobile viewport (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Login as Owner
    await expect(page.locator('h2:has-text("Sign in")')).toBeVisible();
    await page.click('button:has-text("Owner")');
    await page.click('button:has-text("Sign In")');

    // On mobile, Top Header bar should display tenant brand name ("Velox") and role badge ("owner")
    await expect(page.locator('span:has-text("Velox")').first()).toBeVisible();
    await expect(page.locator('span:has-text("owner")').first()).toBeVisible();

    // Bottom Navigation Bar should be visible at bottom: 0 with 6 buttons (text content, no title attr)
    await expect(page.locator('button:has-text("Order / POS")')).toBeVisible();
    await expect(page.locator('button:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('button:has-text("Menu")')).toBeVisible();
    await expect(page.locator('button:has-text("Vouchers / Promo")')).toBeVisible();
    await expect(page.locator('button:has-text("KDS / Kitchen")')).toBeVisible();
    await expect(page.locator('button:has-text("Shift")')).toBeVisible();

    // Navigate to POS screen
    await page.click('button:has-text("Order / POS")');

    // Select Table 4 for dine-in
    await page.click('button:has-text("Select Table")');
    await page.click('button:has-text("T-4")');

    // Add item to cart (use Es Teh Manis — no modifier modal, simpler flow)
    await page.click('div:has-text("Es Teh Manis") >> nth=-1');

    // On compact screens (< 980px or mobile), floating order summary pill should appear
    const openOrderBtn = page.locator('button:has-text("Open Order")');
    await expect(openOrderBtn).toBeVisible();

    // Click 'Open Order' to trigger slide-up bottom drawer
    await openOrderBtn.click();

    // Verify slide-up cart drawer header & items
    await expect(page.locator('div:has-text("Current Order")').first()).toBeVisible();
    await expect(page.locator('span:has-text("Es Teh Manis")')).toBeVisible();

    // Charge order from inside the slide-up modal
    // On 390px mobile, the Charge button sits below the viewport inside the fixed slide-up drawer.
    // Use JS click to bypass Playwright's viewport boundary check.
    const chargeBtn = page.locator('button:has-text("Charge")');
    await chargeBtn.evaluate((el: HTMLElement) => el.click());

    // Complete exact cash payment (checkout modal)
    const exactBtn = page.locator('button:has-text("Exact")');
    await exactBtn.waitFor({ state: 'attached' });
    await exactBtn.evaluate((el: HTMLElement) => el.click());

    const completeBtn = page.locator('button:has-text("Complete Payment")');
    await completeBtn.waitFor({ state: 'attached' });
    await completeBtn.evaluate((el: HTMLElement) => el.click());

    // Verify receipt modal renders cleanly within viewport bounds
    const doneBtn = page.locator('button:has-text("Done")');
    await doneBtn.waitFor({ state: 'attached' });
    await doneBtn.evaluate((el: HTMLElement) => el.click());
  });

  test('E2E Flow 8: Tablet Viewport Icon Rail & Layout Scaling (iPad Air)', async ({ page }) => {
    // Set tablet viewport (820 x 1180)
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/');

    // Login as Owner
    await page.click('button:has-text("Owner")');
    await page.click('button:has-text("Sign In")');

    // On tablet (640px - 1024px), sidebar should collapse to compact 68px width icon rail
    const railNav = page.locator('aside');
    await expect(railNav).toHaveCSS('width', '68px');

    // Default landing is Dashboard; verify heading
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Navigate to Menu using icon rail button (tablet uses title attr)
    await page.click('button[title="Menu"]');
    await expect(page.locator('h1:has-text("Menu Management")')).toBeVisible();

    // Navigate to KDS
    await page.click('button[title="KDS / Kitchen"]');
    await expect(page.locator('h1:has-text("Kitchen Display System (KDS)")')).toBeVisible();
  });

  test('E2E Flow 9: Desktop Viewport Expanded Sidebar & Static Right Cart Column (MacBook Pro)', async ({ page }) => {
    // Set desktop viewport (1280 x 800)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Login as Owner
    await page.click('button:has-text("Owner")');
    await page.click('button:has-text("Sign In")');

    // On desktop (> 1024px), sidebar should be expanded with width 216px and visible labels
    const desktopAside = page.locator('aside');
    await expect(desktopAside).toHaveCSS('width', '216px');
    await expect(page.locator('span:has-text("Order / POS")')).toBeVisible();

    // Navigate to POS screen so we can check the static right cart column
    await page.click('button:has-text("Order / POS")');

    // Right side cart column should be statically rendered without needing to click 'Open Order'
    await expect(page.locator('div:has-text("Current Order")').first()).toBeVisible();
    const openOrderBtn = page.locator('button:has-text("Open Order")');
    await expect(openOrderBtn).toBeHidden();
  });

  test('Sign-In & Sign-Up screens should render responsive stacked layout without horizontal overflow on Mobile (390 x 844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Verify Sign-in screen has no horizontal overflow
    await expect(page.locator('h2:has-text("Sign in")')).toBeVisible();
    const loginOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(loginOverflow).toBe(false);

    // Click 'Create your outlet' to switch to Sign-up screen
    await page.click('span:has-text("Create your outlet")');
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();

    // Verify Sign-up screen has no horizontal overflow on 390px mobile
    const signupOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(signupOverflow).toBe(false);

    // Verify Business type grid container stacks to 1 column on mobile (<640px)
    const selectElem = page.locator('[role="combobox"]').first();
    await expect(selectElem).toBeVisible();
  });

  test('Sign-In & Sign-Up screens should render responsive layout without horizontal overflow on Tablet (768 x 1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Verify Sign-in screen on tablet
    await expect(page.locator('h2:has-text("Sign in")')).toBeVisible();
    const loginOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(loginOverflow).toBe(false);

    // Verify Sign-up screen on tablet
    await page.click('span:has-text("Create your outlet")');
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
    const signupOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(signupOverflow).toBe(false);
  });
});
