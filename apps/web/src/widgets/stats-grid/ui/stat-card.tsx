import { Card } from "@/shared/ui/card";
import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

export function StatCard({
  Icon,
  label,
  value,
  suffix,
  children,
}: {
  Icon: ComponentType<LucideProps>;
  label: string;
  value: string | number;
  suffix?: string;
  /** 값 아래 보조 표현(예: 기억HP 0–5 정수 점). */
  children?: ReactNode;
}) {
  return (
    <Card className="p-3.5 flex flex-col gap-1 shadow-[var(--shadow-card)] border-[var(--color-border-default)]">
      <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-xs font-bold">
        <Icon
          size={14}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          color="var(--color-mint-500)"
        />
        <span>{label}</span>
      </div>
      <div className="text-xl font-extrabold text-[var(--color-text-strong)] tracking-tight">
        {value}
        {suffix && (
          <span className="text-xs font-bold text-[var(--color-text-muted)] ml-1">
            {suffix}
          </span>
        )}
      </div>
      {children}
    </Card>
  );
}
