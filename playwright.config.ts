import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'bun --bun next dev --hostname localhost --port 3000',
    url: 'http://localhost:3000/preorder',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
