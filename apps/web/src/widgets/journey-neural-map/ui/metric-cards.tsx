"use client";

import { Flame, Sparkles } from "lucide-react";
import type { JourneySummary } from "@/features/journey-map";
import { JOURNEY_MAP_STRINGS as S } from "../model/strings";

/** 0~1 → 정수% 반올림. */
function pct(ratio: number): number {
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
}

function MetricCard({
  icon,
  label,
  hint,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: number;
}) {
  return (
    <div
      className="flex-1 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-[var(--space-4)] shadow-[var(--shadow-card)]"
      role="group"
      aria-label={`${label} ${value}%`}
    >
      <div className="flex items-center gap-[var(--space-2)]">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-mint-50)] text-[var(--color-mint-700)]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="text-sm font-semibold text-[var(--color-text-strong)]">
          {label}
        </span>
      </div>
      <div className="mt-[var(--space-2)] flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums text-[var(--color-text-strong)]">
          {value}
        </span>
        <span className="text-base font-semibold text-[var(--color-text-muted)]">%</span>
      </div>
      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{hint}</p>
    </div>
  );
}

/** 지표 바 — 탐험률·생생도 두 카드 분리(Gate B: 단일 바 아님). */
export function MetricCards({ summary }: { summary: JourneySummary }) {
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex gap-[var(--space-3)]">
        <MetricCard
          icon={<Flame size={16} strokeWidth={2.4} />}
          label={S.coverageLabel}
          hint={S.coverageHint}
          value={pct(summary.coverage)}
        />
        <MetricCard
          icon={<Sparkles size={16} strokeWidth={2.4} />}
          label={S.vividnessLabel}
          hint={S.vividnessHint}
          value={pct(summary.vividness)}
        />
      </div>
      <p className="text-[11px] text-[var(--color-text-muted)]">{S.notHpNote}</p>
    </div>
  );
}
