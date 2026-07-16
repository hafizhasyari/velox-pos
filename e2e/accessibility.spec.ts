import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Login as Owner (full access to all screens)
    await page.click('button:has-text("Owner")');
    await page.click('button:has-text("Sign In")');
  });

  test('Login screen should have no critical a11y violations', async ({ page }) => {
    // Navigate to clean login screen
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    if (results.violations.length > 0) {
      console.log('Login a11y violations:', results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })));
    }
    expect(critical).toHaveLength(0);
  });

  test('Dashboard should have no critical a11y violations', async ({ page }) => {
    await page.click('button:has-text("Dashboard")');
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    if (results.violations.length > 0) {
      console.log('Dashboard a11y violations:', results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })));
    }
    expect(critical).toHaveLength(0);
  });

  test('POS screen should have no critical a11y violations', async ({ page }) => {
    await page.click('button:has-text("Order / POS")');
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    if (results.violations.length > 0) {
      console.log('POS a11y violations:', results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })));
    }
    expect(critical).toHaveLength(0);
  });

  test('Menu Management should have no critical a11y violations', async ({ page }) => {
    await page.click('button:has-text("Menu")');
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    if (results.violations.length > 0) {
      console.log('Menu a11y violations:', results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })));
    }
    expect(critical).toHaveLength(0);
  });

  test('KDS should have no critical a11y violations', async ({ page }) => {
    await page.click('button:has-text("KDS / Kitchen")');
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    if (results.violations.length > 0) {
      console.log('KDS a11y violations:', results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })));
    }
    expect(critical).toHaveLength(0);
  });

  test('Shift Reconciliation should have no critical a11y violations', async ({ page }) => {
    await page.click('button:has-text("Shift")');
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    if (results.violations.length > 0) {
      console.log('Shift a11y violations:', results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })));
    }
    expect(critical).toHaveLength(0);
  });
});
