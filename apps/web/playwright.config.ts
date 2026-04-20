import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:8080",
  },
  webServer: {
    command: "docker compose up",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
