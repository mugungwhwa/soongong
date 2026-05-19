"use client";
import { useTodayQuests } from "@/entities/quest";
import { QuestCard } from "./quest-card";

export function QuestList() {
  const quests = useTodayQuests();
  return (
    <div className="flex flex-col gap-3">
      {quests.map((q, i) => (
        <QuestCard key={q.questId} quest={q} index={i} />
      ))}
    </div>
  );
}
