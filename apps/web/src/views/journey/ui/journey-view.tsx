"use client";

import Link from "next/link";
import { useGameState } from "@/entities/user-game-state";
import { useJourneyMap, type ForgettingRisk } from "@/features/journey-map";
import { Mascot } from "@/shared/ui/mascot";
import type { UserRank } from "@/shared/contracts";
import {
  rankAccent,
  rankAccentBg,
  rankIsIridescent,
  RANK_LEGEND_GRADIENT,
} from "@/entities/game/lib/rank-color";
import { ROUTES } from "@/shared/config/routes";
import { Trophy, Check, Star, RotateCw } from "lucide-react";
import {
  ForgettingMap,
  SAMPLE_NODES,
  type MapNode,
  type MapTone,
} from "./forgetting-map";

/**
 * 순공냅스 (/journey) — SOO-128-naps 프로토타입 1:1 화면.
 *
 * 3블록: ① 나의 순공 여정(등급 6단 스테퍼) ② 망각맵(뇌 모양 리텐션 시각화)
 * ③ 선택 개념 패널. 등급/XP는 useGameState, 채움·노드·개념은 useJourneyMap 실데이터.
 * 옛 뉴럴맵(widgets/journey-neural-map) 미사용 — 프로토타입 망각맵으로 교체(SOO-134 후속).
 */

// 누적 XP 임계값 — 게임성_기획_구조.md §6-1 SSoT 6단.
const RANKS: { name: UserRank; minXp: number }[] = [
  { name: "순공입문", minXp: 0 },
  { name: "순공러", minXp: 500 },
  { name: "순공대장", minXp: 1500 },
  { name: "순공도사", minXp: 3500 },
  { name: "순공마왕", minXp: 7000 },
  { name: "순공전설", minXp: 12000 },
];

function computeTier(xp: number) {
  let idx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) {
      idx = i;
      break;
    }
  }
  const current = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  const span = next ? next.minXp - current.minXp : 1;
  const earned = xp - current.minXp;
  const progressPct = next ? Math.min(100, Math.round((earned / span) * 100)) : 100;
  const remaining = next ? next.minXp - xp : 0;
  return { current, next, idx, progressPct, remaining };
}

const RISK_TO_TONE: Record<ForgettingRisk, MapTone> = {
  low: "safe",
  medium: "mid",
  high: "high",
};

export function JourneyView() {
  const s = useGameState();
  const xp = s.totalXp;
  const { current, next, idx, progressPct, remaining } = computeTier(xp);
  const { map } = useJourneyMap();

  // 망각맵 채움 % = 생생도(mastery 평균). 데이터 없으면 대표값.
  const fillPct = map ? Math.round(map.summary.vividness * 100) : 62;

  // 노드: 실데이터 hotspots를 뇌 좌표에 주입(라벨·위험도), 없으면 대표 샘플.
  const nodes: MapNode[] =
    map && map.hotspots.length > 0
      ? SAMPLE_NODES.map((pos, i) => {
          const h = map.hotspots[i];
          if (!h) return pos;
          return {
            ...pos,
            label: h.topic_name ?? h.unit_name ?? pos.label,
            tone: RISK_TO_TONE[h.forgetting_risk],
          };
        })
      : SAMPLE_NODES;

  // 선택 개념 패널 — 가장 흐려지는 개념(top hotspot) 또는 대표값.
  const top = map?.hotspots?.[0];
  const conceptName = top?.topic_name ?? top?.unit_name ?? "수학 · 수열 점화식";
  const masteryPct = top ? Math.round(top.mastery * 100) : 68;
  const conceptTone: MapTone = top ? RISK_TO_TONE[top.forgetting_risk] : "safe";

  const pillStyle =
    conceptTone === "high"
      ? { background: "var(--color-risk-high)", color: "var(--color-text-strong)" }
      : conceptTone === "mid"
        ? { background: "var(--color-risk-mid)", color: "var(--color-mint-900)" }
        : { background: "var(--color-mint-100)", color: "var(--color-mint-900)" };
  const pillLabel =
    conceptTone === "high" ? "위험" : conceptTone === "mid" ? "불안정" : "안정권 직전";

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* ── 헤더 ── */}
      <header className="flex items-center gap-3 px-5 pb-2 pt-6 lg:px-7">
        <Mascot mood="cheer" size="md" />
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--color-text-strong)] lg:text-2xl">
            순공냅스
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-default)]">
            내 기억이 자라는 지도 — 회독할수록 또렷해져요
          </p>
        </div>
      </header>

      {/* ── 본문: 웹 2칼럼(망각맵 | 여정+개념), 모바일 스택 ── */}
      <div className="grid grid-cols-1 gap-4 px-4 pb-7 lg:grid-cols-[1.12fr_0.88fr] lg:px-7">
        {/* 망각맵 — 웹 좌측 큰 칼럼 / 모바일 여정 다음 */}
        <div className="order-2 lg:order-1 lg:row-span-2">
          <ForgettingMap nodes={nodes} fillPct={fillPct} />
        </div>

        {/* 나의 순공 여정 — 웹 우상단 / 모바일 최상단 */}
        <section className="order-1 lg:order-2 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between px-[18px] pt-4">
            <h2 className="text-base font-extrabold tracking-tight">나의 순공 여정</h2>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              누적 XP 기반 6단계
            </span>
          </div>
          <div className="px-[18px] pb-[18px] pt-3.5">
            {/* 현재 등급 */}
            <div className="flex items-center gap-3.5">
              {/* 현재 등급 emblem — 등급색(SOO-159). 하위=차분·브랜드 계열 → 상위=희소.
                  최고 등급(순공전설)만 iridescent 그라데이션. accent-on-tint 로 대비 확보. */}
              <div
                className="grid size-16 flex-none place-items-center rounded-full"
                style={{
                  background: rankIsIridescent(current.name)
                    ? RANK_LEGEND_GRADIENT
                    : rankAccentBg(current.name),
                  boxShadow: `inset 0 0 0 2px ${rankAccent(current.name)}`,
                }}
              >
                <Trophy
                  size={32}
                  color={
                    rankIsIridescent(current.name)
                      ? "var(--color-text-strong)"
                      : rankAccent(current.name)
                  }
                  strokeWidth={1.6}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[var(--color-text-muted)]">
                  현재 등급
                </div>
                <div className="text-[22px] font-extrabold tracking-tight text-[var(--color-mint-900)]">
                  {current.name}
                </div>
                <div className="mt-0.5 text-[12.5px] text-[var(--color-text-default)]">
                  <b className="text-[var(--color-text-strong)]">
                    {xp.toLocaleString()}
                  </b>{" "}
                  XP
                  {next && (
                    <>
                      {" · 다음 "}
                      <b className="text-[var(--color-text-strong)]">{next.name}</b>
                      {`까지 ${remaining.toLocaleString()} XP`}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* XP 진행바 */}
            <div className="mt-3 h-2.5 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-mint-100)]">
              <div
                className="h-full rounded-[var(--radius-pill)]"
                style={{
                  width: `${progressPct}%`,
                  background: rankAccent(current.name),
                }}
              />
            </div>

            {/* 6단 스테퍼 */}
            <ol className="relative mt-10 flex items-start justify-between gap-0.5">
              <span
                aria-hidden="true"
                className="absolute left-[8%] right-[8%] top-[21px] z-0 h-[3px] rounded bg-[var(--color-border-default)]"
              />
              {RANKS.map((r, i) => {
                const done = i < idx;
                const cur = i === idx;
                const last = i === RANKS.length - 1;
                return (
                  <li
                    key={r.name}
                    className="relative z-[1] flex min-w-0 flex-1 flex-col items-center gap-1.5"
                  >
                    {cur && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-pill)] bg-[var(--color-mint-700)] px-2 py-[3px] text-[9px] font-extrabold text-white shadow-[0_2px_5px_rgba(46,125,91,0.25)]">
                        지금 여기
                      </span>
                    )}
                    <span
                      className="grid size-[42px] place-items-center rounded-full border-[3px] text-[15px] font-extrabold"
                      style={
                        done
                          ? {
                              background: "var(--color-mint-300)",
                              borderColor: "var(--color-mint-500)",
                              color: "var(--color-mint-900)",
                            }
                          : cur
                            ? {
                                background: "var(--color-mint-700)",
                                borderColor: "var(--color-mint-900)",
                                color: "#FFFFFF",
                                boxShadow: "0 0 0 5px var(--color-mint-100)",
                              }
                            : {
                                background: "#FFFFFF",
                                borderColor: last
                                  ? "var(--color-xp)"
                                  : "var(--color-border-default)",
                                color: "var(--color-text-muted)",
                              }
                      }
                    >
                      {done ? (
                        <Check size={18} color="var(--color-mint-900)" strokeWidth={2.5} />
                      ) : last ? (
                        <Star size={17} color="var(--color-xp)" strokeWidth={2} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span
                      className="text-center text-[10px] font-bold leading-tight"
                      style={{
                        color: cur
                          ? "var(--color-mint-900)"
                          : done
                            ? "var(--color-text-default)"
                            : "var(--color-text-muted)",
                      }}
                    >
                      {r.name}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* 선택 개념 패널 — 웹 우하단 / 모바일 최하단 */}
        <section className="order-3 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-white p-[18px] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-2.5">
            <span className="text-[15px] font-extrabold">{conceptName}</span>
            <span
              className="rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] font-extrabold"
              style={pillStyle}
            >
              {pillLabel}
            </span>
          </div>
          <div className="mt-2 text-[12.5px] text-[var(--color-text-default)]">
            숙련도 <b>{masteryPct}</b> / 100
            {top?.last_reviewed_at ? " · 회독 기록 반영" : " · 다음 회독 권장 오늘"}
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)]">
            <div
              className="h-full rounded-[var(--radius-pill)] bg-[var(--color-mint-500)]"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[9.5px] font-semibold text-[var(--color-text-muted)]">
            <span>위험</span>
            <span>불안정</span>
            <span>안정권</span>
            <span>장기기억</span>
          </div>
          <Link
            href={ROUTES.today}
            className="mt-4 inline-flex min-h-[44px] w-fit items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-primary-cta)] px-[22px] py-[11px] text-sm font-bold text-white"
          >
            <RotateCw size={17} color="#FFFFFF" strokeWidth={2} />이 개념 회독하기
          </Link>
        </section>
      </div>

      <p className="px-4 pb-5 text-center text-[11.5px] text-[var(--color-text-muted)]">
        앱·웹 같은 데이터·같은 순공이 · 등급(6단)·숙련(4단) 수치는 게임성 SSoT 고정
      </p>
    </div>
  );
}
