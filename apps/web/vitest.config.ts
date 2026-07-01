import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// 유닛 테스트(vitest)와 E2E(playwright)를 분리한다.
// tests/e2e/*.spec.ts 는 @playwright/test 런너 전용 → vitest 수집에서 제외.
export default defineConfig({
  // tsconfig paths(`@/*` → src/*)를 vitest 런타임에도 매핑. 기존 테스트는 type-only import라
  // 무관했지만, 값 import(예: SUBJECTS 계약)를 테스트하려면 alias 해석이 필요하다.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
  },
});
