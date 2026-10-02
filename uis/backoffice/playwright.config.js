import { defineConfig } from '@playwright/test';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:8012', browserName: 'chromium' },
  webServer: {
    command: '.venv/bin/python -m uvicorn services.api.app.main:app --host 127.0.0.1 --port 8012',
    cwd: root,
    url: 'http://127.0.0.1:8012/health',
    reuseExistingServer: false,
    timeout: 30000,
  },
});