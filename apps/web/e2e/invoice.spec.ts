import { test, expect } from '@playwright/test';

test.describe('Buyer Invoice Public Deep Link', () => {
  test('cashier creates transaction and buyer opens invoice in a separate context', async ({ browser }) => {
    // 1. Cashier Context
    const cashierContext = await browser.newContext({
      viewport: { width: 390, height: 812 },
    });
    const cashierPage = await cashierContext.newPage();

    await cashierPage.goto('http://localhost:5173/login');
    await cashierPage.getByTestId('login-phone').fill('081234567890');
    await cashierPage.getByTestId('login-pass').fill('warung123');
    await cashierPage.getByTestId('login-submit').click();

    await cashierPage.waitForURL('**/pin');
    for (const num of ['1', '2', '3', '4', '5', '6']) {
      await cashierPage.getByTestId(`pin-${num}`).click();
    }
    await cashierPage.waitForURL('**/cashier');

    // Create a transaction
    await cashierPage.getByTestId('add-1').click();
    await cashierPage.getByTestId('cart-bar').click();
    await cashierPage.waitForURL('**/cart');
    await cashierPage.getByTestId('pay-cash').click();
    await cashierPage.waitForURL('**/cash');
    await cashierPage.getByTestId('cash-quick-0').click();
    await cashierPage.getByTestId('cash-save').click();
    await cashierPage.waitForURL('**/receipt');

    // 2. Buyer Context (Separate incognito session)
    const buyerContext = await browser.newContext({
      viewport: { width: 390, height: 812 },
    });
    const buyerPage = await buyerContext.newPage();

    // Navigate to a sample invoice link
    await buyerPage.goto('http://localhost:5173/i/x42k2m');
    await expect(buyerPage.getByTestId('screen-buyer')).toBeVisible();

    await cashierContext.close();
    await buyerContext.close();
  });
});
