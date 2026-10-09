import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const screenshots = path.resolve(import.meta.dirname, '../../../docs/supplier-directory');

for (const [name, viewport] of Object.entries({ desktop: { width: 1440, height: 1000 }, mobile: { width: 390, height: 844 } })) {
  test(`${name}: supplier filters, rate, status, registration, and errors`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto('/backoffice/');
    await page.getByRole('link', { name: 'Supplier directory' }).click();
    await expect(page.locator('#supplier-rows tr')).toHaveCount(15);
    await expect(page.locator('.status-badge.suspended')).toHaveCount(2);
    await page.locator('#country-filter').selectOption('USA');
    await expect(page.locator('#supplier-rows tr')).toHaveCount(6);
    await page.locator('#category-filter').selectOption('carne');
    await expect(page.locator('#supplier-rows tr')).toHaveCount(1);
    await expect(page.locator('#supplier-rows')).toContainText('Miami Meat Distributors LLC');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator('button').evaluateAll((buttons) => buttons.every((button) => button.scrollWidth <= button.clientWidth))).toBe(true);
    mkdirSync(screenshots, { recursive: true });
    await page.screenshot({ path: path.join(screenshots, `suppliers-${name}-filtered.png`), fullPage: true, animations: 'disabled' });
    const rate = page.getByRole('spinbutton', { name: 'Rate for Miami Meat Distributors LLC' });
    const originalRate = await rate.inputValue();
    await rate.fill('7.25');
    await page.getByRole('button', { name: 'Save rate for Miami Meat Distributors LLC' }).click();
    await expect(rate).toHaveValue('7.25');
    await page.getByRole('button', { name: 'Suspend Miami Meat Distributors LLC' }).click();
    await expect(page.locator('.status-badge')).toHaveText('Suspended');
    await page.getByRole('button', { name: 'Activate Miami Meat Distributors LLC' }).click();
    await expect(page.locator('.status-badge')).toHaveText('Active');
    await rate.fill(originalRate);
    await page.getByRole('button', { name: 'Save rate for Miami Meat Distributors LLC' }).click();

    await page.getByRole('button', { name: 'New supplier' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name', { exact: true }).fill(`Test supplier ${name}`);
    await dialog.locator('[name="country"]').selectOption('USA');
    await expect(dialog.getByLabel('Currency')).toHaveValue('USD');
    await dialog.getByLabel('Meat', { exact: true }).check();
    await dialog.getByLabel('Rate per unit').fill('3.25');
    await page.route('**/suppliers', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ detail: [{ loc: ['body', 'name'], msg: 'Supplier rejected by API' }] }) }));
    await dialog.getByRole('button', { name: 'Register supplier' }).click();
    await expect(dialog.getByRole('alert')).toContainText('Supplier rejected by API');
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue(`Test supplier ${name}`);
    await page.unroute('**/suppliers');
    const created = page.waitForResponse((response) => response.url().endsWith('/suppliers') && response.request().method() === 'POST');
    await dialog.getByRole('button', { name: 'Register supplier' }).click();
    const supplier = await (await created).json();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('#supplier-rows')).toContainText(`Test supplier ${name}`);
    await page.request.delete(`/suppliers/${supplier.id}`);
    expect(errors).toEqual([]);
  });
}

test('Swagger shows the filtered supplier response', async ({ page }) => {
  await page.goto('/docs');
  const operation = page.locator('#operations-Suppliers-list_suppliers_suppliers_get');
  await operation.locator('.opblock-summary').click();
  await operation.getByRole('button', { name: 'Try it out' }).click();
  const filters = operation.locator('.parameters select');
  await filters.nth(0).selectOption('USA');
  await filters.nth(1).selectOption('carne');
  await operation.getByRole('button', { name: 'Execute' }).click();
  await expect(operation.locator('.responses-wrapper')).toContainText('Miami Meat Distributors LLC');
  mkdirSync(screenshots, { recursive: true });
  await operation.screenshot({ path: path.join(screenshots, 'suppliers-api-filter.png') });
});