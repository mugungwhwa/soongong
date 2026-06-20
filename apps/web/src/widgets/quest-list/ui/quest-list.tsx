"use client";
import { useTodayQuests } from "@/entities/quest";
import { useNudgeTrigger } from "@/entities/memory";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { QuestCard } from "./quest-card";

export function QuestList() {
  const { quests, loading, error } = useTodayQuests();
  const { active: nudgeActive, reason: nudgeReason, count: nudgeCount } = useNudgeTrigger();

  if (loading) {
    return (
      <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
        퀘스트 불러오는 중…
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="py-4 text-center text-sm text-[var(--color-risk-high)]">
        퀘스트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  if (quests.length === 0) {
    if (nudgeActive) {
      return (
        <div className="flex flex-col items-center gap-3 py-6">
          <MascotReaction mood="nudge" size="lg" reason={nudgeReason ?? undefined} />
          <p className="text-sm font-bold text-[var(--color-risk-high)]">
            까먹기 직전이에요!
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {nudgeReason ? `${nudgeReason} · ` : ""}복습 대기 {nudgeCount}개
          </p>
        </div>
      );
    }
    return (
      <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
        오늘의 퀘스트가 없습니다. 문제를 업로드해 보세요!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {quests.map((q, i) => (
        <QuestCard key={q.questId} quest={q} index={i} />
      ))}
    </div>
  );
}
