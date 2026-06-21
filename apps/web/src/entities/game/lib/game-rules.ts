// 순수 게임 룰 함수 — Supabase/Edge 의존 없이 단위 테스트 가능
// SSoT: 01_제품_UX_게임화/게임성_기획_구조.md v1.0
import type { Rank, BadgeRarity } from "../model";

// SOO-115: 회독 자가평가 3단계
// 또렷(clear) / 가물가물(fuzzy) / 막막(blank)
export type ReviewGrade = "clear" | "fuzzy" | "blank";

// 복습 간격 — Karpicke & Roediger(2008) / Cepeda(2006)
// 또렷: hint 있거나 느리면 7일 / 빠르면 14일
// 가물가물: 3일, 막막: 1일
export function gradeToInterval(
  grade: ReviewGrade,
  hintUsed: boolean,
  solveSeconds: number,
): number {
  if (grade === "blank") return 1;
  if (grade === "fuzzy") return 3;
  if (hintUsed || solveSeconds >= 60) return 7;
  return 14;
}

// 기억 HP 변화량 (SSoT §4-2: HP 0-5 정수)
export function gradeToHpDelta(grade: ReviewGrade): number {
  if (grade === "clear") return 2;
  if (grade === "blank") return -1;
  return 0; // fuzzy
}

export const XP_RULES = {
  today_quest_done: 20,
  wrong_recovery_success: 30,
  memory_defense_success: 40,
  no_hint_correct: 10,
  day7_correct: 20,
  day14_defense: 50,
  boss_clear: 80,
} as const;

// SSoT §6-1 XP 구간 → rank 6단
export function xpToRank(xp: number): Rank {
  if (xp >= 12000) return "순공전설";
  if (xp >= 7000) return "순공마왕";
  if (xp >= 3500) return "순공도사";
  if (xp >= 1500) return "순공대장";
  if (xp >= 500) return "순공러";
  return "순공입문";
}

// SSoT §4-2: 기억 HP 0-5 정수
export function clampHp(hp: number): number {
  return Math.max(0, Math.min(5, hp));
}

// 스트릭 계산: 어제 활동 → 스트릭+1, 이미 오늘 → 유지, 그 외 → 1 초기화
export function calcStreak(streakDays: number, lastActiveDate: string | null, today: string): number {
  if (lastActiveDate === today) return streakDays;
  const prev = new Date(today);
  prev.setDate(prev.getDate() - 1);
  const yest = prev.toISOString().slice(0, 10);
  return lastActiveDate === yest ? streakDays + 1 : 1;
}

// SSoT §5-3: 뱃지 희귀도 4단계
const BADGE_RARITY_MAP: Record<string, BadgeRarity> = {
  streak_7: "rare",
  recover_50: "rare",
  defense_7: "rare",
  concept_20: "rare",
  streak_30: "epic",
  defense_14: "epic",
};
export function rarityFor(badgeKey: string): BadgeRarity {
  return BADGE_RARITY_MAP[badgeKey] ?? "common";
}

// 뱃지 후보 결정 (순수 로직)
export function badgeCandidates(
  streak: number,
  hp: number,
  mode: string,
  result: string,
  completed: boolean,
): string[] {
  const candidates: string[] = [];
  if (completed) candidates.push("first_quest");
  if (streak >= 7) candidates.push("streak_7");
  if (streak >= 30) candidates.push("streak_30");
  if (hp === 5) candidates.push("hp_full");
  if (mode === "memory_defense" && result === "correct") candidates.push("defense_7");
  return candidates;
}
