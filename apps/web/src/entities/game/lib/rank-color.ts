// 등급색 보상 — 등급 → 디자인 토큰 매핑 (SOO-159/160, 나이키런식 "색을 보상으로").
// 값(hex)은 tokens.css --color-rank-* 한 곳에만 존재한다. 여기서는 등급 → CSS 변수명만
// 매핑한다(2번째 SSoT 금지, soongong-design 규칙). 등급→XP 임계값은 game-rules.ts xpToRank.
//
// 적용 존(정책 SOO-159): 프로필·등급 배지·내기록 헤더·레벨업 축하 연출.
// 브랜드색(v2 Teal/Mint) 유지 존: 홈·회독퀘스트 등 핵심 학습 화면 — 여기선 쓰지 않는다.
import type { UserRank } from "@/shared/contracts";

type RankColorSlug = "novice" | "runner" | "captain" | "sage" | "demon" | "legend";

const RANK_SLUG: Record<UserRank, RankColorSlug> = {
  순공입문: "novice",
  순공러: "runner",
  순공대장: "captain",
  순공도사: "sage",
  순공마왕: "demon",
  순공전설: "legend",
};

/** 등급 accent 색 (emblem 링·아이콘·강조). 예: var(--color-rank-runner). */
export function rankAccent(rank: UserRank): string {
  return `var(--color-rank-${RANK_SLUG[rank]})`;
}

/** 등급 soft 배경 틴트 (배지 pill·emblem 배경 — accent-on-tint 대비 확보). */
export function rankAccentBg(rank: UserRank): string {
  return `var(--color-rank-${RANK_SLUG[rank]}-bg)`;
}

/** 최고 등급(순공전설)만 iridescent 그라데이션 emblem 을 쓴다. */
export function rankIsIridescent(rank: UserRank): boolean {
  return rank === "순공전설";
}

/** 순공전설 emblem 전용 iridescent 그라데이션 토큰. */
export const RANK_LEGEND_GRADIENT = "var(--gradient-rank-legend)";
