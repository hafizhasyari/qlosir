import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (a11y) Automated Audits', () => {
  test('audit login screen for a11y violations', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('screen-login')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // prototype tint background exceptions
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('audit cashier screen for a11y violations', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-phone').fill('081234567890');
    await page.getByTestId('login-pass').fill('warung123');
    await page.getByTestId('login-submit').click();

    await page.waitForURL('**/pin');
    for (const num of ['1', '2', '3', '4', '5', '6']) {
      await page.getByTestId(`pin-${num}`).click();
    }
    await page.waitForURL('**/cashier');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
