"use client";
import Image from "next/image";
import { useTriggerUpload } from "@/features/upload-source";

/**
 * 카메라 = 메인 히어로 액션 — SOO-128 프로토타입(.cam-hero.mascot) 정합.
 *
 * mint-700→mint-900 그라데이션 카드 + 카메라 든 순공이(왕관) + 카피 + 흰 pill "촬영하기".
 * pill 클릭은 기존 업로드 시트(zustand openSheet)를 그대로 재사용한다 — OCR/업로드
 * 배선은 건드리지 않음(MOAT, Mike 소유). 색은 tokens.css 변수만, light-only.
 */
export function CameraHero() {
  const triggerUpload = useTriggerUpload();

  return (
    <button
      type="button"
      onClick={triggerUpload}
      aria-label="문제 찍어 새 회독 만들기"
      className="relative flex w-full items-center gap-4 overflow-hidden rounded-[var(--radius-xl)] bg-[linear-gradient(120deg,var(--color-mint-700),var(--color-mint-900))] p-5 text-left text-[var(--color-text-inverse)] shadow-[var(--shadow-elevated)]"
    >
      {/* 장식 링 — 등록된 연출(반투명 화이트), 네온/glow 아님 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-[140px] w-[140px] rounded-full bg-[rgba(255,255,255,0.07)]"
      />
      <Image
        src="/mascot/camera-capture-crown-alpha.png"
        alt="카메라를 든 순공이"
        width={104}
        height={104}
        priority
        className="relative z-[1] h-[88px] w-[88px] shrink-0 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.18)] sm:h-[104px] sm:w-[104px]"
      />
      <span className="relative z-[1] min-w-0 flex-1">
        <span className="block break-keep text-lg font-extrabold tracking-tight [overflow-wrap:break-word]">
          문제 찍어 새 회독 만들기
        </span>
        <span className="block break-keep text-sm opacity-90 [overflow-wrap:break-word]">
          틀린 문제·인강 캡처 한 장이면 AI가 회독퀘스트로
        </span>
      </span>
      <span className="relative z-[1] shrink-0 whitespace-nowrap rounded-[var(--radius-pill)] bg-white px-4 py-2.5 text-sm font-extrabold text-[var(--color-mint-900)]">
        촬영하기
      </span>
    </button>
  );
}
