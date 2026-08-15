import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

// Deliberately NOT 5183 (the app's configured dev port in vite.config.ts):
// other checkouts of this repo may already have a dev server bound to
// 5183, and Playwright's default reuseExistingServer would silently test
// that checkout instead of this one. A dedicated port + forced-fresh
// server keeps this suite scoped to this worktree's own code.
const PORT = 5273;
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Real test credentials live in .env.e2e (gitignored, never committed) --
// see .env.e2e.example for the expected variable names. Node 20.6+ ships
// process.loadEnvFile() natively, no dotenv dependency needed.
const envE2ePath = fileURLToPath(new URL(".env.e2e", import.meta.url));
if (existsSync(envE2ePath)) {
  process.loadEnvFile(envE2ePath);
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm exec vite --port 5273 --strictPort",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    cwd: __dirname,
    timeout: 60000,
  },
});
