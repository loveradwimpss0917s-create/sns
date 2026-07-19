import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke tests against the full Cloudflare Pages runtime (D1/R2/KV/AI
 * bindings included). Run `pnpm --filter @vlog/web dev:full` first, or let
 * webServer below start it. See docs/Development.md.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:8788",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm --filter @vlog/web dev:full",
    url: "http://localhost:8788",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
