import { test as base, expect } from '@playwright/test';

// Custom test fixture with helper functions for Qlosir PWA flows
export const test = base.extend<{
  loginAsDemo: () => Promise<void>;
}>({
  loginAsDemo: async ({ page }, use) => {
    await use(async () => {
      await page.goto('/login');
      // Click Demo login button if exists or fill credentials
      const demoBtn = page.getByTestId('login-demo-btn');
      if (await demoBtn.isVisible()) {
        await demoBtn.click();
      } else {
        await page.getByTestId('login-phone').fill('081234567890');
        await page.getByTestId('login-pass').fill('warung123');
        await page.getByTestId('login-submit').click();
      }

      // Handle Till PIN
      await page.waitForURL('**/pin');
      // Fill 6-digit PIN 123456
      for (const num of ['1', '2', '3', '4', '5', '6']) {
        await page.getByTestId(`pin-key-${num}`).click();
      }

      // Should land on Cashier screen
      await page.waitForURL('**/cashier');
      await expect(page.getByTestId('screen-cashier')).toBeVisible();
    });
  },
});

export { expect };
