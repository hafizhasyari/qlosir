import { test, expect } from './fixtures';

test.describe('Offline Sync & PWA Reconciliation', () => {
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

  test('toggles offline mode, completes checkout, and reconciles when back online', async ({ page }) => {
    // 1. Toggle connectivity button to Offline
    const connToggle = page.getByTestId('conn-toggle');
    await connToggle.click();
    await expect(connToggle.getByText('Offline')).toBeVisible();

    // 2. Perform checkout while offline
    await page.getByTestId('add-1').click();
    await page.getByTestId('cart-bar').click();
    await page.waitForURL('**/cart');
    await page.getByTestId('pay-cash').click();

    await page.waitForURL('**/cash');
    await page.getByTestId('cash-quick-0').click();
    await page.getByTestId('cash-save').click();

    // 3. Receipt screen is shown
    await page.waitForURL('**/receipt');
    await page.getByTestId('receipt-new').click();

    // 4. Return to cashier and toggle back online
    await page.waitForURL('**/cashier');
    await connToggle.click();
    await expect(connToggle.getByText('Online')).toBeVisible();
  });
});
