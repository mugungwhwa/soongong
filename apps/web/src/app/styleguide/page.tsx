import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StyleguidePage } from "@/views/styleguide";

// dev 전용 — 검색엔진 인덱싱 차단.
export const metadata: Metadata = {
  title: "디자인 토큰 플레이그라운드 · 순공대장",
  robots: { index: false, follow: false },
};

export default function Page() {
  // 실제 production 에서는 노출하지 않는다 (dev + Vercel preview 전용 조종석).
  // VERCEL_ENV: "production" | "preview" | "development". 로컬 dev/build 에선 undefined.
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }
  return <StyleguidePage />;
}
