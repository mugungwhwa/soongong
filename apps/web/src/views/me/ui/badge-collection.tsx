"use client";
import { cn } from "@/shared/lib/cn";
// 배럴(@/entities/game) 대신 deep import — 배럴은 api.ts(next/headers 서버 전용)를
// 재export 하므로 클라이언트 컴포넌트가 배럴을 건드리면 서버 코드가 번들에 샌다(FSD 함정).
import { useEarnedBadges } from "@/entities/game/model/use-earned-badges";
import { BADGE_CATALOG } from "@/entities/game/lib/badge-catalog";
import type { BadgeRarity } from "@/entities/game/model";
import { Lock } from "lucide-react";

// UI 레이블: SSoT §5-3 — 일반/희귀/영웅/전설 (DB 키: common/rare/epic/legendary)
const RARITY_LABEL: Record<BadgeRarity, string> = {
  common: "일반",
  rare: "희귀",
  epic: "영웅",
  legendary: "전설",
};

// 획득 뱃지 색 — features/badge-display 와 동일 토큰 매핑 (중복 SSoT 아님: 표시 클래스).
const RARITY_CLASS: Record<BadgeRarity, string> = {
  common: "bg-accent-mintLight text-primary-strong",
  rare: "bg-info-bg text-info",
  epic: "[background:var(--color-epic-bg)] [color:var(--color-epic-text)]",
  legendary: "bg-warning-bg text-reward-gold",
};

type CollectionItem = {
  key: string;
  label: string;
  condition?: string;
  rarity: BadgeRarity;
  earned: boolean;
};

function BadgeTile({ item }: { item: CollectionItem }) {
  return (
    <li
      className={cn(
        "flex flex-col gap-1 rounded-[var(--radius-md)] border p-3 text-center transition-colors",
        item.earned
          ? "border-[var(--color-border-default)] bg-[var(--color-surface)]"
          : "border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-sunken)]",
      )}
    >
      <span
        className={cn(
          "mx-auto inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-bold",
          item.earned
            ? RARITY_CLASS[item.rarity]
            : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]",
        )}
      >
        {!item.earned && <Lock size={9} strokeWidth={2} aria-hidden="true" />}
        {RARITY_LABEL[item.rarity]}
      </span>
      <span
        className={cn(
          "text-sm font-bold",
          item.earned
            ? "text-[var(--color-text-strong)]"
            : "text-[var(--color-text-muted)]",
        )}
      >
        {item.label}
      </span>
      {item.condition && (
        <span className="text-[11px] leading-tight text-[var(--color-text-muted)]">
          {item.condition}
        </span>
      )}
    </li>
  );
}

/**
 * 뱃지 컬렉션 — 카탈로그(표시용) 대비 획득/미획득을 4단 희귀도로 렌더.
 * 획득 데이터는 실 badges 테이블(useEarnedBadges, 목업 X).
 * 카탈로그 밖의 획득 키도 누락 없이 "획득"에 포함한다.
 */
export function BadgeCollection() {
  const earned = useEarnedBadges();
  const earnedMap = new Map(earned.map((b) => [b.badge_key, b]));

  // 카탈로그 기준 전체 목록 + 카탈로그에 없는 획득 키 보강.
  const fromCatalog: CollectionItem[] = BADGE_CATALOG.map((c) => ({
    key: c.key,
    label: c.label,
    condition: c.condition,
    rarity: earnedMap.get(c.key)?.rarity ?? c.rarity,
    earned: earnedMap.has(c.key),
  }));
  const catalogKeys = new Set(BADGE_CATALOG.map((c) => c.key));
  const extraEarned: CollectionItem[] = earned
    .filter((b) => !catalogKeys.has(b.badge_key))
    .map((b) => ({
      key: b.badge_key,
      label: b.badge_key,
      rarity: b.rarity,
      earned: true,
    }));

  const all = [...fromCatalog, ...extraEarned];
  const earnedCount = all.filter((i) => i.earned).length;
  // 획득 먼저, 그다음 미획득.
  const sorted = [...all].sort((a, b) => Number(b.earned) - Number(a.earned));

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-text-muted)]">
        획득{" "}
        <strong className="font-bold text-[var(--color-text-strong)]">
          {earnedCount}
        </strong>{" "}
        / {all.length}
      </p>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.map((item) => (
          <BadgeTile key={item.key} item={item} />
        ))}
      </ul>
    </div>
  );
}
