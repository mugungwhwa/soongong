"use client";
import { useGameState } from "@/entities/user-game-state";
import type { UserRank } from "@/shared/contracts";
import { Trophy, MapPin, Lock, Check, ChevronRight } from "lucide-react";

// §6-1 — 게임성_기획_구조.md v1.0 SSoT 누적 XP 임계값
const RANKS: { name: UserRank; minXp: number; emoji: string; desc: string }[] = [
  { name: "순공입문", minXp: 0,     emoji: "🧭", desc: "첫 회독을 시작한 탐험가" },
  { name: "순공러",   minXp: 500,   emoji: "🌊", desc: "파도처럼 꾸준히 밀고 나가는 학습자" },
  { name: "순공대장", minXp: 1500,  emoji: "⚓", desc: "흔들리지 않는 닻 같은 집중력" },
  { name: "순공도사", minXp: 3500,  emoji: "🐬", desc: "깊이 잠수하는 전략적 학습자" },
  { name: "순공마왕", minXp: 7000,  emoji: "🦈", desc: "압도적인 집중력의 정점" },
  { name: "순공전설", minXp: 12000, emoji: "🏆", desc: "학습의 경지에 오른 전설" },
];

function computeTierInfo(xp: number) {
  const currentIdx = [...RANKS]
    .reverse()
    .findIndex((r) => xp >= r.minXp);
  const idx = RANKS.length - 1 - currentIdx;
  const current = RANKS[idx];
  const isMax = idx === RANKS.length - 1;

  if (isMax) {
    return { current, next: null, remaining: 0, progressPct: 100, isMax: true, currentIdx: idx };
  }

  const next = RANKS[idx + 1];
  const span = next.minXp - current.minXp;
  const earned = xp - current.minXp;
  const progressPct = Math.min(100, Math.round((earned / span) * 100));
  const remaining = next.minXp - xp;

  return { current, next, remaining, progressPct, isMax: false, currentIdx: idx };
}

// 6단계 여정 미니 인디케이터 — 각 노드 상태
type NodeState = "passed" | "current" | "locked";

function JourneyNode({
  rank,
  state,
  isLast,
}: {
  rank: (typeof RANKS)[number];
  state: NodeState;
  isLast: boolean;
}) {
  const isPassed = state === "passed";
  const isCurrent = state === "current";

  const nodeBase: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--space-1)",
    flex: 1,
    position: "relative",
  };

  const dotSize = isCurrent ? 36 : 28;

  const dotStyle: React.CSSProperties = {
    width: dotSize,
    height: dotSize,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: `all var(--duration-mid) var(--ease-out-soft)`,
    ...(isPassed && {
      background: "var(--color-mint-500)",
      boxShadow: "none",
    }),
    ...(isCurrent && {
      background: "var(--color-mint-500)",
      boxShadow: "0 0 0 4px var(--color-mint-100)",
      border: "2px solid var(--color-mint-300)",
    }),
    ...(!isPassed && !isCurrent && {
      background: "var(--color-bg-sunken)",
      border: "1.5px solid var(--color-border-default)",
    }),
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.6rem",
    fontWeight: isCurrent ? 800 : 600,
    color: isCurrent
      ? "var(--color-mint-700)"
      : isPassed
      ? "var(--color-text-muted)"
      : "var(--color-text-muted)",
    opacity: state === "locked" ? 0.5 : 1,
    textAlign: "center",
    lineHeight: 1.3,
    maxWidth: 48,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  // 노드 사이 연결선 (마지막 제외)
  const connectorStyle: React.CSSProperties = {
    position: "absolute",
    top: dotSize / 2 - 1,
    left: "calc(50% + " + dotSize / 2 + "px)",
    right: "calc(-50% + " + dotSize / 2 + "px)",
    height: 2,
    background: isPassed
      ? "var(--color-mint-500)"
      : "var(--color-border-default)",
    opacity: isPassed ? 0.6 : 0.4,
    pointerEvents: "none",
  };

  return (
    <div style={nodeBase} aria-label={`${rank.name} ${state === "passed" ? "통과" : state === "current" ? "현재" : "잠금"}`}>
      {!isLast && <div style={connectorStyle} aria-hidden="true" />}
      <div style={dotStyle}>
        {isPassed && (
          <Check
            size={isCurrent ? 16 : 12}
            strokeWidth={2.5}
            color="white"
            fill="none"
          />
        )}
        {isCurrent && (
          <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">
            {rank.emoji}
          </span>
        )}
        {state === "locked" && (
          <Lock
            size={11}
            strokeWidth={1.5}
            color="var(--color-text-muted)"
            fill="none"
          />
        )}
      </div>
      <span style={labelStyle}>{rank.name}</span>
    </div>
  );
}

export function TierJourneyHero() {
  const s = useGameState();
  const xp = s.totalXp;
  const { current, next, remaining, progressPct, isMax, currentIdx } =
    computeTierInfo(xp);

  function handleCta() {
    const el = document.getElementById("today-quests");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section
      aria-label="티어 여정"
      style={{
        background: "var(--color-bg-elevated)",
        border: "1.5px solid var(--color-mint-300)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-elevated)",
        marginBottom: "var(--space-6)",
        overflow: "hidden",
      }}
    >
      {/* ── 상단 헤더 (딥 오션 그라데이션) ── */}
      <div
        style={{
          background:
            "linear-gradient(150deg, var(--color-mint-900) 0%, var(--color-mint-700) 100%)",
          padding: "var(--space-5) var(--space-5) var(--space-4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 원형 장식 */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -24,
            left: 24,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(42,184,208,0.12)",
            pointerEvents: "none",
          }}
        />

        {/* 현재 등급 행 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--space-3)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* 왼쪽: 핀 + 등급명 + XP */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* "지금 여기" 핀 뱃지 */}
            <span
              aria-label="현재 위치"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-1)",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--color-mint-300)",
                background: "rgba(42,184,208,0.18)",
                border: "1px solid rgba(42,184,208,0.35)",
                borderRadius: "var(--radius-pill)",
                padding: "2px var(--space-2)",
                marginBottom: "var(--space-2)",
              }}
            >
              <MapPin
                size={9}
                strokeWidth={2}
                color="var(--color-mint-300)"
                fill="none"
                aria-hidden="true"
              />
              지금 여기
            </span>

            {/* 등급명 */}
            <p
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "var(--color-text-inverse)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {current.name}
            </p>

            {/* 부제 */}
            <p
              style={{
                margin: "var(--space-1) 0 0",
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {current.desc}
            </p>

            {/* 누적 XP 칩 */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-1)",
                marginTop: "var(--space-2)",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.8)",
                background: "rgba(0,0,0,0.18)",
                borderRadius: "var(--radius-pill)",
                padding: "3px var(--space-3)",
              }}
            >
              <Trophy
                size={11}
                strokeWidth={1.5}
                color="var(--color-xp)"
                fill="none"
                aria-hidden="true"
              />
              누적 XP&nbsp;
              <strong style={{ color: "var(--color-xp)", fontWeight: 800 }}>
                {xp.toLocaleString()}
              </strong>
            </span>
          </div>

          {/* 오른쪽: 이모지 엠블럼 */}
          <div
            aria-hidden="true"
            style={{
              width: 56,
              height: 56,
              borderRadius: "var(--radius-md)",
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              lineHeight: 1,
              flexShrink: 0,
              backdropFilter: "blur(4px)",
            }}
          >
            {current.emoji}
          </div>
        </div>
      </div>

      {/* ── 다음 목표 + 진행바 ── */}
      <div
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-mint-100)",
        }}
      >
        {isMax ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--color-mint-700)",
            }}
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
          >
            {/* 레이블 행 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.4,
                }}
              >
                다음&nbsp;
                <strong
                  style={{ color: "var(--color-text-default)", fontWeight: 700 }}
                >
                  {next!.name}
                </strong>
                까지&nbsp;
                <strong
                  style={{ color: "var(--color-mint-700)", fontWeight: 700 }}
                >
                  {remaining.toLocaleString()} XP
                </strong>
                &nbsp;남음
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "var(--color-mint-500)",
                  letterSpacing: "0.02em",
                }}
              >
                {progressPct}%
              </span>
            </div>

            {/* 진행 바 */}
            <div
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${next!.name}까지 진행률 ${progressPct}%`}
              style={{
                height: 7,
                borderRadius: "var(--radius-pill)",
                background: "var(--color-mint-100)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--color-mint-500)",
                  transition: `width var(--duration-slow) var(--ease-out-soft)`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 6단계 여정 미니 인디케이터 ── */}
      <div
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-mint-100)",
        }}
      >
        <p
          style={{
            margin: "0 0 var(--space-3)",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          순공 여정 6단계
        </p>
        <div
          role="list"
          aria-label="티어 여정 단계"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0,
          }}
        >
          {RANKS.map((rank, i) => {
            const state: NodeState =
              i < currentIdx
                ? "passed"
                : i === currentIdx
                ? "current"
                : "locked";
            return (
              <JourneyNode
                key={rank.name}
                rank={rank}
                state={state}
                isLast={i === RANKS.length - 1}
              />
            );
          })}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: "var(--space-4) var(--space-5)" }}>
        <button
          onClick={handleCta}
          aria-label="오늘의 퀘스트 영역으로 이동"
          style={{
            width: "100%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            background: "var(--color-mint-900)",
            color: "var(--color-text-inverse)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-5)",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.01em",
            transition: `opacity var(--duration-fast) var(--ease-out-soft), transform var(--duration-fast) var(--ease-out-soft)`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(0)";
          }}
        >
          오늘 회독 시작하기
          <ChevronRight
            size={16}
            strokeWidth={2.5}
            color="var(--color-text-inverse)"
            fill="none"
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  );
}
