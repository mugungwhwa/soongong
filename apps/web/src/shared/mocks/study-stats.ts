// 그래프(대시보드) 화면 fixture — 주간/월간 XP 추이, 개념 정답률, 망각방어.
// 설계 SSoT: docs/prototypes/SOO-108/index.html §3(그래프). 값 규칙은 게임화 SSoT 미러.
//
// MOCK: 시계열·정답률·망각방어는 아직 엔진 미연결. 학습 엔진(SOO-100)과
// 게임화 채움(SOO-98) 인터페이스가 열리면 본 fixture를 실데이터 조회로 교체한다.
// 기억HP·연속일수 등 게임 상태 값은 @/shared/mocks/game-state(getGameState)에서 읽는다.

export type StatsPeriod = "week" | "month";

export type XpBar = { label: string; value: number };

export type DefenseLevel = "ok" | "warn" | "risk";
export type DefenseRow = { label: string; pct: number; level: DefenseLevel };

export type AccuracyBreakdown = {
  pct: number;
  matched: number; // 맞힌 개념
  review: number; // 다시 볼 개념
  fresh: number; // 이번 주 신규
};

export type PeriodStats = {
  xp: number;
  delta: string;
  barTitle: string;
  barSum: string;
  bars: XpBar[];
};

export const MOCK_PERIOD_STATS: Record<StatsPeriod, PeriodStats> = {
  week: {
    xp: 420,
    delta: "지난주 +18%",
    barTitle: "주간 XP 추이",
    barSum: "합계 420 XP",
    bars: [
      { label: "월", value: 60 },
      { label: "화", value: 40 },
      { label: "수", value: 80 },
      { label: "목", value: 50 },
      { label: "금", value: 90 },
      { label: "토", value: 60 },
      { label: "일", value: 40 },
    ],
  },
  month: {
    xp: 1680,
    delta: "지난달 +24%",
    barTitle: "월간 XP 추이 (주별)",
    barSum: "합계 1,680 XP",
    bars: [
      { label: "1주", value: 340 },
      { label: "2주", value: 420 },
      { label: "3주", value: 520 },
      { label: "4주", value: 400 },
    ],
  },
};

export const MOCK_ACCURACY: AccuracyBreakdown = {
  pct: 86,
  matched: 43,
  review: 7,
  fresh: 11,
};

export const MOCK_DEFENSE: DefenseRow[] = [
  { label: "미분", pct: 90, level: "ok" },
  { label: "적분", pct: 72, level: "warn" },
  { label: "확률", pct: 84, level: "ok" },
  { label: "수열", pct: 95, level: "ok" },
  { label: "방정식", pct: 58, level: "risk" },
];

/** 최장 연속 순공일 (게임화 채움 SOO-98 연결 시 실값으로 교체). */
export const MOCK_LONGEST_STREAK = 18;
