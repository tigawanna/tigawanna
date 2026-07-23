import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
/** `landing/tests` → portfolio app root (`apps/portfolio`). */
const appRoot = path.resolve(testsDir, "../../../../../");
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3045";

/**
 * Portable Playwright config for the landing / portfolio surface.
 *
 * Keep this folder copy-pasteable: update `appRoot` / `webServer.command` only
 * when the host app layout differs.
 */
export default defineConfig({
  testDir: testsDir,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: path.join(testsDir, "playwright-report") }]],
  outputDir: path.join(testsDir, "test-results"),
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    testIdAttribute: "data-test",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 3045",
    cwd: appRoot,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      // Deterministic landing data — static fixtures, no live GitHub / Telegram / analytics.
      PORTFOLIO_USE_STATIC_FIXTURES: "1",
      GH_PAT: "",
      TELEGRAM_BOT_TOKEN: "",
      TELEGRAM_CHANNEL_ID: "",
      VITE_POSTHOG_KEY: "",
      POSTHOG_API_KEY: "",
      DEV_TO_KEY: "",
    },
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile",
      use: {
        // Chromium mobile emulation — avoids a separate WebKit install.
        ...devices["Pixel 5"],
      },
    },
  ],
});
