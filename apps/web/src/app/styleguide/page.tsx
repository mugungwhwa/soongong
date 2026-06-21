import type { Metadata } from "next";
import { DesignSystemShowcase } from "@/views/styleguide";

// 공개 라이브 가이드(unlisted) — SOO-106.
// /styleguide 는 통합 UI·디자인 + 플랫폼 개발 가이드라인 라이브 사이트이자
// Mike 체크포인트 열람 수단이다. 모든 환경(production 포함)에서 직접 URL 접근을
// 허용하되, 검색엔진 인덱싱은 noindex 로 계속 차단한다(검색 비노출 = unlisted).
export const metadata: Metadata = {
  title: "디자인 시스템 · 순공대장",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DesignSystemShowcase />;
}
