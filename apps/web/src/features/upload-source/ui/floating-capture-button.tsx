"use client";
import Image from "next/image";
import { useUploadSheetStore } from "../model/upload-sheet-store";

/**
 * 웹(데스크톱) 상시 노출 카메라 진입 (SOO-125, Mike 배치 지시 2026-06-22).
 *
 * 카메라(캡처)=제품 핵심 행동(학생이 문제 공급 → 회독·리텐션화). 데스크톱에선
 * 하단 네비가 없어 스크롤하면 진입점이 사라지므로, 우하단 고정 floating 으로
 * "상시 떠있게" 한다 — 어느 화면·어느 스크롤 위치에서도 항상 잡힌다.
 *
 * - lg 이상에서만 표시(모바일은 BottomNav 중앙 FAB가 담당). 둘은 상보적.
 * - 순공이+카메라 브랜드 자산을 그대로 배치(디자인 변경 X). 라벨 pill 로 명확성.
 * - SOO-97 감각 유지: 차분한 elevated surface + 단일 그림자, hover 미세 lift만(과한 모션 X).
 * - 색은 tokens.css 시맨틱 토큰만(raw hex 0), light-only.
 */
export function FloatingCaptureButton() {
  const openSheet = useUploadSheetStore((s) => s.openSheet);

  return (
    <button
      type="button"
      onClick={openSheet}
      aria-label="문제 촬영·업로드"
      className="fixed bottom-8 right-8 z-50 hidden items-center gap-3 rounded-[var(--radius-pill)] bg-[var(--color-bg-elevated)] py-2.5 pl-2.5 pr-5 shadow-[var(--shadow-elevated)] ring-1 ring-[var(--color-mint-300)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] lg:flex"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-mint-50)]">
        <Image
          src="/brand/soongong-camera-alpha.png"
          alt=""
          width={96}
          height={96}
          priority
          className="h-11 w-11 object-contain"
        />
      </span>
      <span className="text-sm font-bold text-[var(--color-mint-900)]">
        문제 촬영
      </span>
    </button>
  );
}
