import { redirect } from "next/navigation";
import { BrandHeroPage } from "@/views/brand-hero";

/**
 * 루트 `/` — 비로그인 첫 진입 시 브랜드 히어로(랜딩)를 보여준다 (SOO-73).
 * 이미 로그인한 사용자는 앱(today)으로 직행시켜 기존 동선을 보존한다.
 *
 * Supabase 미설정(로컬/프리뷰 목업)에서는 세션 조회를 건너뛰고 히어로를 렌더 —
 * middleware의 dev 통과 정책과 동일하게 fail-open. CTA(/today)는 목업 바이패스
 * 동선으로 자연스럽게 이어진다 (SOO-260618-09).
 */
export default async function Home() {
  const hasSupabaseEnv =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (hasSupabaseEnv) {
    const { createClient } = await import("@/shared/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/today");
  }

  return <BrandHeroPage />;
}
