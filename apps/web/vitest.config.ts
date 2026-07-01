import { defineConfig } from "vitest/config";
import path from "path";

// 유닛 테스트(vitest)와 E2E(playwright)를 분리한다.
// tests/e2e/*.spec.ts 는 @playwright/test 런너 전용 → vitest 수집에서 제외.
export default defineConfig({
  resolve: {
    // Next.js tsconfig의 "@/*" → "./src/*" 별칭을 vitest에도 동일 적용.
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
  },
});
