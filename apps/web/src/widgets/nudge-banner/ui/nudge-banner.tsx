"use client";
import Link from "next/link";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { useNudgeContext } from "@/shared/lib/nudge-context";
import { ROUTES } from "@/shared/config/routes";

/** 망각위험/복습 due 조건 충족 시 순공이 nudge 배너를 노출한다. 조건 미충족·로딩 중에는 null. */
export function NudgeBanner() {
  const { active, reason, count, loading } = useNudgeContext();
  if (loading || !active) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-risk-high)] bg-[var(--color-bg-elevated)] p-3 shadow-[var(--shadow-card)]"
    >
      <MascotReaction mood="nudge" size="md" reason={reason ?? undefined} priority />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[var(--color-risk-high)]">
          까먹기 직전이에요!
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {reason ? `${reason} · ` : ""}회독 대기 {count}개
        </p>
      </div>
      <Link
        href={ROUTES.today + "#today-quests"}
        className="shrink-0 rounded-[var(--radius-md)] bg-[var(--color-risk-high)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
        aria-label="회독 퀘스트로 이동"
      >
        회독하기
      </Link>
    </div>
  );
}
