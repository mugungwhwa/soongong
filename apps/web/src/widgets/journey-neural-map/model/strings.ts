// 저니탭 뉴럴 맵 i18n 문자열 레이어 (ko).
// Gate B: 컴포넌트에 한글 하드코딩 0 — 모든 라벨/카피는 여기서만 읽는다.
// 향후 로케일 확장 시 이 객체를 ko 사전으로 분리한다.
//
// 카피 원칙(SOO-52 게임화 리드 확정 / 이슈 가드레일):
//  - 불(뉴런 점등) 메타포: 탐험률=켜진 불, 생생도=불 밝기, 망각=흐려짐.
//  - fear 카피 0 ("안 하면 떨어진다" 류 금지). 가치/회복 중심.
//  - 기억 HP(0-5)와 혼동 방지: 여기 수치는 '밝기/탐험'이지 HP가 아님을 라벨로 명시.

export const JOURNEY_MAP_STRINGS = {
  // ── 지표 카드 ──────────────────────────────────────────────
  coverageLabel: "탐험률",
  coverageHint: "켜본 개념의 비율",
  vividnessLabel: "생생도",
  vividnessHint: "켜둔 불의 평균 밝기",
  // HP 혼동 방지 — 이 지표는 기억 HP가 아니라 '지도 밝기'임을 명시
  notHpNote: "기억 HP와 별개 — 지도에 켜진 불빛이에요",

  // ── 캔버스 ────────────────────────────────────────────────
  canvasAriaLabel: "내 지식 뉴럴 맵 — 영역별 불빛으로 탐험·생생도를 보여줍니다",
  regionDimmingSuffix: "곳 흐려지는 중",
  lodHintFar: "영역을 탭하거나 확대해 개념을 살펴보세요",
  loadingRegion: "영역 불빛 켜는 중…",

  // ── "지금 흐려지는 곳" 핫스팟 패널 ─────────────────────────
  hotspotTitle: "지금 흐려지는 곳",
  hotspotSubtitle: "다시 켜두면 오래 생생해요",
  hotspotEmptyMascot: "지금은 다 생생해요 🌿",
  hotspotEmptyHint: "흐려지는 개념이 없어요. 이대로도 좋아요!",
  hotspotReviewCta: "회독하기",
  conceptFallback: "개념",
  hotspotDueToday: "오늘 복습일",
  hotspotOverdue: "복습일 지남",
  hotspotNoSchedule: "복습 예정 없음",
  hotspotCollapse: "접기",
  hotspotExpand: "펼치기",

  // ── 위험도(흐려짐 정도) 라벨 ───────────────────────────────
  riskHigh: "많이 흐려짐",
  riskMedium: "조금 흐려짐",
  riskLow: "생생함",

  // ── 로딩 / 에러 / 빈 상태 ──────────────────────────────────
  loading: "망각 지도를 그리는 중…",
  errorTitle: "지도를 불러오지 못했어요",
  errorRetry: "다시 시도",
  emptyTitle: "아직 켜진 불이 없어요",
  emptyHint: "문제를 올리면 여기에 첫 불빛이 켜져요 🌱",

  // ── 섹션 헤더 ──────────────────────────────────────────────
  sectionTitle: "망각 지도",
  sectionSubtitle: "지도는 불, 글자는 패널 — 흐려지는 곳을 한눈에",
} as const;

export type JourneyMapStrings = typeof JOURNEY_MAP_STRINGS;

/** mastery(0~1) → 밝기 마이크로카피. 상태별 카피(불 메타포). */
export function vividnessStateCopy(mastery: number): string {
  if (mastery >= 0.75) return JOURNEY_MAP_STRINGS.riskLow;
  if (mastery >= 0.4) return JOURNEY_MAP_STRINGS.riskMedium;
  return JOURNEY_MAP_STRINGS.riskHigh;
}
