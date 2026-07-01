import { ROUTES } from "@/shared/config/routes";

/**
 * 로그인 게이트 복귀 동선 SSoT (SOO-146).
 *
 * 입구 게이트(useTriggerUpload)와 제출 시점 폴백(photo-upload / capture-note-form)이
 * **같은 규칙**으로 로그인 URL을 만들도록 한 곳에 모은다 → 두 업로드 경로 동작 통일.
 *
 * 복귀 계약(SOO-145 PR 162 OTP 동선과 정합):
 *  - 게이트는 `/login?next=<현재경로+?upload=1>` 로 보낸다.
 *  - 로그인 페이지가 OTP 인증 성공 시 `next` 경로로 `router.push` 한다
 *    (login/page.tsx 의 safeNext + verifyOtp 동선 — 같은 탭에서 복귀).
 *  - 복귀 화면에서 `?upload=1` 을 감지하면 업로드 시트를 자동으로 다시 연다(GlobalUploadSheet).
 */

/** 로그인 완료 후 돌아올 경로. 업로드 시트 자동 재오픈 신호(`upload=1`)를 붙인다. */
export function buildUploadResumePath(pathname: string | null | undefined): string {
  const base = pathname || ROUTES.today;
  return `${base}${base.includes("?") ? "&" : "?"}upload=1`;
}

/** 비로그인 시 보낼 로그인 게이트 URL. 복귀 경로를 next 로 안전 인코딩해 싣는다. */
export function buildLoginGateUrl(pathname: string | null | undefined): string {
  return `${ROUTES.login}?next=${encodeURIComponent(buildUploadResumePath(pathname))}`;
}

/** 복귀 신호 파라미터 이름. 복귀 화면에서 시트 자동 오픈 트리거로 읽고, 읽은 뒤 제거한다. */
export const UPLOAD_RESUME_PARAM = "upload";
