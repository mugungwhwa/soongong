import { cn } from "@/shared/lib/cn";
import type { GameBadge, BadgeRarity } from "@/entities/game";

// UI 레이블: SSoT §5-3 — 일반/희귀/영웅/전설 (DB 키: common/rare/epic/legendary)
const RARITY_LABEL: Record<BadgeRarity, string> = {
  common: "일반",
  rare: "희귀",
  epic: "영웅",
  legendary: "전설",
};

const RARITY_CLASS: Record<BadgeRarity, string> = {
  common: "bg-accent-mintLight text-primary-strong",
  rare: "bg-info-bg text-info",
  epic: "[background:var(--color-epic-bg)] [color:var(--color-epic-text)]",
  legendary: "bg-warning-bg text-reward-gold",
};

function BadgeChip({ badge }: { badge: GameBadge }) {
  return (
    <li
      className={cn(
        "px-md py-sm rounded-pill text-caption font-medium",
        RARITY_CLASS[badge.rarity],
      )}
      title={RARITY_LABEL[badge.rarity]}
    >
      {badge.badge_key}
    </li>
  );
}

export function BadgeList({ badges }: { badges: GameBadge[] }) {
  if (badges.length === 0) {
    return <p className="text-body text-text-secondary">아직 뱃지가 없어요.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-sm">
      {badges.map((b) => (
        <BadgeChip key={b.badge_id} badge={b} />
      ))}
    </ul>
  );
}
