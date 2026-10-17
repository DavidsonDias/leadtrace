import { defineConfig, devices } from "@playwright/test";
import process from "node:process";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env["CI"] ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    launchOptions: {
      ...(process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"]
        ? { executablePath: process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"] }
        : {}),
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env["CI"],
    timeout: 60000,
  },
});
