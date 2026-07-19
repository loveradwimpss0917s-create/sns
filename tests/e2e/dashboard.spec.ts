import { test, expect } from "@playwright/test";

test("dashboard loads with the sign-off phrase and sidebar nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("今日も、いい光でした。")).toBeVisible();
  await expect(page.getByRole("link", { name: "投稿管理" }).first()).toBeVisible();
});

test("command palette opens with Cmd/Ctrl+K", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(page.getByPlaceholder("ページ・アクションを検索...")).toBeVisible();
});
