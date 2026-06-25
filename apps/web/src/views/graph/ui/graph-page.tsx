"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Mascot } from "@/shared/ui/mascot";
import { useGameState } from "@/entities/user-game-state";
import {
  MOCK_PERIOD_STATS,
  MOCK_ACCURACY,
  MOCK_DEFENSE,
  MOCK_LONGEST_STREAK,
  type StatsPeriod,
  type DefenseLevel,
} from "@/shared/mocks/study-stats";

// 망각방어 막대 색 — design-review: 데사처드 위험도(원색 금지). 토큰만 사용.
const DEFENSE_FILL: Record<DefenseLevel, string> = {
  ok: "bg-[var(--color-mint-500)]",
  warn: "bg-[var(--color-risk-mid)]",
  risk: "bg-[var(--color-risk-high)]",
};

function StatBox({
  label,
  children,
  sub,
}: {
  label: string;
  children: ReactNode;
  sub: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-3 shadow-[var(--shadow-card)] flex flex-col gap-1">
      <p className="text-[11px] font-semibold text-[var(--color-text-muted)]">
        {label}
      </p>
      <div className="text-2xl font-extrabold leading-none text-[var(--color-text-strong)]">
        {children}
      </div>
      <p className="text-[11px] text-[var(--color-text-muted)]">{sub}</p>
    </div>
  );
}

/** 기억 HP — 0~5 정수 dot (백분율·하트 금지, 게임화 SSoT 잠긴 값). */
function HpDots({ hp }: { hp: number }) {
  return (
    <div
      className="flex gap-1"
      role="meter"
      aria-valuenow={hp}
      aria-valuemin={0}
      aria-valuemax={5}
      aria-label={`기억 HP ${hp}/5`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`w-3 h-3 rounded-full border-2 ${
            i < hp
              ? "bg-[var(--color-mint-500)] border-[var(--color-mint-700)]"
              : "bg-[var(--color-bg-sunken)] border-[var(--color-border-strong)]"
          }`}
        />
      ))}
    </div>
  );
}

function GraphCard({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <span className="text-sm font-bold text-[var(--color-text-strong)]">
          {title}
        </span>
        <span className="text-[11px] text-[var(--color-text-muted)]">{meta}</span>
      </div>
      {children}
    </div>
  );
}

export function GraphPage() {
  const game = useGameState();
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const [mounted, setMounted] = useState(false);

  // 마운트 후 한 박자 뒤 채움 애니메이션 트리거 (transition으로 막대/링이 자라남).
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const stats = MOCK_PERIOD_STATS[period];
  const maxBar = Math.max(...stats.bars.map((b) => b.value));
  const peak = stats.bars.reduce((a, b) => (b.value > a.value ? b : a), stats.bars[0]);

  // 정답률 ring 기하 (r=44 → 둘레 ≈ 276.5)
  const R = 44;
  const C = 2 * Math.PI * R;
  const ringOffset = mounted ? C * (1 - MOCK_ACCURACY.pct / 100) : C;

  return (
    <div className="p-4 lg:p-6 max-w-[680px] mx-auto">
      {/* 헤더 */}
      <header className="flex items-center gap-3 mb-5">
        <Mascot mood="cheer" size="md" />
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text-strong)]">그래프</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            회독이 만든 변화를 숫자로. 잘하고 있는지 한눈에 확인해요.
          </p>
        </div>
      </header>

      {/* 기간 토글 */}
      <div
        className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)] p-1 mb-4"
        role="tablist"
        aria-label="통계 기간"
      >
        {(["week", "month"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-[var(--radius-pill)] transition-colors ${
              period === p
                ? "bg-[var(--color-bg-elevated)] text-[var(--color-mint-700)] shadow-[var(--shadow-card)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-default)]"
            }`}
          >
            {p === "week" ? "주간" : "월간"}
          </button>
        ))}
      </div>

      {/* 요약 4박스 */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4" aria-label="통계 요약">
        <StatBox label={stats.xpLabel} sub={stats.delta}>
          {stats.xp.toLocaleString()}
        </StatBox>
        <StatBox label="정답률" sub="개념 적중 ↑">
          {MOCK_ACCURACY.pct}
          <span className="text-base">%</span>
        </StatBox>
        <StatBox label="기억 HP" sub={`5점 만점 중 ${game.memoryHp}점`}>
          <HpDots hp={game.memoryHp} />
        </StatBox>
        <StatBox label="연속 순공" sub={`최장 ${MOCK_LONGEST_STREAK}일`}>
          {game.streakDays}
          <span className="text-base">일</span>
        </StatBox>
      </section>

      {/* XP 막대 + 정답률 ring (모바일 1열 / 데스크톱 2열) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <GraphCard title={stats.barTitle} meta={stats.barSum}>
          <div className="flex items-end justify-between gap-2 h-32" aria-hidden="true">
            {stats.bars.map((b) => {
              const isPeak = b.label === peak.label;
              return (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full flex items-end h-full">
                    <div
                      className={`w-full rounded-t-[var(--radius-sm)] transition-[height] duration-700 ease-out ${
                        isPeak ? "bg-[var(--color-mint-700)]" : "bg-[var(--color-mint-300)]"
                      }`}
                      style={{ height: mounted ? `${Math.round((b.value / maxBar) * 100)}%` : "0%" }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{b.label}</span>
                </div>
              );
            })}
          </div>
        </GraphCard>

        <GraphCard title="개념 정답률" meta="최근 7일">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0" style={{ width: 104, height: 104 }}>
              <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90">
                <circle
                  cx="52"
                  cy="52"
                  r={R}
                  fill="none"
                  strokeWidth="11"
                  stroke="var(--color-bg-sunken)"
                />
                <circle
                  cx="52"
                  cy="52"
                  r={R}
                  fill="none"
                  strokeWidth="11"
                  strokeLinecap="round"
                  stroke="var(--color-mint-500)"
                  strokeDasharray={C.toFixed(1)}
                  strokeDashoffset={ringOffset.toFixed(1)}
                  className="transition-[stroke-dashoffset] duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-[var(--color-text-strong)]">
                  {MOCK_ACCURACY.pct}%
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">정답률</span>
              </div>
            </div>
            <dl className="flex-1 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">맞힌 개념</dt>
                <dd className="font-bold text-[var(--color-text-strong)]">{MOCK_ACCURACY.matched}개</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">다시 볼 개념</dt>
                <dd className="font-bold text-[var(--color-text-strong)]">{MOCK_ACCURACY.review}개</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">이번 주 신규</dt>
                <dd className="font-bold text-[var(--color-text-strong)]">{MOCK_ACCURACY.fresh}개</dd>
              </div>
            </dl>
          </div>
        </GraphCard>
      </div>

      {/* 망각방어 */}
      <GraphCard title="망각방어" meta="제때 회독으로 지킨 개념">
        <ul className="space-y-2.5">
          {MOCK_DEFENSE.map((row) => (
            <li key={row.label} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-sm text-[var(--color-text-default)]">
                {row.label}
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-[var(--color-bg-sunken)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${DEFENSE_FILL[row.level]}`}
                  style={{ width: mounted ? `${row.pct}%` : "0%" }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-semibold text-[var(--color-text-strong)]">
                {row.pct}%
              </span>
            </li>
          ))}
        </ul>
      </GraphCard>

      <p className="mt-4 text-center text-[11px] text-[var(--color-text-muted)]">
        통계는 현재 예시 데이터예요 · 학습 엔진 연결 시 실제 기록으로 채워져요
      </p>
    </div>
  );
}
