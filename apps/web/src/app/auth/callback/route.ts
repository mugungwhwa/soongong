import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (
            cookiesToSet: {
              name: string;
              value: string;
              options: CookieOptions;
            }[],
          ) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 기존/신규 분기: 온보딩 완료(birth_year 채워짐) 유무로 판별.
      // 기존 유저 → /today(티어 여정 hero), 신규 → /onboarding.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let destination = "/onboarding";
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("birth_year")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.birth_year != null) {
          destination = "/today";
        }
      }
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
