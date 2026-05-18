import { Card } from "@/shared/ui/card";
import { RiskBadge } from "@/entities/quest/ui/risk-badge";

interface ForgettingItem {
  subject: string;
  topic: string;
  risk: number;
}

const ITEMS: ForgettingItem[] = [
  { subject: "수학", topic: "수열 점화식", risk: 78 },
  { subject: "영어", topic: "혼동 어휘", risk: 72 },
  { subject: "국어", topic: "비문학 추론", risk: 65 },
];

export function ForgettingTop3() {
  return (
    <Card className="p-4 shadow-[var(--shadow-card)] border-[var(--color-border-default)]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-[var(--color-text-strong)]">망각방어 TOP 3</div>
        <RiskBadge level="high" />
      </div>
      <div className="space-y-2">
        {ITEMS.map((i, idx) => (
          <div
            key={i.topic}
            className="flex items-center gap-2 text-sm py-1.5 border-b last:border-b-0 border-[var(--color-border-default)]"
          >
            <span className="text-[var(--color-risk-high)] font-bold w-4">{idx + 1}</span>
            <span className="text-[var(--color-text-muted)] text-xs w-8">{i.subject}</span>
            <span className="flex-1 text-[var(--color-text-default)] truncate">{i.topic}</span>
            <span className="text-xs font-semibold text-[var(--color-risk-high)]">{i.risk}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
