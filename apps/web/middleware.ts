import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
