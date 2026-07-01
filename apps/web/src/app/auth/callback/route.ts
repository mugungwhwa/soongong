import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

/** open redirect 방지: 내부 경로만 허용, 그 외 홈으로. */
function safeRedirectPath(value: string | null): string {
  if (!value) return "/today";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/today";
}

/** 매직링크 클릭 후 도착하는 콜백 — code를 세션으로 교환하고 next 경로로 돌려보낸다. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
