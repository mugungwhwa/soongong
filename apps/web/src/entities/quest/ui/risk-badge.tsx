import type { QuestRiskLevel } from "@/shared/contracts";

const STYLE: Record<QuestRiskLevel, { bg: string; fg: string; label: string }> = {
  low: { bg: "var(--color-risk-low)", fg: "var(--color-text-inverse)", label: "여유" },
  mid: { bg: "var(--color-risk-mid)", fg: "var(--color-text-on-warm)", label: "주의" },
  high: { bg: "var(--color-risk-high)", fg: "var(--color-text-inverse)", label: "위험" },
};

export function RiskBadge({ level }: { level: QuestRiskLevel }) {
  const s = STYLE[level];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}
