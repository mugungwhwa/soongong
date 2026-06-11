"use client";
import Link from "next/link";
import { useGameState } from "@/entities/user-game-state";
import { ROUTES } from "@/shared/config/routes";
import type { UserRank } from "@/shared/contracts";
import { ChevronRight, MapPin, Trophy } from "lucide-react";

// §6-1 — 게임성_기획_구조.md v1.0 SSoT 누적 XP 임계값
const RANKS: { name: UserRank; minXp: number; emoji: string }[] = [
  { name: "순공입문", minXp: 0 },
  { name: "순공러", minXp: 500 },
  { name: "순공대장", minXp: 1500 },
  { name: "순공도사", minXp: 3500 },
  { name: "순공마왕", minXp: 7000 },
  { name: "순공전설", minXp: 12000 },
].map((r, i) => ({
  ...r,
  emoji: ["🧭", "🌊", "⚓", "🐬", "🦈", "🏆"][i],
})) as { name: UserRank; minXp: number; emoji: string }[];

function computeTierInfo(xp: number) {
  // 음수/NaN 방어: 하한 0 정규화. (RANKS[0].minXp=0 이라 정규화 후엔 항상 매칭)
  const normalizedXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  const reverseIdx = [...RANKS]
    .reverse()
    .findIndex((r) => normalizedXp >= r.minXp);
  // findIndex 가 -1 이어도 idx 가 배열 범위를 벗어나지 않도록 클램프.
  const idx =
    reverseIdx === -1
      ? 0
      : Math.min(RANKS.length - 1, RANKS.length - 1 - reverseIdx);
  const current = RANKS[idx];
  const isMax = idx === RANKS.length - 1;

  if (isMax) {
    return { current, next: null, remaining: 0, progressPct: 100, isMax: true };
  }

  const next = RANKS[idx + 1];
  const span = next.minXp - current.minXp;
  const earned = normalizedXp - current.minXp;
  const progressPct = Math.min(100, Math.round((earned / span) * 100));
  const remaining = next.minXp - normalizedXp;

  return { current, next, remaining, progressPct, isMax: false };
}

/**
 * 오늘 홈 상단 컴팩트 strip — 현재 등급 + 진행바 + 다음 목표를 한 줄 띠로.
 * design-review §2-3: 홈 게임성 강도 30% — 그라데이션 헤더/네온/파티클 금지,
 * 차분한 단일 카드만. 여정 서사(6노드/CTA)는 /journey 화면 담당.
 */
export function TierJourneyHero() {
  const { totalXp } = useGameState();
  const { current, next, remaining, progressPct, isMax } =
    computeTierInfo(totalXp);

  return (
    <Link
      href={ROUTES.journey}
      aria-label="현재 등급과 진행 — 내 여정 더 보기"
      className="group flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[var(--radius-lg)] border border-[var(--color-mint-300)] bg-[var(--color-bg-elevated)] px-4 py-3 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-mint-500)] hover:bg-[var(--color-mint-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint-500)] focus-visible:ring-offset-2"
    >
      {/* 현재 등급 클러스터 */}
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-mint-50)] text-xl leading-none"
        >
          {current.emoji}
        </span>
        <div className="min-w-0">
          <span className="flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider text-[var(--color-mint-700)]">
            <MapPin
              size={9}
              strokeWidth={2}
              color="var(--color-mint-700)"
              fill="none"
              aria-hidden="true"
            />
            지금 여기
          </span>
          <p className="truncate text-base font-extrabold leading-tight text-[var(--color-text-strong)]">
            {current.name}
          </p>
        </div>
      </div>

      {/* 진행바 + 다음 목표 (max 등급이면 달성 표시) */}
      {isMax ? (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-1 items-center justify-end gap-1.5 text-sm font-bold text-[var(--color-mint-700)]"
        >
          <Trophy
            size={15}
            strokeWidth={1.5}
            color="var(--color-xp)"
            fill="none"
            aria-hidden="true"
          />
          최고 등급 달성 — 순공전설
        </div>
      ) : (
        <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-[var(--color-text-muted)]">
              다음{" "}
              <strong className="font-bold text-[var(--color-text-strong)]">
                {next!.name}
              </strong>
              까지{" "}
              <strong className="font-bold text-[var(--color-mint-700)]">
                {remaining.toLocaleString()} XP
              </strong>
            </span>
            <span className="flex-shrink-0 font-extrabold text-[var(--color-mint-500)]">
              {progressPct}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${next!.name}까지 진행률 ${progressPct}%`}
            className="h-1.5 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-mint-100)]"
          >
            <div
              className="h-full rounded-[var(--radius-pill)] bg-[var(--color-mint-500)] transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* 여정 진입 affordance — strip 자체는 정적 표시, 클릭 시 /journey 이동 */}
      <span className="flex flex-shrink-0 items-center gap-0.5 text-xs font-bold text-[var(--color-mint-700)]">
        더 보기
        <ChevronRight
          size={14}
          strokeWidth={2}
          color="var(--color-mint-700)"
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
