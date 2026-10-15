// @ts-check
const path = require('path');
const { defineConfig } = require('@playwright/test');

const EVIDENCE_DIR = path.resolve(__dirname, '../../reports/evidence/FR-08');

// Tên lần chạy lấy từ biến môi trường: RUN_NAME=run_ui_1 | run_ui_2
const RUN_NAME = process.env.RUN_NAME || 'run_ui_1';

module.exports = defineConfig({
  testDir: '.',
  testMatch: /fr08_ui\.spec\.js/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 4_000 },
  outputDir: path.join(EVIDENCE_DIR, 'playwright-artifacts', RUN_NAME),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(EVIDENCE_DIR, `${RUN_NAME}.json`) }],
  ],
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    headless: process.env.HEADED ? false : true,
    viewport: { width: 1280, height: 800 },
    trace: 'off',
  },
  webServer: [
    {
      command: 'node server.js',
      cwd: path.resolve(__dirname, '../../backend'),
      env: { JWT_SECRET: 'supersecretjwtkeyforhw02testing12345' },
      url: 'http://localhost:3000/api/products',
      reuseExistingServer: true,
      timeout: 20_000,
    },
    {
      command: 'npm run dev',
      cwd: path.resolve(__dirname, '../../frontend-web'),
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 20_000,
    },
  ],
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
