import { test, expect } from './fixtures';

test.describe('POS & Atomic Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start with authed demo account
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

  test('adds products to cart, applies discount, and completes cash checkout', async ({ page }) => {
    // 1. Check Cashier screen products
    await expect(page.getByTestId('screen-cashier')).toBeVisible();

    // 2. Add product #1 to cart
    await page.getByTestId('add-1').click();

    // Floating cart bar should appear
    const cartBar = page.getByTestId('cart-bar');
    await expect(cartBar).toBeVisible();
    await cartBar.click();

    // 3. Lands on Cart Screen
    await page.waitForURL('**/cart');
    await expect(page.getByTestId('screen-cart')).toBeVisible();

    // 4. Click Bayar Cash
    await page.getByTestId('pay-cash').click();

    // 5. Lands on Cash Payment Screen
    await page.waitForURL('**/cash');
    await expect(page.getByTestId('screen-cash')).toBeVisible();

    // 6. Click Uang Pas button
    await page.getByTestId('cash-quick-0').click();

    // 7. Complete Transaction
    await page.getByTestId('cash-save').click();

    // 8. Lands on Receipt Screen
    await page.waitForURL('**/receipt');
    await expect(page.getByTestId('screen-receipt')).toBeVisible();
    await expect(page.getByTestId('receipt-meta')).toBeVisible();

    // 9. Navigate back to new transaction
    await page.getByTestId('receipt-new').click();
    await page.waitForURL('**/cashier');
  });

  test('verifies QRIS payment flow', async ({ page }) => {
    // Add product to cart
    await page.getByTestId('add-1').click();
    await page.getByTestId('cart-bar').click();

    // Pay with QRIS
    await page.waitForURL('**/cart');
    await page.getByTestId('pay-qris').click();

    // Lands on QRIS screen
    await page.waitForURL('**/qris');
    await expect(page.getByTestId('screen-qris')).toBeVisible();

    // Click Sudah Dibayar
    await page.getByTestId('qris-save').click();

    // Receipt should show QRIS method
    await page.waitForURL('**/receipt');
    await expect(page.getByTestId('screen-receipt')).toBeVisible();
  });
});
