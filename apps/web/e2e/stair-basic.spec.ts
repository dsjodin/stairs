import { test, expect } from "@playwright/test";

test("user applies L-preset, sees visualization with 16 steps", async ({ page }) => {
  await page.goto("/");
  await page.click("button:has-text('Villa L-trappa')");
  await expect(page.locator("[data-testid='result-steps']")).toContainText("16", { timeout: 10000 });
  await expect(page.locator("[data-testid='side-view-svg']")).toBeVisible();
  await expect(page.locator("[data-testid='plan-view-svg']")).toBeVisible();
  await expect(page.locator("[data-testid='warnings-list']")).toBeVisible();
});

test("straight stair shows correct step count for 2700mm rise", async ({ page }) => {
  await page.goto("/");
  await page.click("button:has-text('Bostad rak')");
  await expect(page.locator("[data-testid='result-steps']")).toContainText("16", { timeout: 10000 });
});
