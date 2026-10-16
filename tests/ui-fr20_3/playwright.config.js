// @ts-check
const path = require('path');
const { defineConfig } = require('@playwright/test');

const EVIDENCE_DIR = path.resolve(__dirname, '../../reports/evidence/FR-20.3');
const RUN_NAME = process.env.RUN_NAME || 'run_ui_1';

module.exports = defineConfig({
  testDir: '.',
  testMatch: /fr20_3_ui\.spec\.js/,
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
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5175',
    headless: process.env.HEADED ? false : true,
    viewport: { width: 390, height: 844 },
    trace: 'off',
  },
  webServer: [
    {
      command: 'node server.js',
      cwd: path.resolve(__dirname, '../../backend'),
      env: {
        JWT_SECRET: 'supersecretjwtkeyforhw02testing12345',
        DB_PATH: path.resolve(__dirname, '../../backend/.hw02_fr20_3_ui.sqlite'),
      },
      url: 'http://localhost:3000/api/products',
      reuseExistingServer: false,
      timeout: 20_000,
    },
    {
      command: 'node ../../frontend-web/node_modules/vite/bin/vite.js --config mobile-web-host/vite.config.mjs',
      cwd: __dirname,
      url: 'http://localhost:5175',
      reuseExistingServer: true,
      timeout: 20_000,
    },
  ],
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
