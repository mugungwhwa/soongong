// get_journey_map RPC(0021) 출력 계약과 1:1 매핑.
// ⚠️ 이 레이어는 RPC가 사전 계산해 저장한 값만 소비한다.
//    망각/FSRS 재계산 금지(Gate B). forgetting_risk·mastery는 읽기 전용.

export type ForgettingRisk = "low" | "medium" | "high";

/** summary: 지표 바 두 카드(탐험률/생생도)의 원천. coverage·vividness는 0~1 비율. */
export interface JourneySummary {
  /** 탐험률 = lit_count / scope_total (topics 기준, 0~1). UI는 정수% 반올림. */
  coverage: number;
  /** 생생도 = mastery 평균 (0~1). UI는 정수% 반올림. */
  vividness: number;
  scope_total: number;
  lit_count: number;
}

/** regions[]: far LOD — 영역(엽) 단위 집계. risk_score desc 정렬되어 옴. */
export interface JourneyRegion {
  region_code: string;
  region_name: string;
  /** 영역 평균 mastery (0~1) → 엽 밝기. */
  mastery_avg: number;
  /** 영역 내 전체 topic 수. */
  node_count: number;
  /** ≥1 SMI인 topic 수 (켜진 불). */
  lit_count: number;
  /** high-risk 또는 연체 개념 수 → dimming(흐려짐) 강도. */
  dimming_count: number;
  /** 영역 위험도 평균 1.0~3.0 → auto-focus 우선순위. */
  risk_score: number;
}

/** hotspots[]: "지금 흐려지는 곳" 패널의 정본 텍스트 소스. 상위 8개. */
export interface JourneyHotspot {
  concept_id: string;
  region_code: string | null;
  unit_name: string | null;
  topic_name: string | null;
  mastery: number;
  forgetting_risk: ForgettingRisk;
  next_review_due: string | null;
  last_reviewed_at: string | null;
}

/** nodes[]: near LOD — p_region_code 지정 시에만 채워짐(lazy). */
export interface JourneyNode {
  concept_id: string;
  unit_name: string | null;
  topic_name: string | null;
  mastery: number;
  forgetting_risk: ForgettingRisk;
  next_review_due: string | null;
  last_reviewed_at: string | null;
}

/** get_journey_map 전체 반환 형태. */
export interface JourneyMap {
  summary: JourneySummary;
  regions: JourneyRegion[];
  hotspots: JourneyHotspot[];
  /** far 호출 시 [], near 호출(region_code) 시 해당 영역 노드. */
  nodes: JourneyNode[];
}
