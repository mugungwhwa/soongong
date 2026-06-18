import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StyleguidePage } from "@/views/styleguide";

// dev 전용 — 검색엔진 인덱싱 차단.
export const metadata: Metadata = {
  title: "디자인 토큰 플레이그라운드 · 순공대장",
  robots: { index: false, follow: false },
};

// dev + Vercel preview 전용 노출 (allowlist). 그 외(=실제 production, 또는
// 정체불명 환경)는 차단해 "dev 전용" 스펙을 fail-closed 로 지킨다.
// VERCEL_ENV: "production" | "preview" | "development". Vercel 밖(로컬 dev/build)에선 undefined.
function isStyleguideVisible(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv) {
    return vercelEnv === "preview" || vercelEnv === "development";
  }
  // Vercel 밖: 로컬 dev 만 허용 (production 빌드 런타임은 차단).
  return process.env.NODE_ENV !== "production";
}

export default function Page() {
  if (!isStyleguideVisible()) {
    notFound();
  }
  return <StyleguidePage />;
}
