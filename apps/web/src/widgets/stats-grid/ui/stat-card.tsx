import { Card } from "@/shared/ui/card";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export function StatCard({
  Icon,
  label,
  value,
  suffix,
}: {
  Icon: ComponentType<LucideProps>;
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <Card className="p-3 flex flex-col gap-1 shadow-[var(--shadow-card)] border-[var(--color-border-default)]">
      <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs">
        <Icon
          size={14}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          color="var(--color-text-muted)"
        />
        <span>{label}</span>
      </div>
      <div className="text-xl font-bold text-[var(--color-text-strong)]">
        {value}
        {suffix && (
          <span className="text-xs text-[var(--color-text-muted)] ml-1">{suffix}</span>
        )}
      </div>
    </Card>
  );
}
