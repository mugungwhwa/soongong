// 순공일지 화면 fixture — 오늘 카드 + 지난 기록 타임라인.
// 설계 SSoT: docs/prototypes/SOO-108/index.html §4(순공일지).
//
// MOCK: 일지 엔트리·순공이 코멘트는 아직 엔진 미연결. 학습 엔진(SOO-100)이
// 일별 회독 로그를 노출하고 게임화 채움(SOO-98)이 코멘트를 생성하면 실데이터로 교체한다.
// 날짜는 fixture 고정 라벨(결정론 유지) — 실연결 시 사용자 타임존 기준으로 포맷한다.

export type DiaryToday = {
  dateLabel: string;
  say: string; // 순공이 한 줄 코멘트
  xp: number;
  minutes: number;
  quests: number;
};

export type DiaryEntry = {
  dateLabel: string;
  subjects: string[];
  say: string;
  xp: number;
  minutes: number;
  quests: number;
};

export const MOCK_DIARY_TODAY: DiaryToday = {
  dateLabel: "6월 20일 · 오늘",
  say: "미분계수 다시 또렷해졌어요. 흐려지기 직전에 잡았네요 — 딱 좋은 타이밍이었어요 🌱",
  xp: 60,
  minutes: 32,
  quests: 3,
};

export const MOCK_DIARY_ENTRIES: DiaryEntry[] = [
  {
    dateLabel: "6월 19일 · 어제",
    subjects: ["수학", "확률과 통계"],
    say: "근의 공식 14일차 회독 완료. 2주 전 개념인데도 거뜬했어요 — 회독이 효과 보는 중이에요.",
    xp: 80,
    minutes: 41,
    quests: 4,
  },
  {
    dateLabel: "6월 18일",
    subjects: ["수학"],
    say: "지수법칙 7일차. 살짝 헷갈렸지만 다시 또렷해졌어요. 7일 주기가 잘 맞아요.",
    xp: 50,
    minutes: 24,
    quests: 2,
  },
  {
    dateLabel: "6월 17일",
    subjects: ["수학", "확률과 통계"],
    say: "순열과 조합 1일차 — 처음이라 어려웠죠. 1·3·7일에 다시 만나면 익숙해질 거예요.",
    xp: 70,
    minutes: 38,
    quests: 3,
  },
  {
    dateLabel: "6월 15일",
    subjects: ["수학"],
    say: "등비수열의 합 7일차 완료. 꾸준함이 보여요 🌱",
    xp: 40,
    minutes: 19,
    quests: 1,
  },
];
