import { test, expect } from "@playwright/test";

test("홈 → 업로드 시트 → mock 분석 → AnalysisCard 도달", async ({ page }) => {
  await page.goto("/today");

  await expect(
    page.getByRole("heading", { name: /안녕하세요, 김순공님!/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "+ 문제 출제하기" }).click();

  await expect(page.getByRole("heading", { name: "오늘 뭘 올릴까요?" })).toBeVisible();

  await page.getByRole("button", { name: /문제사진/ }).click();

  await page.locator('input[type="file"]').setInputFiles({
    name: "dummy.png",
    mimeType: "image/png",
    buffer: Buffer.from([0]),
  });

  await expect(page.getByText(/순공이가 분석 중/)).toBeVisible();

  await expect(page.getByText(/신뢰도/)).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("button", { name: "맞아요" })).toBeVisible();
});

test("홈 → 첫 번째 퀘스트 풀기 → 정답 5 → 정답 카드", async ({ page }) => {
  await page.goto("/today");

  const firstQuest = page
    .locator("div")
    .filter({ hasText: /^수학·수열/ })
    .first();
  await expect(firstQuest).toBeVisible();

  await page.goto("/play/q-001");

  await expect(
    page.getByRole("heading", { name: "점화식" }),
  ).toBeVisible({ timeout: 10_000 });

  const answerInput = page.locator('input[placeholder*="정답"]');
  await expect(answerInput).toBeVisible({ timeout: 15_000 });

  await answerInput.fill("5");
  await page.getByRole("button", { name: "제출" }).click();

  await expect(page.getByText(/정답!/)).toBeVisible();
  await expect(page.getByRole("button", { name: "결과 보기" })).toBeVisible();
});
