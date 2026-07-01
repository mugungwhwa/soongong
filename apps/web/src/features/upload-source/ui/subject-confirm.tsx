"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { SUBJECTS, type Subject } from "@/shared/contracts/common";

/**
 * 과목 확정/수정 카드 (SOO-150 A안) — 업로드 OCR 직후, 회독 퀘스트 생성 전에 끼어든다.
 *
 * - 판별 성공(신뢰 O): "감지된 과목: OO" 배지 + 프리셀렉트. 한 번의 탭으로 다른 과목 칩 선택 = 수정.
 * - 판별 실패/저신뢰: "과목을 선택해주세요" 폴백 — 프리셀렉트 없이 직접 고르게 한다.
 *
 * 확정값은 {@link finalizeIntake}로 넘어가 SMI·퀘스트 subject에 반영된다(수정 저장).
 * 과목 목록은 Tech Lead 소유 계약(`SUBJECTS`, 수능 영역)을 그대로 쓴다 — 표시 우선순위는 계약 배열 순서.
 */
export function SubjectConfirm({
  detected,
  needsSelection = false,
  subjects = SUBJECTS,
  submitting = false,
  onConfirm,
}: {
  /** 정규화된 판별 과목. null이면 폴백(직접 선택). */
  detected: Subject | null;
  /** 저신뢰 등으로 프리셀렉트를 비우고 선택을 요구할지. */
  needsSelection?: boolean;
  subjects?: readonly Subject[];
  submitting?: boolean;
  onConfirm: (subject: Subject) => void;
}) {
  const preselect = detected && !needsSelection ? detected : null;
  const [selected, setSelected] = useState<Subject | null>(preselect);

  const showDetectedBadge = detected !== null && !needsSelection;
  const heading = showDetectedBadge ? "이 과목이 맞나요?" : "과목을 선택해주세요";
  const helper = showDetectedBadge
    ? "아니면 아래에서 골라주면 바로 바꿀 수 있어요."
    : "사진 속 과목을 못 찾았어요. 직접 골라주면 돼요!";

  return (
    <section
      className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
      aria-label="과목 확인"
    >
      <div className="flex items-start gap-3">
        <MascotReaction
          mood={showDetectedBadge ? "cheer" : "idle"}
          size="md"
          reason={showDetectedBadge ? "과목 판별 완료" : "과목 직접 선택"}
        />
        <div className="space-y-1">
          <p className="text-base font-semibold text-[var(--color-text-strong)]">
            {heading}
          </p>
          {showDetectedBadge && (
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-bg)] px-3 py-1 text-sm font-semibold text-[var(--color-mint-700)]">
              감지된 과목: {detected}
            </span>
          )}
          <p className="text-sm text-[var(--color-text-muted)]">{helper}</p>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="과목 선택"
        className="flex flex-wrap gap-2"
      >
        {subjects.map((subject) => {
          const active = selected === subject;
          return (
            <button
              key={subject}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(subject)}
              disabled={submitting}
              className={`rounded-[var(--radius-pill)] border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint-500)] focus-visible:ring-offset-2 disabled:opacity-50 ${
                active
                  ? "border-transparent bg-[var(--color-primary-cta)] text-[var(--color-text-inverse)]"
                  : "border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-default)] hover:border-[var(--color-border-strong)]"
              }`}
            >
              {subject}
            </button>
          );
        })}
      </div>

      <Button
        className="w-full"
        disabled={!selected || submitting}
        onClick={() => selected && onConfirm(selected)}
      >
        {submitting && <Loader2 className="mr-2 animate-spin" size={16} />}
        {submitting ? "회독 퀘스트 등록 중..." : "이 과목으로 시작"}
      </Button>
    </section>
  );
}
