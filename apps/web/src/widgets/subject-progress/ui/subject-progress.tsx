"use client";
import { Card } from "@/shared/ui/card";
import { useSubjectMastery } from "@/entities/subject-mastery";
import type { Subject } from "@/shared/contracts";

/** 과목 이모지는 표시용 매핑(도메인 데이터 아님). */
const SUBJECT_EMOJI: Record<Subject, string> = {
  수학: "📐",
  영어: "📖",
  국어: "📚",
};

export function SubjectProgress() {
  const mastery = useSubjectMastery();
  return (
    <Card className="p-4 shadow-[var(--shadow-card)] border-[var(--color-border-default)]">
      <div className="text-sm font-semibold text-[var(--color-text-strong)] mb-3">과목별 진행률</div>
      <div className="space-y-3">
        {mastery.map((s) => (
          <div key={s.subject}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5">
                <span>{SUBJECT_EMOJI[s.subject]}</span>
                <span className="text-[var(--color-text-default)]">{s.subject}</span>
              </span>
              <span className="text-[var(--color-text-muted)] font-medium">{s.masteryPercent}%</span>
            </div>
            <div className="h-2 rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-mint-500)] transition-all"
                style={{ width: `${s.masteryPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
