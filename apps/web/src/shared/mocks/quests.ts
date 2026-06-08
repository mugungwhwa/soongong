// 계약: @/shared/contracts (Quest). 본 파일은 fixture 구현.
import type { Quest } from "@/shared/contracts";

export const MOCK_QUESTS: Quest[] = [
  {
    questId: "q-001",
    objectId: "obj-math-001",
    subject: "수학",
    unit: "수열",
    topic: "점화식",
    questFormat: "회독",
    riskLevel: "high",
    forgettingRisk: 78,
    rewardXp: 20,
    dueDate: new Date().toISOString(),
  },
  {
    questId: "q-002",
    objectId: "obj-eng-007",
    subject: "영어",
    unit: "어휘",
    topic: "혼동 어휘 affect/effect",
    questFormat: "오답회수",
    riskLevel: "mid",
    forgettingRisk: 52,
    rewardXp: 30,
    dueDate: new Date().toISOString(),
  },
  {
    questId: "q-003",
    objectId: "obj-kor-012",
    subject: "국어",
    unit: "비문학",
    topic: "지문 구조 — 대조",
    questFormat: "변형",
    riskLevel: "low",
    forgettingRisk: 24,
    rewardXp: 20,
    dueDate: new Date().toISOString(),
  },
];

export function getTodayQuests(): Quest[] {
  return MOCK_QUESTS;
}

export function getQuestById(id: string): Quest | undefined {
  return MOCK_QUESTS.find((q) => q.questId === id);
}
