"use client";
import { Bell } from "lucide-react";
import { useNudgeContext } from "@/shared/lib/nudge-context";

/** 망각위험/복습 due 조건 충족 시 빨간 도트를 표시하는 알림 벨. */
export function NotificationBell() {
  const { active } = useNudgeContext();

  return (
    <button
      aria-label={active ? "복습 알림 있음" : "알림"}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] transition hover:bg-[var(--color-mint-100)]"
    >
      <Bell
        size={16}
        strokeWidth={1.5}
        color="var(--color-text-muted)"
        fill="none"
        aria-hidden="true"
      />
      {active && (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-risk-high)]"
        />
      )}
    </button>
  );
}
