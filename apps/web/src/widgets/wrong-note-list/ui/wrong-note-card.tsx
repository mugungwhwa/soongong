"use client";

import { Check, ArrowRight } from "lucide-react";
import { RiskBadge } from "@/entities/quest";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/config/routes";
import type { WrongNote } from "@/shared/contracts";
import { SubjectIcon } from "./subject-icon";

function MemoryHpDots({ hp }: { hp: WrongNote["memoryHp"] }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{
            background:
              i < hp
                ? "var(--color-mint-500)"
                : "var(--color-border-default)",
          }}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-xs text-[var(--color-text-muted)]">
        기억 HP {hp}/5
      </span>
    </div>
  );
}

function formatLastWrong(isoDate: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "오늘 틀림";
  if (diff === 1) return "어제 틀림";
  if (diff < 7) return `${diff}일 전 틀림`;
  if (diff < 14) return "1주 전 틀림";
  return `${Math.floor(diff / 7)}주 전 틀림`;
}

interface Props {
  note: WrongNote;
}

export function WrongNoteCard({ note }: Props) {
  // TODO(P4): recoveryQuestId가 실제로 있으면 ROUTES.play(id) 사용.
  const retryHref = note.recoveryQuestId
    ? ROUTES.play(note.recoveryQuestId)
    : ROUTES.recovery(note.id);

  const isDone = note.memoryHp === 5;

  return (
    <Card
      className="flex items-start gap-3 p-3"
      style={{
        borderColor: note.isOverdue
          ? "var(--color-risk-high)"
          : "var(--color-border-default)",
      }}
    >
      {/* 과목 아이콘 */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
        style={{ background: "var(--color-bg-sunken)" }}
      >
        <SubjectIcon subject={note.subject} />
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* 상단: 오버듀 태그 + 위험도 뱃지 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {note.isOverdue && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-[var(--radius-sm)]"
              style={{
                background: "var(--color-risk-high)",
                color: "var(--color-text-inverse)",
              }}
            >
              회독 미완료
            </span>
          )}
          <RiskBadge level={note.riskLevel} />
        </div>

        {/* 제목 */}
        <p className="text-sm font-semibold text-[var(--color-text-strong)] truncate">
          {note.title}
        </p>

        {/* 메타 */}
        <p className="text-xs text-[var(--color-text-muted)]">
          {note.unit}
          <span className="mx-1">·</span>
          {formatLastWrong(note.lastWrongAt)}
        </p>

        {/* HP + 재도전 버튼 */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <MemoryHpDots hp={note.memoryHp} />

          {isDone ? (
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-[var(--radius-sm)]"
              style={{
                background: "var(--color-mint-100)",
                color: "var(--color-mint-700)",
              }}
            >
              <Check size={13} strokeWidth={2} aria-hidden="true" />
              완파
            </span>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-7 text-xs font-semibold shrink-0"
              style={{
                borderColor: "var(--color-mint-500)",
                color: "var(--color-mint-700)",
              }}
            >
              <a href={retryHref} className="inline-flex items-center gap-1">
                다시 풀기
                <ArrowRight size={13} strokeWidth={1.5} aria-hidden="true" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
