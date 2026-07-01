"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "./sonner";

/**
 * 앱 전역 Toaster + intake 완료 토스트 브릿지.
 *
 * 업로드(촬영) 완료 시 photo-upload가 sessionStorage에 메시지를 심고 오늘 화면으로
 * 하드 내비게이션한다(모달이 닫히고 오늘의 회독 목록이 최신으로 갱신됨). 이 컴포넌트가
 * 다음 페이지 진입에서 그 메시지를 상단 토스트로 띄운다.
 */
const INTAKE_TOAST_KEY = "soongong:intakeToast";

export function AppToaster() {
  useEffect(() => {
    try {
      const msg = sessionStorage.getItem(INTAKE_TOAST_KEY);
      if (msg) {
        sessionStorage.removeItem(INTAKE_TOAST_KEY);
        toast.success(msg);
      }
    } catch {
      /* sessionStorage 접근 불가 환경은 무시 */
    }
  }, []);

  return <Toaster position="top-center" />;
}
