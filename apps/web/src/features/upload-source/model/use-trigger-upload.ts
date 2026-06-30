"use client";
import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { useUploadSheetStore } from "./upload-sheet-store";
import { buildLoginGateUrl } from "./login-gate";

/**
 * 업로드(문제 찍기) 진입 단일 액션 (SOO-146 — 입구 로그인 게이트 A안).
 *
 * 데스크톱 좌측 CTA·플로팅 FAB, 모바일 하단 FAB, 홈 카메라 히어로 — 모든 진입점이
 * 이 훅 하나를 공유한다. 동선이 한 곳에 모여 "두 경로 동일 동작 통일"이 강제된다.
 *
 * - 로그인 상태  → 업로드 시트를 곧바로 연다.
 * - 비로그인 상태 → 카메라/시트를 열기 전에 먼저 로그인으로 보낸다.
 *   로그인을 촬영보다 앞세우므로 "찍은 사진/메모 유실"이 설계상 원천 차단된다(잃을 게 없음).
 *   로그인 완료 후 원래 화면 + `?upload=1` 로 복귀하면 시트가 자동으로 다시 열린다.
 *
 * 게이트 판정은 getSession(로컬, 즉시)으로 한다 — UX 게이트일 뿐, 실제 보안 경계는
 * RLS + 제출 시점 재확인이 담당한다. 세션이 만료된 채 통과해도 제출 폴백이 동일하게 막는다.
 */
export function useTriggerUpload() {
  const router = useRouter();
  const pathname = usePathname();
  const openSheet = useUploadSheetStore((s) => s.openSheet);

  return useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      openSheet();
      return;
    }
    router.push(buildLoginGateUrl(pathname));
  }, [router, pathname, openSheet]);
}
