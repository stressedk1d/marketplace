import { test, expect } from "@playwright/test";

test.describe("VogueWay smoke", () => {
  test("home and catalog load", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    await page.goto("/catalog");
    await expect(page.getByRole("heading", { name: /каталог/i })).toBeVisible();
  });

  test("404 page has navigation", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    await expect(page.getByRole("heading", { name: /не найдена/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /каталог/i }).first()).toBeVisible();
  });

  test("compare page empty state", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: /сравнение товаров/i })).toBeVisible();
  });

  test("offline page", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByRole("heading", { name: /нет соединения/i })).toBeVisible();
  });
});
