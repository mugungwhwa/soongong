"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Flame } from "lucide-react";
import type { JourneyHotspot } from "@/features/journey-map";
import { ROUTES } from "@/shared/config/routes";
import { Mascot } from "@/shared/ui/mascot";
import { JOURNEY_MAP_STRINGS as S } from "../model/strings";

/** 흐려짐 정도(forgetting_risk) → 라벨 + 위험도 토큰 색. */
function riskMeta(risk: JourneyHotspot["forgetting_risk"]) {
  switch (risk) {
    case "high":
      return { label: S.riskHigh, color: "var(--color-risk-high)" };
    case "medium":
      return { label: S.riskMedium, color: "var(--color-risk-mid)" };
    default:
      return { label: S.riskLow, color: "var(--color-risk-low)" };
  }
}

/** 복습 예정일 → 사람 친화 문구(fear 0, 사실 기반). */
function dueCopy(due: string | null): string {
  if (!due) return S.hotspotNoSchedule;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due + "T00:00:00");
  if (d.getTime() <= today.getTime()) {
    return d.getTime() === today.getTime() ? S.hotspotDueToday : S.hotspotOverdue;
  }
  return due;
}

function HotspotRow({ hotspot }: { hotspot: JourneyHotspot }) {
  const router = useRouter();
  const meta = riskMeta(hotspot.forgetting_risk);
  const title = hotspot.topic_name ?? hotspot.unit_name ?? S.conceptFallback;

  return (
    <li>
      <button
        type="button"
        onClick={() => router.push(ROUTES.recovery(hotspot.concept_id))}
        className="flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-[var(--space-3)] text-left transition-colors hover:border-[var(--color-border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-mint-500)]"
      >
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-pill)]"
          style={{ backgroundColor: meta.color }}
          aria-hidden="true"
        >
          <Flame size={16} strokeWidth={2.4} className="text-[var(--color-text-on-warm)]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--color-text-strong)]">
            {title}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <span>{meta.label}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{dueCopy(hotspot.next_review_due)}</span>
          </span>
        </span>
        <span className="flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-mint-700)]">
          {S.hotspotReviewCta}
          <ChevronRight size={14} strokeWidth={2.4} />
        </span>
      </button>
    </li>
  );
}

/** "지금 흐려지는 곳" 패널. 진입 시 펼친 채(망각 상시 노출). 비면 듀공 안심 문구. */
export function HotspotPanel({
  hotspots,
  expanded,
  onToggle,
}: {
  hotspots: JourneyHotspot[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const isEmpty = hotspots.length === 0;

  return (
    <section
      aria-label={S.hotspotTitle}
      className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]"
    >
      <header className="flex items-center justify-between p-[var(--space-4)]">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-text-strong)]">
            <Flame size={16} strokeWidth={2.4} className="text-[var(--color-mint-700)]" />
            {S.hotspotTitle}
            {!isEmpty && (
              <span className="ml-1 rounded-[var(--radius-pill)] bg-[var(--color-risk-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--color-text-default)]">
                {hotspots.length}
              </span>
            )}
          </h3>
          {!isEmpty && (
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{S.hotspotSubtitle}</p>
          )}
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="flex flex-shrink-0 items-center gap-1 rounded-[var(--radius-pill)] px-2 py-1 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-mint-500)]"
          >
            {expanded ? S.hotspotCollapse : S.hotspotExpand}
            <ChevronDown
              size={14}
              strokeWidth={2.4}
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform var(--duration-fast) var(--ease-out-soft)",
              }}
            />
          </button>
        )}
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-[var(--space-2)] px-[var(--space-4)] pb-[var(--space-6)] pt-[var(--space-2)] text-center">
          <Mascot mood="cheer" size="lg" />
          <p className="text-base font-bold text-[var(--color-text-strong)]">
            {S.hotspotEmptyMascot}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">{S.hotspotEmptyHint}</p>
        </div>
      ) : (
        expanded && (
          <ul className="flex flex-col gap-[var(--space-2)] px-[var(--space-4)] pb-[var(--space-4)]">
            {hotspots.map((h) => (
              <HotspotRow key={h.concept_id} hotspot={h} />
            ))}
          </ul>
        )
      )}
    </section>
  );
}
