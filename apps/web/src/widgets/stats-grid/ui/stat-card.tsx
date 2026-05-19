import { Card } from "@/shared/ui/card";

export function StatCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: string;
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <Card className="p-4 flex flex-col gap-1 shadow-[var(--shadow-card)] border-[var(--color-border-default)]">
      <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-[var(--color-text-strong)]">
        {value}
        {suffix && (
          <span className="text-sm text-[var(--color-text-muted)] ml-1">{suffix}</span>
        )}
      </div>
    </Card>
  );
}
