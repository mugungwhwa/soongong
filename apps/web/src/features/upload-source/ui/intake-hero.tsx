"use client";
import Image from "next/image";
import { Camera, PencilLine } from "lucide-react";
import { useUploadSheetStore } from "../model/upload-sheet-store";

/**
 * 중앙 대형 인테이크 히어로 (SOO-81, Mike 구조 지시 2026-06-20).
 *
 * 문제 사진 흡수는 제품의 핵심 행동 → 헤더 우측 작은 버튼에서 화면 중앙 대형
 * CTA로 승격. 같은 zustand store(openSheet)를 호출해 기존 업로드 시트 재사용.
 *
 * 디자인 검수 준수:
 * - §2-3 홈 게임성 30% 캡: "크게"는 정보 위계(핵심 행동)지 게임 연출이 아님.
 *   네온/파티클/glow 없이 차분한 민트 surface + 단일 그림자.
 * - §2-1 마스코트: 정본 자산 /brand/soongong-main.png만 사용(placeholder 미사용).
 *   전용 "카메라 든 순공이" 일러스트는 /brand에 없어 마스코트+카메라 아이콘으로 연출.
 * - 색은 tokens.css 시맨틱 토큰만(raw hex 0), light-only, 동반자 톤.
 */
export function IntakeHero() {
  const openSheet = useUploadSheetStore((s) => s.openSheet);

  return (
    <section
      aria-label="문제 사진 올리기"
      className="mx-auto w-full max-w-3xl rounded-[var(--radius-xl)] border border-[var(--color-mint-300)] bg-[var(--color-mint-50)] p-5 lg:p-7"
    >
      <div className="flex flex-col items-center gap-5 text-center lg:flex-row lg:gap-7 lg:text-left">
        <Image
          src="/brand/soongong-main.png"
          alt="순공대장 마스코트 순공이"
          width={160}
          height={160}
          priority
          className="h-28 w-28 shrink-0 object-contain drop-shadow-[var(--shadow-elevated)] lg:h-32 lg:w-32"
        />
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-mint-100)] px-3 py-1 text-xs font-bold text-[var(--color-mint-900)]">
            핵심 한 가지
          </span>
          <h2 className="mt-3 text-xl font-extrabold leading-tight text-[var(--color-text-strong)] lg:text-2xl">
            문제 사진만 올리면,
            <br className="hidden sm:block" /> 순공이가 회독 퀘스트로 바꿔드려요
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--color-text-default)] lg:mx-0">
            사진·인강 기록·캡처 무엇이든 올리면, 까먹기 직전 타이밍에 다시 만나도록
            짜드려요.
          </p>
          <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={openSheet}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-mint-500)] px-7 text-base font-bold text-[var(--color-text-inverse)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-mint-700)]"
            >
              <Camera size={18} strokeWidth={2} aria-hidden="true" />
              문제 사진 올리기
            </button>
            <button
              type="button"
              onClick={openSheet}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] px-6 text-sm font-semibold text-[var(--color-mint-900)] transition-colors hover:bg-[var(--color-mint-100)]"
            >
              <PencilLine size={16} strokeWidth={2} aria-hidden="true" />
              직접 입력하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
