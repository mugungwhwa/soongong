import { NextRequest, NextResponse } from "next/server";

// OTP 코드 방식으로 전환 후 이 콜백은 사용되지 않습니다.
// 기존 매직링크 이메일을 클릭한 사용자를 로그인 화면으로 안내합니다.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
}
