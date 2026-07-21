import { test, expect } from './fixtures';

test.describe('Visual Snapshot Regression Suite', () => {
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

  test('visual comparison of Cashier screen', async ({ page }) => {
    await expect(page.getByTestId('screen-cashier')).toBeVisible();
    await expect(page).toHaveScreenshot('cashier-screen.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('visual comparison of Products screen', async ({ page }) => {
    await page.getByTestId('nav-produk').click();
    await page.waitForURL('**/products');
    await expect(page.getByTestId('screen-products')).toBeVisible();
    await expect(page).toHaveScreenshot('products-screen.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('visual comparison of Reports screen', async ({ page }) => {
    await page.getByTestId('nav-laporan').click();
    await page.waitForURL('**/reports');
    await expect(page.getByTestId('screen-reports')).toBeVisible();
    await expect(page).toHaveScreenshot('reports-screen.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});
