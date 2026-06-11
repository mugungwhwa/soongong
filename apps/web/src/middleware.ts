import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase 미설정 처리.
  // - 프로덕션: env 누락은 설정 오류다. 인증을 우회하면 보호 라우트가 노출되므로
  //   조용히 통과시키지 않고 fail-closed로 차단(503).
  // - 개발/프리뷰: 백엔드 없이도 화면이 보이도록 인증을 건너뛰고 그대로 렌더.
  //   (이전엔 빈 env로 createServerClient가 throw해 전 라우트가 500이었음.)
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[middleware] Supabase 환경변수 누락 (production) — 요청을 차단합니다. 환경 설정을 확인하세요.",
      );
      return new NextResponse("Service temporarily unavailable", {
        status: 503,
      });
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (
          cookies: { name: string; value: string; options: CookieOptions }[],
        ) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 세션 갱신 (edge에서 쿠키 업데이트)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 관리자/검수자 라우트 보호 (P8)
  if (pathname.startsWith("/admin") && user) {
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!userRow || !["admin", "reviewer"].includes(userRow.role as string)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  // Node.js 런타임으로 실행 — Edge 번들에서 @supabase/realtime-js가 브라우저 전역
  // `self`를 참조해 "self is not defined"로 크래시하던 문제를 원천 제거.
  // (BannerPlugin 폴리필은 Vercel Edge 미들웨어 아티팩트에 안정적으로 주입되지 않아 재발했음 — 두 번째.)
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
