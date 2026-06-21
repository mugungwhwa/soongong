// DoD: 잠금값 검증 — SSoT §4-2 / §5-3 / §6-1
import { describe, it, expect } from "vitest";
import { xpToRank, clampHp, calcStreak, rarityFor, badgeCandidates, XP_RULES, gradeToInterval, gradeToHpDelta } from "../lib/game-rules";

describe("xpToRank — SSoT §6-1 (rank 6단)", () => {
  it("0 XP → 순공입문", () => expect(xpToRank(0)).toBe("순공입문"));
  it("499 XP → 순공입문 (경계 미만)", () => expect(xpToRank(499)).toBe("순공입문"));
  it("500 XP → 순공러", () => expect(xpToRank(500)).toBe("순공러"));
  it("1499 XP → 순공러 (경계 미만)", () => expect(xpToRank(1499)).toBe("순공러"));
  it("1500 XP → 순공대장", () => expect(xpToRank(1500)).toBe("순공대장"));
  it("3500 XP → 순공도사", () => expect(xpToRank(3500)).toBe("순공도사"));
  it("7000 XP → 순공마왕", () => expect(xpToRank(7000)).toBe("순공마왕"));
  it("12000 XP → 순공전설", () => expect(xpToRank(12000)).toBe("순공전설"));
  it("99999 XP → 순공전설 (최대 구간 유지)", () => expect(xpToRank(99999)).toBe("순공전설"));
  // 절대 금지: 식물 모티프 rank 없음
  const VALID_RANKS = ["순공입문","순공러","순공대장","순공도사","순공마왕","순공전설"];
  it("모든 rank 값이 잠긴 6단 내에 있음", () => {
    [0, 500, 1500, 3500, 7000, 12000].forEach(xp => {
      expect(VALID_RANKS).toContain(xpToRank(xp));
    });
  });
});

describe("clampHp — SSoT §4-2 (기억 HP 0-5 정수)", () => {
  it("5 이상 → 5로 클램핑", () => expect(clampHp(6)).toBe(5));
  it("0 이하 → 0으로 클램핑", () => expect(clampHp(-1)).toBe(0));
  it("정상 범위 통과", () => {
    [0, 1, 2, 3, 4, 5].forEach(hp => expect(clampHp(hp)).toBe(hp));
  });
  // 백분율 단위 절대 금지 — HP는 반드시 0-5 정수
  it("HP 최댓값은 5 (100이 아님)", () => expect(clampHp(100)).toBe(5));
});

describe("calcStreak — 스트릭 날짜 계산", () => {
  it("오늘 이미 활동 → streak 유지", () => {
    expect(calcStreak(5, "2026-06-08", "2026-06-08")).toBe(5);
  });
  it("어제 활동 → streak+1", () => {
    expect(calcStreak(5, "2026-06-07", "2026-06-08")).toBe(6);
  });
  it("이틀 전 활동 → 1 초기화", () => {
    expect(calcStreak(5, "2026-06-06", "2026-06-08")).toBe(1);
  });
  it("lastActiveDate null → 1 초기화", () => {
    expect(calcStreak(0, null, "2026-06-08")).toBe(1);
  });
});

describe("rarityFor — SSoT §5-3 (뱃지 희귀도 4단계)", () => {
  const VALID_RARITIES = ["common", "rare", "epic", "legendary"];
  it("streak_7 → rare", () => expect(rarityFor("streak_7")).toBe("rare"));
  it("streak_30 → epic", () => expect(rarityFor("streak_30")).toBe("epic"));
  it("hp_full → common (기본)", () => expect(rarityFor("hp_full")).toBe("common"));
  it("unknown → common (기본)", () => expect(rarityFor("unknown_badge")).toBe("common"));
  // 3단 희귀도 절대 금지 — 반드시 4단 내에 있어야 함
  it("모든 rarity가 잠긴 4단 내에 있음", () => {
    ["first_quest","streak_7","streak_30","defense_14"].forEach(key => {
      expect(VALID_RARITIES).toContain(rarityFor(key));
    });
  });
});

describe("XP_RULES — 행동별 XP 값 검증", () => {
  it("today_quest_done = 20", () => expect(XP_RULES.today_quest_done).toBe(20));
  it("wrong_recovery_success = 30", () => expect(XP_RULES.wrong_recovery_success).toBe(30));
  it("memory_defense_success = 40", () => expect(XP_RULES.memory_defense_success).toBe(40));
});

describe("badgeCandidates — 뱃지 후보 결정 로직", () => {
  it("퀘스트 완료 시 first_quest 포함", () => {
    expect(badgeCandidates(1, 3, "today", "correct", true)).toContain("first_quest");
  });
  it("미완료 시 first_quest 미포함", () => {
    expect(badgeCandidates(1, 3, "today", "correct", false)).not.toContain("first_quest");
  });
  it("streak 7일 → streak_7 뱃지", () => {
    expect(badgeCandidates(7, 3, "today", "correct", true)).toContain("streak_7");
  });
  it("streak 6일 → streak_7 미포함", () => {
    expect(badgeCandidates(6, 3, "today", "correct", true)).not.toContain("streak_7");
  });
  it("HP 5 → hp_full 뱃지", () => {
    expect(badgeCandidates(1, 5, "today", "correct", true)).toContain("hp_full");
  });
  it("memory_defense + correct → defense_7 뱃지", () => {
    expect(badgeCandidates(1, 3, "memory_defense", "correct", true)).toContain("defense_7");
  });
});

describe("gradeToInterval — SOO-115 3단계 회독 간격", () => {
  it("막막(blank) → 1일", () => expect(gradeToInterval("blank", false, 30)).toBe(1));
  it("가물가물(fuzzy) → 3일 (힌트·속도 무관)", () => {
    expect(gradeToInterval("fuzzy", true, 30)).toBe(3);
    expect(gradeToInterval("fuzzy", false, 200)).toBe(3);
  });
  it("또렷(clear) + 빠름(<60s) + 힌트 없음 → 14일", () => {
    expect(gradeToInterval("clear", false, 30)).toBe(14);
  });
  it("또렷(clear) + 힌트 사용 → 7일", () => {
    expect(gradeToInterval("clear", true, 30)).toBe(7);
  });
  it("또렷(clear) + 느림(≥60s) → 7일", () => {
    expect(gradeToInterval("clear", false, 90)).toBe(7);
  });
  it("간격 값이 잠긴 1/3/7/14일 내에만 있음", () => {
    const VALID = [1, 3, 7, 14];
    expect(VALID).toContain(gradeToInterval("blank", false, 30));
    expect(VALID).toContain(gradeToInterval("fuzzy", false, 30));
    expect(VALID).toContain(gradeToInterval("clear", false, 30));
    expect(VALID).toContain(gradeToInterval("clear", true, 30));
  });
});

describe("gradeToHpDelta — SOO-115 기억 HP 변화량 (SSoT §4-2)", () => {
  it("또렷(clear) → +2", () => expect(gradeToHpDelta("clear")).toBe(2));
  it("가물가물(fuzzy) → 0", () => expect(gradeToHpDelta("fuzzy")).toBe(0));
  it("막막(blank) → -1", () => expect(gradeToHpDelta("blank")).toBe(-1));
  it("HP clamp 후 0-5 범위 유지", () => {
    expect(clampHp(5 + gradeToHpDelta("clear"))).toBe(5);  // 5+2 → clamp to 5
    expect(clampHp(0 + gradeToHpDelta("blank"))).toBe(0);  // 0-1 → clamp to 0
  });
});
