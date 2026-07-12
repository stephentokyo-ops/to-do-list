import { test, expect } from "@playwright/test";

// 主要フロー（登録→サンプル案件→分析→結果表示→履歴）のスモークテスト。
// デモモード（AI_PROVIDER=demo）で実行し、実際のAnthropic APIは呼び出さない。

test.describe("KETTEI AI 主要フロー", () => {
  test("ランディングページが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /社長が判断できる1枚に/ })).toBeVisible();
  });

  test("新規登録からサンプル案件分析・結果表示・履歴確認までの一連の流れ", async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;

    await page.goto("/signup");
    await page.getByLabel("表示名").fill("E2Eテスト");
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel(/パスワード/).fill("password123");
    await page.getByRole("button", { name: "登録する" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "ダッシュボード" })).toBeVisible();

    await page.getByRole("button", { name: "サンプル案件を試す" }).click();
    await expect(page).toHaveURL(/\/projects\/[\w-]+$/);
    await expect(page.getByRole("heading", { name: "海外仕入先からの支払サイト短縮要請" })).toBeVisible();

    await page.getByRole("button", { name: "分析を開始" }).click();
    await expect(page).toHaveURL(/\/analyses\/[\w-]+$/, { timeout: 20_000 });
    await expect(page.getByText("判断の確信度")).toBeVisible();
    await expect(page.getByText("選択肢比較")).toBeVisible();
    await expect(page.getByText("次のアクション")).toBeVisible();

    await page.goto("/history");
    await expect(page.getByText("海外仕入先からの支払サイト短縮要請")).toBeVisible();
  });

  test("未ログイン時はダッシュボードへのアクセスでログイン画面へ誘導される", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
