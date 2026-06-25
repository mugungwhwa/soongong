// 뱃지 컬렉션 표시용 카탈로그.
//
// 경계(중요): 뱃지 "메카닉"(어떤 키가 있는지·희귀도·획득 조건)은 게임화 SSoT
// (게임성_기획_구조.md §5-3) + game-rules.ts 가 진실 공급원이다. 여기서 새 뱃지를
// 기획하지 않는다 — game-rules.ts 의 badgeCandidates / BADGE_RARITY_MAP 에 이미
// 존재하는 키만 모아 "표시(라벨·획득 조건 카피)" 한다.
// 희귀도는 rarityFor()(game-rules SSoT)에서 직접 읽어 두 번째 SSoT 를 만들지 않는다.
//
// 사람이 읽는 한글 라벨·조건 문구는 카피(디자인 리드 도메인)다. 단, 서버에 본 목록
// 밖의 badge_key 가 추가될 수 있으므로 "정본 전체 카탈로그"는 게임화 리드 확정 대상.
import { rarityFor } from "./game-rules";
import type { BadgeRarity } from "../model";

export interface BadgeCatalogEntry {
  /** DB badge_key (획득 데이터와 매칭되는 키). */
  key: string;
  /** 표시 라벨(카피). */
  label: string;
  /** 획득 조건 한 줄(카피) — game-rules.badgeCandidates 로직과 일치. */
  condition: string;
  rarity: BadgeRarity;
}

// game-rules.ts(badgeCandidates / BADGE_RARITY_MAP)에 등장하는 키 + 조건 카피.
const CATALOG_KEYS: { key: string; label: string; condition: string }[] = [
  { key: "first_quest", label: "첫 회독", condition: "첫 회독 완료" },
  { key: "streak_7", label: "7일 연속", condition: "스트릭 7일 달성" },
  { key: "streak_30", label: "30일 연속", condition: "스트릭 30일 달성" },
  { key: "hp_full", label: "기억 만렙", condition: "기억 HP 5 달성" },
  { key: "recover_50", label: "오답 정복", condition: "오답 50회 회수" },
  { key: "defense_7", label: "7일 방어", condition: "7일 망각방어 성공" },
  { key: "defense_14", label: "14일 방어", condition: "14일 망각방어 성공" },
  { key: "concept_20", label: "개념 20", condition: "개념 20개 또렷" },
];

/** 표시용 전체 뱃지 카탈로그. 희귀도는 game-rules.rarityFor() SSoT 에서 읽는다. */
export const BADGE_CATALOG: BadgeCatalogEntry[] = CATALOG_KEYS.map((b) => ({
  ...b,
  rarity: rarityFor(b.key),
}));
