"use client";
import { useTodayQuests } from "@/entities/quest";
import { QuestCard } from "./quest-card";

export function QuestList() {
  const { quests, loading } = useTodayQuests();

  if (loading) {
    return (
      <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
        퀘스트 불러오는 중…
      </p>
    );
  }

  if (quests.length === 0) {
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
