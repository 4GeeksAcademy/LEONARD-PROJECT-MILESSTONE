import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const sample = path.join(root, 'scripts/incidents-brasaland-demo.csv');
const screenshots = path.join(root, 'docs/incident-analysis');
mkdirSync(screenshots, { recursive: true });

for (const [name, viewport] of Object.entries({
  desktop: { width: 1440, height: 1000 }, mobile: { width: 390, height: 844 },
})) {
  test(`${name}: upload, metrics, export, errors, and layout`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors = [];
    const externalRequests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:8012')) externalRequests.push(request.url());
    });
    await page.goto('/backoffice/');
    await expect(page.getByRole('heading', { name: 'No analysis yet' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
    await page.getByLabel('Choose incident CSV').setInputFiles(sample);
    await page.getByRole('button', { name: 'Analyze file' }).click();
    await expect(page.locator('#total-records')).toHaveText('100');
    await expect(page.locator('#valid-records')).toHaveText('96');
    await expect(page.locator('#invalid-records')).toHaveText('4');
    await expect(page.locator('#average-score')).toHaveText('3.46');
    await expect(page.locator('#invalid-rows tr')).toHaveCount(4);
    await expect(page.locator('#category-rows tr')).toHaveCount(5);
    await expect(page.locator('#status-rows tr')).toHaveCount(3);
    await expect(page.locator('#score-chart .score-column')).toHaveCount(5);
    await expect(page.locator('#category-rows')).toContainText('30.2%');
    await expect(page.locator('#status-rows')).toContainText('52.1%');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('14px "DM Sans"'))).toBe(true);
    expect(await page.locator('svg').count()).toBeGreaterThan(10);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator('button').evaluateAll((buttons) => buttons.every((button) => button.scrollWidth <= button.clientWidth))).toBe(true);
    const photo = await page.request.get('/backoffice/grill.jpg');
    expect(photo.ok()).toBe(true);
    expect((await photo.body()).length).toBeGreaterThan(1000);
    await page.screenshot({ path: path.join(screenshots, `backoffice-${name}-demo.png`), fullPage: true, animations: 'disabled' });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export CSV' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('results.csv');
    const exported = readFileSync(await download.path(), 'utf8');
    expect(exported).toContain('total_records,100');
    expect(exported).toContain('satisfaction.average,3.46');
    expect(exported).not.toContain('BRS-000001');

    await page.getByLabel('Choose incident CSV').setInputFiles({ name: 'malformed.csv', mimeType: 'text/csv', buffer: Buffer.from('name,email\n') });
    await page.getByRole('button', { name: 'Analyze file' }).click();
    await expect(page.getByRole('alert')).toContainText('Expected exactly these CSV columns');
    await expect(page.locator('#total-records')).toHaveText('100');

    await page.getByLabel('Choose incident CSV').setInputFiles({ name: 'empty.csv', mimeType: 'text/csv', buffer: Buffer.from('') });
    await expect(page.getByRole('alert')).toHaveText('The CSV file is empty.');
    await expect(page.getByRole('button', { name: 'Analyze file' })).toBeDisabled();

    const contents = readFileSync(sample, 'utf8').split(/\r?\n/);
    const allInvalid = `${contents[0]}\n${contents[97]}\n`;
    await page.getByLabel('Choose incident CSV').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(allInvalid) });
    await page.getByRole('button', { name: 'Analyze file' }).click();
    await expect(page.locator('#valid-records')).toHaveText('0');
    await expect(page.locator('#average-score')).toHaveText('N/A');
    await expect(page.locator('#category-rows')).not.toContainText('NaN');
    await expect(page.locator('#status-rows')).not.toContainText('Infinity');
    expect(errors).toEqual([]);
    expect(externalRequests).toEqual([]);
  });
}

test('drag and drop accepts a CSV and renders a clean result', async ({ page }) => {
  await page.goto('/backoffice/');
  const content = readFileSync(sample, 'utf8').split(/\r?\n/).slice(0, 2).join('\n');
  const transfer = await page.evaluateHandle((csv) => {
    const data = new DataTransfer();
    data.items.add(new File([csv], 'clean.csv', { type: 'text/csv' }));
    return data;
  }, content);
  await page.locator('#drop-zone').dispatchEvent('drop', { dataTransfer: transfer });
  await page.getByRole('button', { name: 'Analyze file' }).click();
  await expect(page.locator('#valid-records')).toHaveText('1');
  await expect(page.locator('#invalid-records')).toHaveText('0');
  await expect(page.getByRole('heading', { name: 'Validation complete' })).toBeVisible();
  await expect(page.locator('#invalid-table')).toBeHidden();
  await expect(page.locator('#clean-icon')).toBeVisible();
});

test('script console screenshot uses the synthetic benchmark', async ({ page }) => {
  const process = spawnSync(path.join(root, '.venv/bin/python'), [path.join(root, 'scripts/analyze.py'), sample], { input: 'n\n', encoding: 'utf8', cwd: root });
  expect(process.status).toBe(0);
  expect(process.stdout).toContain('Average score: 3.46 / 5.00');
  await page.setViewportSize({ width: 1000, height: 1250 });
  await page.setContent('<html><body style="margin:0;padding:30px;background:#202724;color:#eaf1ed"><pre style="font:16px/1.6 monospace;margin:0;white-space:pre-wrap"></pre></body></html>');
  await page.locator('pre').evaluate((node, text) => { node.textContent = text; }, process.stdout);
  await page.screenshot({ path: path.join(screenshots, 'script-console-demo.png'), fullPage: true });
});