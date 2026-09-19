import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3002';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /living-organism-mobile\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: true,
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    colorScheme: 'dark',
    locale: 'en-ZA',
    timezoneId: 'Africa/Johannesburg',
    hasTouch: true,
    isMobile: true,
    // Deterministic UI tests mock /api/organism/feed. Playwright page.route cannot
    // reliably intercept requests claimed by a service worker, so SW behavior is
    // proved separately by the APWA architecture/service-worker contract gate.
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'android-360',
      use: { viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 },
    },
    {
      name: 'android-390',
      use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.75 },
    },
    {
      name: 'android-430',
      use: { viewport: { width: 430, height: 932 }, deviceScaleFactor: 3 },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run start -- -p 3002',
        url: `${baseURL}/news`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
