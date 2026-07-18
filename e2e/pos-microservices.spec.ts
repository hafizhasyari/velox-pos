import { test, expect } from '@playwright/test';

test.describe('Velox POS Microservices Frontend E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so each test starts cleanly at Login screen
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('E2E Flow 1: Auth Service & Role-Based Access Control (RBAC)', async ({ page }) => {
    // Verify login screen rendered
    await expect(page.locator('h2:has-text("Sign in")')).toBeVisible();

    // Login as Kasir
    await page.selectOption('select', 'kasir');
    await page.click('button:has-text("Sign In")');

    // Should redirect to POS screen
    await expect(page.locator('input[placeholder="Search active menu..."]')).toBeVisible();

    // Verify Kasir Role Indicator in Sidebar
    await expect(page.locator('div:has-text("Kasir")').first()).toBeVisible();
  });

  test('E2E Flow 2: Order & Payment Microservices Integration', async ({ page }) => {
    // Login as Owner
    await page.selectOption('select', 'owner');
    await page.click('button:has-text("Sign In")');

    // Go to Order / POS tab
    await page.click('button:has-text("Order / POS")');
    await expect(page.locator('input[placeholder="Search active menu..."]')).toBeVisible();

    // Select Table 4 (T-4 is free)
    await page.click('button:has-text("Select Table")');
    await expect(page.locator('span:has-text("Select Table (12 Tables)")')).toBeVisible();
    await page.click('button:has-text("T-4")');

    // Add item with modifiers to cart
    await page.click('div:has-text("Ayam Geprek") >> nth=-1');
    await page.click('button:has-text("Add to cart")');
    await expect(page.locator('div:has-text("Current Order")').first()).toBeVisible();

    // Apply 10% discount by entering 10 and clicking '%'
    await page.fill('input[placeholder="Discount"]', '10');
    await page.click('button:has-text("%")');

    // Click Charge button to open Checkout modal
    await page.click('button:has-text("Charge")');

    // Click Exact cash shortcut inside checkout modal
    await page.click('button:has-text("Exact")');

    // Click Complete Payment
    await page.click('button:has-text("Complete Payment")');

    // Verify confirmation toast appeared
    await expect(page.locator('span:has-text("Payment verified via Payment & Shift Microservices!")')).toBeVisible({ timeout: 10000 });
  });

  test('E2E Flow 3: DevMode Microservice Gateway Error Simulation & Recovery', async ({ page }) => {
    // Login as Owner
    await page.selectOption('select', 'owner');
    await page.click('button:has-text("Sign In")');

    // Open floating DevMode widget
    await page.click('button:has-text("ONLINE (MOCK)")');
    await expect(page.locator('span:has-text("Phase 1 Service Gateway")')).toBeVisible();

    // Simulate 500 Gateway Error
    await page.click('button:has-text("Simulate 500 Gateway Error")');

    // Verify Gateway Error UI immediately appears
    await expect(page.locator('h3:has-text("Microservices Gateway Error")')).toBeVisible({ timeout: 10000 });

    // Reset state right inside the open DevMode widget
    await page.click('button:has-text("Reset E2E Database State")');

    // Verify recovery to normal UI (Dashboard, Menu, or POS)
    await expect(page.locator('h1:has-text("Dashboard")').or(page.locator('input[placeholder="Search active menu..."]')).or(page.locator('h1:has-text("Menu Management")'))).toBeVisible({ timeout: 10000 });
  });

  test('E2E Flow 4: URL Path Routing & Deep-Link Persistence via react-router-dom', async ({ page }) => {
    // Login as Owner
    await page.selectOption('select', 'owner');
    await page.click('button:has-text("Sign In")');

    // Verify initial redirect to /dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();

    // Navigate to Menu via Sidebar button -> verify URL updates to /menu
    await page.click('button:has-text("Menu")');
    await expect(page).toHaveURL(/\/menu/);
    await expect(page.locator('h1:has-text("Menu Management")')).toBeVisible();

    // Navigate to Order / POS -> verify URL updates to /pos
    await page.click('button:has-text("Order / POS")');
    await expect(page).toHaveURL(/\/pos/);
    await expect(page.locator('input[placeholder="Search active menu..."]')).toBeVisible();

    // Click browser Back arrow -> verify URL returns cleanly to /menu
    await page.goBack();
    await expect(page).toHaveURL(/\/menu/);
    await expect(page.locator('h1:has-text("Menu Management")')).toBeVisible();

    // Reload browser while on /menu -> verify persistence inside /menu
    await page.reload();
    await expect(page).toHaveURL(/\/menu/);
    await expect(page.locator('h1:has-text("Menu Management")')).toBeVisible();
  });

  test('E2E Flow 5: Voucher Promo Application & KDS Real-time Workflow', async ({ page }) => {
    // 1. Login as Kasir
    await page.selectOption('select', 'kasir');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/pos/);

    // 2. Select Dine-in Table & Add Nasi Rendang + Nasi Ayam Bakar to Cart (> Rp50.000 for HEMAT20)
    await page.click('button:has-text("Select Table")');
    await page.click('button:has-text("T-4")');
    await page.click('div:has-text("Nasi Rendang") >> nth=-1');
    await page.click('div:has-text("Nasi Ayam Bakar") >> nth=-1');
    await expect(page.locator('div:has-text("Current Order")').first()).toBeVisible();

    // 3. Apply Voucher Code HEMAT20 via Promo Drawer trigger
    await page.click('button:has-text("Apply Promo Voucher")');
    await expect(page.locator('h3:has-text("Select or Enter Voucher")')).toBeVisible();
    await page.click('button:has-text("Use") >> nth=0');
    await expect(page.locator('span:has-text("Discount (20%)")')).toBeVisible();

    // 4. Charge Order with Exact Cash
    await page.click('button:has-text("Charge")');
    await page.click('button:has-text("Exact")');
    await page.click('button:has-text("Complete Payment")');
    await page.click('button:has-text("Done")');

    // 5. Navigate to KDS / Kitchen (/kds) via Sidebar button
    await page.click('button:has-text("KDS / Kitchen")');
    await expect(page).toHaveURL(/\/kds/);
    await expect(page.locator('h1:has-text("Kitchen Display System")')).toBeVisible();

    // 6. Verify the new order ticket appears under New orders and transition its status
    await expect(page.locator('span:has-text("NEW ORDER")').first()).toBeVisible();
    await page.click('button:has-text("Start Cooking") >> nth=0');
    await expect(page.locator('span:has-text("COOKING")').first()).toBeVisible();

    await page.click('button:has-text("Mark Ready") >> nth=0');
    await expect(page.locator('span:has-text("READY TO SERVE")').first()).toBeVisible();

    await page.click('button:has-text("Complete / Serve") >> nth=0');
  });

  test('E2E Flow 6: Voucher Management Dashboard & Live POS Redemption Verification', async ({ page }) => {
    // 1. Login as Owner
    await page.selectOption('select', 'owner');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navigate to Vouchers / Promo (/promotions) via Sidebar
    await page.click('button:has-text("Vouchers / Promo")');
    await expect(page).toHaveURL(/\/promotions/);
    await expect(page.locator('h1:has-text("Voucher & Promo Management")')).toBeVisible();

    // 3. Create a New Voucher Code PAYDAY30 (30% off, min spend Rp60.000)
    await page.click('button:has-text("Create New Voucher")');
    await expect(page.locator('h3:has-text("Create New Promo Voucher")')).toBeVisible();

    await page.fill('input[placeholder="e.g. PAYDAY30"]', 'PAYDAY30');
    await page.fill('input[placeholder="e.g. Diskon Payday 30% (Min. Rp60rb)"]', 'Diskon Payday 30% (Min. Rp60rb)');
    await page.locator('input[type="number"]').first().fill('30');
    await page.locator('input[type="number"]').last().fill('60000');

    await page.click('button:has-text("Save Voucher")');
    await expect(page.locator('span:has-text("PAYDAY30")')).toBeVisible();

    // 4. Navigate to Order / POS (/pos) and test redemption
    await page.click('button:has-text("Order / POS")');
    await expect(page).toHaveURL(/\/pos/);

    // Add Nasi Rendang + Nasi Ayam Bakar + Mie Goreng Jawa (32.000 + 27.000 + 24.000 = 83.000 >= 60.000 minSpend)
    await page.click('button:has-text("Select Table")');
    await page.click('button:has-text("T-4")');
    await page.click('div:has-text("Nasi Rendang") >> nth=-1');
    await page.click('div:has-text("Nasi Ayam Bakar") >> nth=-1');
    await page.click('div:has-text("Mie Goreng Jawa") >> nth=-1');
    await expect(page.locator('div:has-text("Current Order")').first()).toBeVisible();

    // 5. Open Promo Drawer and Apply PAYDAY30
    await page.click('button:has-text("Apply Promo Voucher")');
    await expect(page.locator('h3:has-text("Select or Enter Voucher")')).toBeVisible();
    await expect(page.locator('span:has-text("PAYDAY30")')).toBeVisible();

    await page.locator('[data-testid="voucher-card-PAYDAY30"] button:has-text("Use")').click();
    await expect(page.locator('span:has-text("Discount (30%)")')).toBeVisible();
  });
});
