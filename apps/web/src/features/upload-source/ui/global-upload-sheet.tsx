"use client";
import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUploadSheetStore } from "../model/upload-sheet-store";
import { UPLOAD_RESUME_PARAM } from "../model/login-gate";
import { UploadSheet } from "./upload-sheet";

/**
 * SOO-146 복귀 동선: 로그인 게이트를 통과하고 `?upload=1` 로 돌아오면
 * 업로드 시트를 자동으로 다시 연다. 읽은 즉시 파라미터를 제거해
 * (새로고침/링크 공유 시 시트가 재오픈되지 않도록) 히스토리 오염 없이 replace 한다.
 *
 * useSearchParams 는 Suspense 경계가 필요하므로(로그인 페이지와 동일 패턴) 분리해 감싼다.
 */
function UploadResumeWatcher() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const openSheet = useUploadSheetStore((s) => s.openSheet);

  useEffect(() => {
    if (searchParams.get(UPLOAD_RESUME_PARAM) !== "1") return;
    openSheet();
    const params = new URLSearchParams(searchParams.toString());
    params.delete(UPLOAD_RESUME_PARAM);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [searchParams, pathname, router, openSheet]);

  return null;
}

export function GlobalUploadSheet() {
  const open = useUploadSheetStore((s) => s.open);
  const setOpen = useUploadSheetStore((s) => s.setOpen);
  return (
    <>
      <Suspense fallback={null}>
        <UploadResumeWatcher />
      </Suspense>
      <UploadSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
