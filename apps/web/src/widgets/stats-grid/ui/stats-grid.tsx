"use client";
import Link from "next/link";
import { StatCard } from "./stat-card";
import { useGameState } from "@/entities/user-game-state";
import { ROUTES } from "@/shared/config/routes";
import { Flame, Brain, Clock, Zap } from "lucide-react";

/** 기억HP 0–5 정수 점. 채움=memoryHp, 빈=나머지 (하트·백분율 금지, design-review §2-2). */
function HpDots({ hp }: { hp: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(hp)));
  return (
    <div className="mt-2 flex gap-[3px]" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="h-[13px] w-[13px] rounded-full"
          style={{
            background:
              i < filled
                ? "var(--color-risk-high)"
                : "var(--color-border-default)",
          }}
        />
      ))}
    </div>
  );
}

// 스탯 4박스(스트릭·기억HP·순공시간·XP) — design-review §2-2 잠긴 위계.
// 등급은 TierJourneyHero strip이 전담하므로 여기서 중복 노출하지 않는다 (SOO-121 de-dup).
// 각 박스 → 내 기록(/me) 해당 섹션 anchor 로 진입(SOO-136). 차분한 hover 만(과한 bounce ❌).
function StatLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={`${label} 자세히 — 내 기록`}
      className="block rounded-[var(--radius-lg)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint-500)] focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}

export function StatsGrid() {
  const s = useGameState();
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      <StatLink href={`${ROUTES.me}#streak`} label="스트릭">
        <StatCard Icon={Flame} label="스트릭" value={s.streakDays} suffix="일" />
      </StatLink>
      <StatLink href={`${ROUTES.me}#hp`} label="기억 HP">
        <StatCard Icon={Brain} label="기억 HP" value={s.memoryHp} suffix={`/ 5`}>
          <HpDots hp={s.memoryHp} />
        </StatCard>
      </StatLink>
      <StatLink href={`${ROUTES.me}#study-time`} label="순공시간">
        <StatCard Icon={Clock} label="순공시간" value={s.todayMinutes} suffix="분" />
      </StatLink>
      <StatLink href={`${ROUTES.me}#rank`} label="오늘 XP">
        <StatCard Icon={Zap} label="오늘 XP" value={s.todayXp} suffix="XP" />
      </StatLink>
    </div>
  );
}
