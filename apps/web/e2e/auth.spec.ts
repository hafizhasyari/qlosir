import { test, expect } from './fixtures';

test.describe('Authentication & Till PIN Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('completes 2-layer auth (phone+password -> PIN)', async ({ page }) => {
    await page.goto('/login');

    // 1. Fill Phone & Password
    await page.getByTestId('login-phone').fill('081234567890');
    await page.getByTestId('login-pass').fill('warung123');
    await page.getByTestId('login-submit').click();

    // 2. Lands on Till PIN Screen
    await page.waitForURL('**/pin');
    await expect(page.getByTestId('screen-pin')).toBeVisible();

    // 3. Enter incorrect PIN to test error message
    for (const num of ['0', '0', '0', '0', '0', '0']) {
      await page.getByTestId(`pin-${num}`).click();
    }
    await expect(page.locator('text=PIN salah')).toBeVisible();

    // 4. Enter correct PIN (123456)
    for (const num of ['1', '2', '3', '4', '5', '6']) {
      await page.getByTestId(`pin-${num}`).click();
    }

    // 5. Successfully navigates to Cashier
    await page.waitForURL('**/cashier');
    await expect(page.getByTestId('screen-cashier')).toBeVisible();
  });

  test('validates signup flow and TOS modal', async ({ page }) => {
    await page.goto('/signup');

    // Check Legal Sheet popup
    await page.getByText('Syarat & Ketentuan').click();
    await expect(page.getByTestId('legal-sheet')).toBeVisible();
    await page.getByText('Saya Mengerti & Setuju').click();
    await expect(page.getByTestId('legal-sheet')).not.toBeVisible();

    // Fill signup form
    await page.getByTestId('su-nama').fill('Pak Budi');
    await page.getByTestId('su-toko').fill('Warung Berkah Budi');
    await page.getByTestId('su-phone').fill('085566778899');
    await page.getByTestId('su-pass').fill('rahasia123');
    await page.getByTestId('su-pass2').fill('rahasia123');
    await page.getByTestId('su-pin').fill('654321');
    await page.getByTestId('su-pin2').fill('654321');
    await page.getByTestId('su-tos').click();
    await page.getByTestId('su-submit').click();

    // Should redirect to PIN
    await page.waitForURL('**/pin');
    for (const num of ['6', '5', '4', '3', '2', '1']) {
      await page.getByTestId(`pin-${num}`).click();
    }

    await page.waitForURL('**/cashier');
    await expect(page.getByTestId('screen-cashier')).toBeVisible();
  });
});
