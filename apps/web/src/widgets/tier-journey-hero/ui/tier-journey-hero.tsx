"use client";
import { useGameState } from "@/entities/user-game-state";
import { Mascot } from "@/shared/ui/mascot";
import type { UserRank } from "@/shared/contracts";

// §6-1 — 게임성_기획_구조.md v1.0 SSoT 누적 XP 임계값
const RANKS: { name: UserRank; minXp: number }[] = [
  { name: "순공입문", minXp: 0 },
  { name: "순공러", minXp: 500 },
  { name: "순공대장", minXp: 1500 },
  { name: "순공도사", minXp: 3500 },
  { name: "순공마왕", minXp: 7000 },
  { name: "순공전설", minXp: 12000 },
];

function computeTierInfo(xp: number) {
  const currentIdx = [...RANKS]
    .reverse()
    .findIndex((r) => xp >= r.minXp);
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
    };
  }

  const next = RANKS[idx + 1];
  const span = next.minXp - current.minXp;
  const earned = xp - current.minXp;
  const progressPct = Math.min(100, Math.round((earned / span) * 100));
  const remaining = next.minXp - xp;

  return { current, next, remaining, progressPct, isMax: false };
}

export function TierJourneyHero() {
  const s = useGameState();
  const xp = s.totalXp;
  const { current, next, remaining, progressPct, isMax } = computeTierInfo(xp);

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
        boxShadow: "var(--shadow-card)",
        padding: "var(--space-5)",
        marginBottom: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      {/* 상단 행: 마스코트 + 현재 등급 카드 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        <Mascot mood="cheer" size="md" aria-hidden="true" />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* "지금 여기" 핀 뱃지 */}
          <span
            aria-label="현재 위치"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-1)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-mint-700)",
              background: "var(--color-mint-50)",
              border: "1px solid var(--color-mint-300)",
              borderRadius: "var(--radius-pill)",
              padding: "2px var(--space-2)",
              marginBottom: "var(--space-1)",
            }}
          >
            <span aria-hidden="true">📍</span> 지금 여기
          </span>

          {/* 등급명 */}
          <p
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "var(--color-text-strong)",
              lineHeight: 1.2,
            }}
          >
            {current.name}
          </p>

          {/* 누적 XP */}
          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              color: "var(--color-text-muted)",
              marginTop: "2px",
            }}
          >
            누적 XP{" "}
            <strong
              style={{
                color: "var(--color-mint-700)",
                fontWeight: 700,
              }}
            >
              {xp.toLocaleString()}
            </strong>
          </p>
        </div>

        {/* CTA 버튼 — 데스크톱에서 우측 배치 */}
        <button
          onClick={handleCta}
          aria-label="오늘의 퀘스트 영역으로 이동"
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-1)",
            background: "var(--color-mint-900)",
            color: "var(--color-text-inverse)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-4)",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "opacity var(--duration-fast) var(--ease-out-soft)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
          }
        >
          오늘 회독 시작하기 →
        </button>
      </div>

      {/* 다음 등급 진행 영역 */}
      {isMax ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            textAlign: "center",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--color-mint-700)",
            padding: "var(--space-2) 0",
          }}
        >
          최고 등급 달성 — 순공전설 🏆
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
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
                fontSize: "0.78rem",
                color: "var(--color-text-muted)",
              }}
            >
              다음:{" "}
              <strong
                style={{
                  color: "var(--color-text-default)",
                  fontWeight: 700,
                }}
              >
                {next!.name}
              </strong>
              까지{" "}
              <strong
                style={{
                  color: "var(--color-mint-700)",
                  fontWeight: 700,
                }}
              >
                {remaining.toLocaleString()} XP
              </strong>{" "}
              남음
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-mint-500)",
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
              height: "8px",
              borderRadius: "var(--radius-pill)",
              background: "var(--color-mint-100)",
              overflow: "hidden",
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
    </section>
  );
}
