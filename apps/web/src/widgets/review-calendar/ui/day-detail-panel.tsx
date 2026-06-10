"use client";

import { Card } from "@/shared/ui/card";
import type { ReviewQuest, ReviewCycle } from "@/shared/contracts";

// ---------------------------------------------------------------------------
// 차수 배지 색상 (등록 토큰만 사용)
// ---------------------------------------------------------------------------
const CYCLE_BADGE_BG: Record<ReviewCycle, string> = {
  1: "var(--color-mint-100)",
  3: "var(--color-mint-300)",
  7: "var(--color-mint-500)",
  14: "var(--color-mint-700)",
};

const CYCLE_BADGE_COLOR: Record<ReviewCycle, string> = {
  1: "var(--color-mint-900)",
  3: "var(--color-mint-900)",
  7: "var(--color-text-inverse)",
  14: "var(--color-text-inverse)",
};

const CYCLE_LABEL: Record<ReviewCycle, string> = {
  1: "1일",
  3: "3일",
  7: "7일",
  14: "14일",
};

// ---------------------------------------------------------------------------
// 날짜 표시 포맷 (YYYY-MM-DD → M월 D일 (요일))
// ---------------------------------------------------------------------------
const DOW_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return `${month}월 ${day}일 (${DOW_KO[d.getDay()]})`;
}

// ---------------------------------------------------------------------------
// 서브컴포넌트: 퀘스트 행
// ---------------------------------------------------------------------------
function QuestRow({ quest }: { quest: ReviewQuest }) {
  const isOverdue = quest.status === "overdue";
  const isDone = quest.status === "done";

  return (
    <div className="flex items-center gap-3 py-2">
      {/* 차수 배지 */}
      <span
        className="shrink-0 inline-flex items-center justify-center w-10 h-6 rounded-[var(--radius-pill)] text-[11px] font-semibold"
        style={{
          background: isOverdue
            ? "var(--color-risk-bg)"
            : CYCLE_BADGE_BG[quest.cycle],
          color: isOverdue ? "var(--color-risk-high)" : CYCLE_BADGE_COLOR[quest.cycle],
        }}
      >
        {CYCLE_LABEL[quest.cycle]}
      </span>

      {/* 퀘스트 정보 */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            color: isDone
              ? "var(--color-text-muted)"
              : "var(--color-text-strong)",
            textDecoration: isDone ? "line-through" : "none",
          }}
        >
          {quest.subject} · {quest.title}
        </p>
        <p className="text-[11px] text-[var(--color-text-muted)] truncate">
          {quest.unit} · 등록 {quest.registeredDate.slice(5).replace("-", "/")}
        </p>
      </div>

      {/* 액션 버튼 */}
      {!isDone && (
        <button
          className="shrink-0 px-3 py-1 rounded-[var(--radius-pill)] text-xs font-semibold transition-colors"
          style={{
            background: isOverdue
              ? "var(--color-risk-high)"
              : "var(--color-mint-500)",
            color: "var(--color-text-inverse)",
          }}
          // TODO(P4): ROUTES.play 경로로 라우팅 연결
        >
          풀기
        </button>
      )}
      {isDone && (
        <span
          className="shrink-0 text-[11px] font-medium"
          style={{ color: "var(--color-mint-500)" }}
        >
          완료
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------------
interface Props {
  date: string;
  quests: ReviewQuest[];
}

export function DayDetailPanel({ date, quests }: Props) {
  const label = formatDateLabel(date);
  const scheduledCount = quests.filter((q) => q.status === "scheduled").length;
  const doneCount = quests.filter((q) => q.status === "done").length;
  const overdueCount = quests.filter((q) => q.status === "overdue").length;

  const countLabel =
    quests.length === 0
      ? "회독 없음"
      : [
          doneCount > 0 && `완료 ${doneCount}개`,
          scheduledCount > 0 && `예정 ${scheduledCount}개`,
          overdueCount > 0 && `미완료 ${overdueCount}개`,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <Card className="p-3">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-strong)" }}
        >
          {label}
        </span>
        <span
          className="text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          {countLabel}
        </span>
      </div>

      {/* 퀘스트 없음 */}
      {quests.length === 0 && (
        <p
          className="text-sm text-center py-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          이 날은 예정된 회독이 없어요
        </p>
      )}

      {/* 퀘스트 목록 */}
      {quests.length > 0 && (
        <div className="divide-y divide-[var(--color-border-default)]">
          {quests.map((q) => (
            <QuestRow key={q.id} quest={q} />
          ))}
        </div>
      )}
    </Card>
  );
}
