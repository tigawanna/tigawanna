import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
/** `e2e` → web app root. */
const appRoot = path.resolve(testsDir, "../");
/** Dedicated preview port — keeps e2e off the normal `:3055` dev/start server. */
const e2ePort = process.env.PLAYWRIGHT_PORT ?? "4055";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;

/**
 * App-coupled Playwright config for the Next.js landing experiment.
 *
 * Expects a production build (`pnpm build`) and serves it with `next start`
 * so the server cannot HMR / rewrite files mid-run. Pre-push builds first;
 * locally use `pnpm build && pnpm test:e2e` (see also `SCRIPTS.md`).
 */
export default defineConfig({
  testDir: testsDir,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: path.join(testsDir, "playwright-report") }],
  ],
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
    // Production preview on :4055 — no clash with `pnpm dev` / `pnpm start` on :3055.
    command: "pnpm start:e2e",
    cwd: appRoot,
    url: baseURL,
    // Do not attach to a stray `next dev` on :3055; e2e needs the built preview.
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE === "1",
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        // lg breakpoint shows stack-cube-desktop / tech-choices-desktop
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
});
