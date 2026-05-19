import { Card } from "@/shared/ui/card";

interface SubjectStat {
  subject: string;
  emoji: string;
  percent: number;
}

const SUBJECTS: SubjectStat[] = [
  { subject: "수학", emoji: "📐", percent: 70 },
  { subject: "영어", emoji: "📖", percent: 60 },
  { subject: "국어", emoji: "📚", percent: 56 },
  { subject: "사회", emoji: "🌏", percent: 56 },
];

export function SubjectProgress() {
  return (
    <Card className="p-4 shadow-[var(--shadow-card)] border-[var(--color-border-default)]">
      <div className="text-sm font-semibold text-[var(--color-text-strong)] mb-3">과목별 진행률</div>
      <div className="space-y-3">
        {SUBJECTS.map((s) => (
          <div key={s.subject}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5">
                <span>{s.emoji}</span>
                <span className="text-[var(--color-text-default)]">{s.subject}</span>
              </span>
              <span className="text-[var(--color-text-muted)] font-medium">{s.percent}%</span>
            </div>
            <div className="h-2 rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-mint-500)] transition-all"
                style={{ width: `${s.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
