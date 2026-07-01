"use client";
import Image from "next/image";
import { useTriggerUpload } from "../model/use-trigger-upload";

/**
 * 카메라 캡처 자산(순공이+카메라) 단일 참조 경로.
 * 누끼 자산: `public/mascot/camera-capture-alpha.png` (1024² RGBA, 긴 변 90% 정규화 — 누끼 런북 §4.13).
 * 원본 RGB는 동명 `camera-capture.png` 보존. 경로는 여기 한 곳(두 번째 SSoT 금지).
 */
export const CAMERA_CAPTURE_ASSET = "/mascot/camera-capture-alpha.png";

/**
 * 데스크톱(웹) 상시 노출 카메라 hero — persistent floating.
 *
 * Mike 결정(SOO-124): "웹은 상시 떠있게. 카메라가 메인(학생이 문제 공급→리텐션화)."
 * 스크롤과 무관하게 항상 보이도록 `fixed`. lg(데스크톱) 전용 — 모바일은 BottomNav 중앙 FAB가 담당.
 * 탭 → 촬영·업로드 시트(useUploadSheetStore.openSheet).
 *
 * 자산 자체가 둥근 버블 형태라 별도 배경 원형 없이 이미지만 띄운다.
 * 그림자는 `--shadow-elevated` 단독(토스풍 중첩 금지 — design-review §2-4).
 */
export function CameraCaptureFab() {
  const triggerUpload = useTriggerUpload();
  return (
    <button
      type="button"
      onClick={triggerUpload}
      aria-label="카메라로 문제 출제하기"
      className="group fixed bottom-8 right-8 z-50 hidden flex-col items-center gap-1.5 rounded-full transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint-500)] focus-visible:ring-offset-2 lg:flex"
    >
      <Image
        src={CAMERA_CAPTURE_ASSET}
        alt=""
        width={104}
        height={104}
        priority
        className="object-contain drop-shadow-[var(--shadow-elevated)] transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
        style={{ width: 104, height: 104 }}
      />
      <span className="rounded-full bg-[var(--color-mint-900)] px-3 py-1 text-xs font-bold text-[var(--color-text-inverse)] shadow-[var(--shadow-card)]">
        문제 출제
      </span>
    </button>
  );
}
