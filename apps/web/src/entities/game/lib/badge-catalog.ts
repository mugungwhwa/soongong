// 뱃지 컬렉션 표시용 카탈로그 — 정본은 DB view `public.badge_definitions`
// (supabase/migrations/0011_badges.sql). 본 목록은 그 view 의 10행을 1:1 미러링한다.
//
// 왜 정적 미러인가: 프론트는 SQL 을 import 할 수 없고, 레이블/조건 문구는 어차피 UI 카피다.
// 그래서 key·rarity 는 view 와 동일하게 고정하고, 표시 라벨·조건만 카피로 붙인다.
// 절대 game-rules.ts(BADGE_RARITY_MAP/badgeCandidates)에서 derive 하지 않는다 —
// 그건 희귀도 조회·발급후보 계산용이라 전체 카탈로그 SSoT 가 아니며(recover_10/study_60
// 누락), rarityFor() 는 미등록 키를 조용히 "common" 으로 떨궈 오표시를 만든다.
// rarity 는 BadgeRarity 로 타입 고정 → 오타 시 컴파일 에러로 drift 를 차단한다.
import type { BadgeRarity } from "../model";

export interface BadgeCatalogEntry {
  /** DB badge_key (badge_definitions / badges 와 매칭되는 키). */
  key: string;
  /** 표시 라벨(카피) — badge_definitions.name 과 일치. */
  label: string;
  /** 획득 조건 한 줄(카피) — badge_definitions.description 과 일치. */
  condition: string;
  rarity: BadgeRarity;
}

/** badge_definitions view(0011_badges.sql) 10행을 1:1 미러링한 정본 표시 카탈로그. */
export const BADGE_CATALOG: BadgeCatalogEntry[] = [
  { key: "first_quest", label: "첫 회독", condition: "첫 회독퀘스트 완료", rarity: "common" },
  { key: "streak_7", label: "7일 불꽃", condition: "7일 연속 회독", rarity: "rare" },
  { key: "streak_30", label: "30일 불꽃", condition: "30일 연속 회독", rarity: "epic" },
  { key: "recover_10", label: "오답회수꾼", condition: "오답 10개 다시 맞힘", rarity: "common" },
  { key: "recover_50", label: "오답회수 마스터", condition: "오답 50개 다시 맞힘", rarity: "rare" },
  { key: "defense_7", label: "기억수비수", condition: "7일 전 문제 첫 정답", rarity: "rare" },
  { key: "defense_14", label: "14일 방어", condition: "14일 망각방어 첫 성공", rarity: "epic" },
  { key: "concept_20", label: "수열 사냥꾼", condition: "특정 단원 20회 완료", rarity: "rare" },
  { key: "hp_full", label: "기억 만렙", condition: "기억 HP 5/5 달성", rarity: "common" },
  { key: "study_60", label: "60분 순공러", condition: "하루 인정 순공 60분", rarity: "common" },
];
