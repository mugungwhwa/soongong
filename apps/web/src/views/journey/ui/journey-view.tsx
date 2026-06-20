"use client";
import Link from "next/link";
import { useGameState } from "@/entities/user-game-state";
import { JourneyNeuralMap } from "@/widgets/journey-neural-map";
import { Mascot } from "@/shared/ui/mascot";
import type { UserRank } from "@/shared/contracts";
import { ROUTES } from "@/shared/config/routes";
import {
  Trophy,
  Lock,
  Check,
  ChevronRight,
  Compass,
  ArrowUp,
} from "lucide-react";

// §6-1 — 게임성_기획_구조.md v1.0 SSoT 누적 XP 임계값
const RANKS: { name: UserRank; minXp: number; emoji: string; desc: string }[] =
  [
    { name: "순공입문", minXp: 0, emoji: "🧭", desc: "첫 회독을 시작한 탐험가" },
    {
      name: "순공러",
      minXp: 500,
      emoji: "🌊",
      desc: "파도처럼 꾸준히 밀고 나가는 학습자",
    },
    {
      name: "순공대장",
      minXp: 1500,
      emoji: "⚓",
      desc: "흔들리지 않는 닻 같은 집중력",
    },
    {
      name: "순공도사",
      minXp: 3500,
      emoji: "🐬",
      desc: "깊이 잠수하는 전략적 학습자",
    },
    {
      name: "순공마왕",
      minXp: 7000,
      emoji: "🦈",
      desc: "압도적인 집중력의 정점",
    },
    {
      name: "순공전설",
      minXp: 12000,
      emoji: "🏆",
      desc: "학습의 경지에 오른 전설",
    },
  ];

function computeTierInfo(xp: number) {
  const currentIdx = [...RANKS].reverse().findIndex((r) => xp >= r.minXp);
  const idx = RANKS.length - 1 - currentIdx;
  const current = RANKS[idx];
  const isMax = idx === RANKS.length - 1;

  if (isMax) {
    return {
      current,
      next: null,
      remaining: 0,
      progressPct: 100,
      isMax: true,
      currentIdx: idx,
    };
  }

  const next = RANKS[idx + 1];
  const span = next.minXp - current.minXp;
  const earned = xp - current.minXp;
  const progressPct = Math.min(100, Math.round((earned / span) * 100));
  const remaining = next.minXp - xp;

  return {
    current,
    next,
    remaining,
    progressPct,
    isMax: false,
    currentIdx: idx,
  };
}

type CardState = "passed" | "current" | "locked";

function RankCard({
  rank,
  state,
  xp,
}: {
  rank: (typeof RANKS)[number];
  state: CardState;
  xp: number;
}) {
  const isPassed = state === "passed";
  const isCurrent = state === "current";
  const isLocked = state === "locked";

  const nextRankIdx = RANKS.findIndex((r) => r.name === rank.name) + 1;
  const nextRank = RANKS[nextRankIdx] ?? null;
  const xpMax = nextRank ? nextRank.minXp : rank.minXp;
  const xpMin = rank.minXp;

  const xpRange =
    nextRank ? `XP ${xpMin.toLocaleString()} – ${(xpMax - 1).toLocaleString()}` : `XP ${xpMin.toLocaleString()}+`;

  let statusChip: string;
  if (isPassed) statusChip = "✓ 통과";
  else if (isCurrent) {
    const achieved = xp - xpMin;
    statusChip = `✓ ${achieved.toLocaleString()} 달성 · 진행 중`;
  } else {
    const needed = xpMin - xp;
    statusChip = `${needed.toLocaleString()} XP 더`;
  }

  if (isCurrent) {
    // 현재 등급 — 큰 CTA 카드
    return (
      <div
        style={{
          background: "var(--color-bg-elevated)",
          borderRadius: "var(--radius-lg)",
          border: "2.5px solid var(--color-mint-500)",
          boxShadow:
            "0 0 0 5px color-mix(in srgb, var(--color-mint-500) 12%, transparent), 0 6px 24px color-mix(in srgb, var(--color-mint-900) 16%, transparent)",
          padding: "var(--space-4)",
          marginBottom: "var(--space-3)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* 상단 행: 엠블럼 + 정보 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--space-3)",
            marginBottom: "var(--space-3)",
          }}
        >
          {/* 엠블럼 */}
          <div
            style={{
              width: 52,
              height: 52,
              background:
                "linear-gradient(135deg, var(--color-mint-100), var(--color-mint-200))",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              flexShrink: 0,
              position: "relative",
            }}
            aria-hidden="true"
          >
            <span>{rank.emoji}</span>
            {/* "지금 여기" 핀 */}
            <span
              style={{
                position: "absolute",
                top: -7,
                right: -7,
                background: "var(--color-mint-500)",
                color: "var(--color-text-inverse)",
                fontSize: "0.5rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                padding: "2px 6px",
                borderRadius: "var(--radius-pill)",
                whiteSpace: "nowrap",
                boxShadow:
                  "0 2px 6px color-mix(in srgb, var(--color-mint-500) 40%, transparent)",
              }}
              aria-label="현재 위치"
            >
              지금 여기
            </span>
          </div>

          {/* 정보 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: "1.0625rem",
                fontWeight: 900,
                color: "var(--color-mint-900)",
                letterSpacing: "-0.02em",
                marginBottom: "var(--space-1)",
              }}
            >
              {rank.name}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.6875rem",
                color: "var(--color-text-muted)",
                fontWeight: 500,
                lineHeight: 1.4,
                marginBottom: "var(--space-2)",
              }}
            >
              {rank.desc}
            </p>
            {/* 칩 */}
            <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "var(--color-bg-sunken)",
                  color: "var(--color-mint-700)",
                  fontSize: "0.59375rem",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                {xpRange}
              </span>
              <span
                style={{
                  background:
                    "color-mix(in srgb, var(--color-mint-500) 10%, transparent)",
                  color: "var(--color-mint-700)",
                  fontSize: "0.59375rem",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                {statusChip}
              </span>
            </div>
          </div>
        </div>

        {/* CTA 버튼 */}
        <Link
          href={ROUTES.today}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            background: "var(--color-mint-900)",
            color: "var(--color-text-inverse)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-5)",
            fontSize: "0.9375rem",
            fontWeight: 800,
            letterSpacing: "-0.01em",
            textDecoration: "none",
            transition:
              "opacity var(--duration-fast) var(--ease-out-soft), transform var(--duration-fast) var(--ease-out-soft)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.88";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          aria-label="오늘 회독 시작하기, 오늘 홈으로 이동"
        >
          오늘 회독 시작하기
          <ChevronRight
            size={16}
            strokeWidth={2.5}
            color="var(--color-text-inverse)"
            fill="none"
            aria-hidden="true"
          />
        </Link>
      </div>
    );
  }

  // 미니 카드 (통과 / 잠금)
  return (
    <div
      style={{
        background: isPassed ? "var(--color-bg-sunken)" : "var(--color-bg-elevated)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-3) var(--space-4)",
        marginBottom: "var(--space-2)",
        position: "relative",
        zIndex: 1,
        boxShadow:
          "0 2px 10px color-mix(in srgb, var(--color-mint-900) 8%, transparent)",
        border: "1.5px solid transparent",
        opacity: isLocked ? 0.55 : isPassed ? 0.75 : 1,
      }}
      aria-label={`${rank.name} — ${isPassed ? "통과" : "잠금"}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        {/* 엠블럼 */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-sunken)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1875rem",
            flexShrink: 0,
            position: "relative",
          }}
          aria-hidden="true"
        >
          <span>{rank.emoji}</span>
          {/* 배지 */}
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2px solid var(--color-bg-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.5rem",
              color: "var(--color-text-inverse)",
              background: isPassed
                ? "var(--color-mint-700)"
                : "var(--color-text-muted)",
            }}
            aria-hidden="true"
          >
            {isPassed ? (
              <Check size={9} strokeWidth={2.5} color="white" fill="none" />
            ) : (
              <Lock size={8} strokeWidth={2} color="white" fill="none" />
            )}
          </span>
        </div>

        {/* 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.8125rem",
              fontWeight: 800,
              color: isPassed
                ? "var(--color-text-muted)"
                : "var(--color-mint-900)",
              letterSpacing: "-0.01em",
            }}
          >
            {rank.name}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "0.625rem",
              color: "var(--color-text-muted)",
              fontWeight: 500,
            }}
          >
            {rank.desc}
          </p>
          {/* 칩 */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-1)",
              marginTop: "var(--space-1)",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                background: "var(--color-bg-sunken)",
                color: "var(--color-text-muted)",
                fontSize: "0.5625rem",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "var(--radius-pill)",
              }}
            >
              {xpRange}
            </span>
            <span
              style={{
                background:
                  "color-mix(in srgb, var(--color-mint-900) 6%, transparent)",
                color: "var(--color-text-muted)",
                fontSize: "0.5625rem",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "var(--radius-pill)",
              }}
            >
              {isPassed ? "✓ 통과" : statusChip}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpacerDot() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 22,
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--color-bg-sunken)",
          border: "2px solid var(--color-mint-500)",
          opacity: 0.4,
        }}
      />
    </div>
  );
}

export function JourneyView() {
  const s = useGameState();
  const xp = s.totalXp;
  const { current, next, remaining, progressPct, isMax, currentIdx } =
    computeTierInfo(xp);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        // 웹 데스크톱에서 단일 컬럼 여정이 전폭으로 늘어지지 않도록 중앙 정렬.
        // 다른 단일 컬럼 화면(캘린더·오답·회독)의 max-w-2xl 컨벤션과 통일.
        width: "100%",
        maxWidth: "42rem",
        marginInline: "auto",
      }}
    >
      {/* ── 여정 헤더 (딥 민트 그라데이션) ── */}
      <div
        style={{
          background:
            "linear-gradient(160deg, var(--color-mint-900) 0%, var(--color-mint-700) 100%)",
          padding: "var(--space-4) var(--space-5) var(--space-5)",
          color: "var(--color-text-inverse)",
          flexShrink: 0,
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
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -20,
            left: 20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background:
              "color-mix(in srgb, var(--color-mint-300) 14%, transparent)",
            pointerEvents: "none",
          }}
        />

        {/* 헤더 타이틀 행 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-4)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: "rgba(255,255,255,0.15)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <Compass
                size={15}
                strokeWidth={1.5}
                color="var(--color-text-inverse)"
                fill="none"
              />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  opacity: 0.9,
                  lineHeight: 1.2,
                }}
              >
                순공냅스
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.625rem",
                  opacity: 0.55,
                  marginTop: 1,
                }}
              >
                내 위치 · 다음 목표
              </p>
            </div>
          </div>
          {/* 마스코트 — 순공이(듀공 정본). 등급 신호는 카드·배너의 이모지가 전담. */}
          <div
            style={{
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
              animation: "journey-bob 3.2s ease-in-out infinite",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Mascot mood="cheer" size="sm" />
          </div>
        </div>

        {/* 현재 등급 행 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--space-3)",
            marginBottom: "var(--space-3)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: "0.5625rem",
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                opacity: 0.6,
                marginBottom: "var(--space-1)",
              }}
            >
              현재 등급
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {current.name}
            </p>
            <p
              style={{
                margin: "var(--space-1) 0 0",
                fontSize: "0.625rem",
                opacity: 0.65,
                fontWeight: 500,
              }}
            >
              누적 XP {xp.toLocaleString()} · 스트릭 {s.streakDays}일
            </p>
          </div>
        </div>

        {/* 진행바 섹션 */}
        <div
          style={{
            background: "rgba(0,0,0,0.18)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {isMax ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              <Trophy
                size={14}
                strokeWidth={1.5}
                color="var(--color-xp)"
                fill="none"
                aria-hidden="true"
              />
              최고 등급 달성 — 순공전설
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-2)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    opacity: 0.85,
                  }}
                >
                  {current.name}
                </span>
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    opacity: 0.55,
                  }}
                >
                  {next!.name} →
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
                  width: "100%",
                  height: 6,
                  background: "rgba(255,255,255,0.18)",
                  borderRadius: "var(--radius-pill)",
                  overflow: "visible",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPct}%`,
                    background:
                      "linear-gradient(90deg, var(--color-mint-500), var(--color-mint-300))",
                    borderRadius: "var(--radius-pill)",
                    position: "relative",
                    transition: `width var(--duration-slow) var(--ease-out-soft)`,
                  }}
                >
                  {/* 진행 닷 */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      right: -1,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 10,
                      height: 10,
                      background: "var(--color-text-inverse)",
                      borderRadius: "50%",
                      boxShadow:
                        "0 0 0 3px var(--color-mint-500)",
                    }}
                  />
                </div>
              </div>
              <p
                style={{
                  margin: "var(--space-2) 0 0",
                  fontSize: "0.5625rem",
                  opacity: 0.55,
                  textAlign: "right",
                }}
              >
                {remaining.toLocaleString()} XP 더 → 자동 승급
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── 망각 뉴럴 맵 (SOO-51, 저니탭 전용) ── */}
      <div
        style={{
          padding: "var(--space-5) var(--space-4) var(--space-2)",
          background: "var(--color-background)",
        }}
      >
        <JourneyNeuralMap />
      </div>

      {/* ── 카드 스택 영역 ── */}
      <div
        style={{
          flex: 1,
          padding: "0 var(--space-4) var(--space-6)",
          background: "var(--color-bg-default)",
          position: "relative",
        }}
      >
        {/* 수직 연결선 */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            transform: "translateX(-50%)",
            background:
              "repeating-linear-gradient(to bottom, var(--color-mint-500) 0, var(--color-mint-500) 6px, transparent 6px, transparent 14px)",
            opacity: 0.15,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* 다음 목표 배너 */}
        {!isMax && next && (
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--color-mint-50), var(--color-bg-sunken))",
              border: "1.5px solid var(--color-mint-300)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3) var(--space-4)",
              margin: "var(--space-4) 0 var(--space-2)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              position: "relative",
              zIndex: 1,
            }}
            aria-label={`다음 목표: ${next.name}`}
          >
            <span style={{ fontSize: "1.375rem", lineHeight: 1 }} aria-hidden="true">
              {next.emoji}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.5625rem",
                  fontWeight: 700,
                  color: "var(--color-mint-700)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 2,
                }}
              >
                다음 목표
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  fontWeight: 800,
                  color: "var(--color-mint-900)",
                  letterSpacing: "-0.01em",
                }}
              >
                {next.name}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.625rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 500,
                }}
              >
                XP {remaining.toLocaleString()} 남음
              </p>
            </div>
            <div
              style={{
                marginLeft: "auto",
                width: 24,
                height: 24,
                background: "var(--color-mint-500)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <ArrowUp
                size={12}
                strokeWidth={2.5}
                color="var(--color-text-inverse)"
                fill="none"
              />
            </div>
          </div>
        )}

        {/* 6등급 카드 스택 — 현재 먼저, 통과, 미래 순 */}
        <div
          style={{ marginTop: next ? "var(--space-1)" : "var(--space-4)" }}
          role="list"
          aria-label="순공 여정 6단계"
        >
          {/* 현재 등급 카드 */}
          <div role="listitem">
            <RankCard
              rank={RANKS[currentIdx]}
              state="current"
              xp={xp}
            />
          </div>

          <SpacerDot />

          {/* 통과한 등급들 (현재보다 낮은 순서 역순) */}
          {currentIdx > 0 &&
            [...Array(currentIdx)]
              .map((_, i) => currentIdx - 1 - i)
              .map((i) => (
                <div role="listitem" key={RANKS[i].name}>
                  <RankCard rank={RANKS[i]} state="passed" xp={xp} />
                  {i > 0 && <SpacerDot />}
                </div>
              ))}

          {/* 미래 등급들 */}
          {currentIdx < RANKS.length - 1 && (
            <>
              {currentIdx > 0 && <SpacerDot />}
              {RANKS.slice(currentIdx + 1).map((rank, i) => (
                <div role="listitem" key={rank.name}>
                  {i > 0 && <SpacerDot />}
                  <RankCard rank={rank} state="locked" xp={xp} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* bob 애니메이션 */}
      <style>{`
        @keyframes journey-bob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
