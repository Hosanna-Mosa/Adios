import { defineConfig, devices } from "@playwright/test";

// Self-contained Playwright config. The previous version imported
// `lovable-agent-playwright-config` (a Lovable.dev-internal package that is
// not published to the public npm registry and is not installed here), which
// made `npx playwright test` fail before a single spec could run — see the
// admin refactor plan's "USERS PILOT GATE" verification and the Phase 2
// report for how this was discovered. This config replaces it with a plain
// @playwright/test setup pointed at the admin app's own dev server so the
// plan's build/lint/playwright verification loop is actually runnable.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
