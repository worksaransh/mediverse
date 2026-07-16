import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "on",
  },
  webServer: [
    {
      command: "pnpm run dev",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        DATABASE_URL: "postgres://localhost:5432/mock",
      },
    },
    {
      command: "pnpm --filter @mediverse/admin dev",
      url: "http://127.0.0.1:3001",
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        DATABASE_URL: "postgres://localhost:5432/mock",
      },
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
