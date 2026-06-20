// 게임 이벤트 → MascotReaction mood 매핑.
// 표정 자산 선택은 MascotReaction 컴포넌트 책임 — 여기선 mood 값·reason 문자열만 방출.
// SSoT: 01_제품_UX_게임화/게임성_기획_구조.md v1.0

export type GameEvent =
  | "correct"          // 단일 정답
  | "streak_cheer"     // 연속 정답 · 스트릭 유지
  | "review_complete"  // 회독 완료
  | "level_up"         // 레벨업
  | "badge_earned"     // 뱃지 획득
  | "wrong"            // 오답
  | "streak_broken"    // 스트릭 끊김
  | "hp_drop"          // 기억 HP 하락
  | "idle";            // 평상시

export type MascotMoodSignal = {
  mood: "idle" | "cheer" | "nudge" | "praise" | "down";
  reason: string;
};

const EVENT_MAP: Record<GameEvent, Omit<MascotMoodSignal, "reason"> & { defaultReason: string }> =
  {
    correct:         { mood: "praise", defaultReason: "정답" },
    streak_cheer:    { mood: "cheer",  defaultReason: "스트릭 유지" },
    review_complete: { mood: "praise", defaultReason: "회독 완료" },
    level_up:        { mood: "praise", defaultReason: "레벨업" },
    badge_earned:    { mood: "praise", defaultReason: "뱃지 획득" },
    wrong:           { mood: "down",   defaultReason: "오답" },
    streak_broken:   { mood: "down",   defaultReason: "스트릭 끊김" },
    hp_drop:         { mood: "down",   defaultReason: "기억 HP 하락" },
    idle:            { mood: "idle",   defaultReason: "평상시" },
  };

/** 게임 이벤트를 mood + reason 신호로 변환. context가 있으면 reason에 사용. */
export function gameEventToMood(event: GameEvent, context?: string): MascotMoodSignal {
  const { mood, defaultReason } = EVENT_MAP[event];
  return { mood, reason: context ?? defaultReason };
}

/**
 * 회독 결과(isCorrect) + 스트릭 일수로 최적 mood 신호 선택.
 * 스트릭 3일 이상 유지 성공 → cheer, 그 외 정답 → praise, 오답 → down.
 */
export function resultToMood(isCorrect: boolean, streakDays: number): MascotMoodSignal {
  if (!isCorrect) return gameEventToMood("wrong");
  if (streakDays >= 3) return gameEventToMood("streak_cheer", `${streakDays}일 스트릭`);
  return gameEventToMood("review_complete");
}
