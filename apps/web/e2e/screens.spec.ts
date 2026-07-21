import { test, expect } from './fixtures';

test.describe('Screen Screenshot Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-phone').fill('081234567890');
    await page.getByTestId('login-pass').fill('warung123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL('**/pin');
    for (const num of ['1', '2', '3', '4', '5', '6']) {
      await page.getByTestId(`pin-${num}`).click();
    }
    await page.waitForURL('**/cashier');
  });

  test('captures all 5 main tabs', async ({ page }) => {
    // 1. Kasir
    await expect(page.getByTestId('screen-cashier')).toBeVisible();

    // 2. Produk
    await page.getByTestId('nav-produk').click();
    await page.waitForURL('**/products');
    await expect(page.getByTestId('screen-products')).toBeVisible();

    // 3. Riwayat
    await page.getByTestId('nav-riwayat').click();
    await page.waitForURL('**/history');
    await expect(page.getByTestId('screen-history')).toBeVisible();

    // 4. Laporan
    await page.getByTestId('nav-laporan').click();
    await page.waitForURL('**/reports');
    await expect(page.getByTestId('screen-reports')).toBeVisible();

    // 5. Setelan
    await page.getByTestId('nav-setelan').click();
    await page.waitForURL('**/settings');
    await expect(page.getByTestId('screen-settings')).toBeVisible();
  });
});
