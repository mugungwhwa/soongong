import { defineConfig } from "vitest/config";

// 유닛 테스트(vitest)와 E2E(playwright)를 분리한다.
// tests/e2e/*.spec.ts 는 @playwright/test 런너 전용 → vitest 수집에서 제외.
export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
  },
});
