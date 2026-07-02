import type { ReactNode } from "react";
import Link from "next/link";
import { Flame, CheckSquare, ShieldCheck, Medal, AlertCircle } from "lucide-react";
import { createClient } from "@/shared/lib/supabase/server";
import { getGameState, getRecentBadges } from "@/entities/game";
import { Mascot } from "@/shared/ui/mascot";
import { ROUTES } from "@/shared/config/routes";
import type { GameState, GameBadge, BadgeRarity } from "@/entities/game";

// ── 데이터 타입 ────────────────────────────────────────────────────────────────

type TodayProgress = { completed: number; total: number };
type ForgettingInfo = { dangerCount: number; nextDday: number | null };

type DashboardData =
  | { ok: true; gameState: GameState; badges: GameBadge[]; today: TodayProgress; forgetting: ForgettingInfo }
  | { ok: false; error: string };

// ── 서버 데이터 페치 ────────────────────────────────────────────────────────────

async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

  const [gameStateResult, badgesResult, todayQuestsResult, forgettingResult] =
    await Promise.allSettled([
      getGameState(userId),
      getRecentBadges(userId, 2),
      supabase
        .from("review_quests")
        .select("status")
        .eq("user_id", userId)
        .in("quest_mode", ["today", "wrong_recovery"])
        .eq("due_date", todayStr),
      supabase
        .from("review_quests")
        .select("due_date")
        .eq("user_id", userId)
        .eq("quest_mode", "memory_defense")
        .eq("status", "pending")
        .gte("due_date", todayStr)
        .order("due_date", { ascending: true })
        .limit(20),
    ]);

  if (gameStateResult.status === "rejected" || gameStateResult.value === null) {
    return { ok: false, error: "게임 상태를 불러오지 못했어요" };
  }

  const gameState = gameStateResult.value;
  const badges = badgesResult.status === "fulfilled" ? badgesResult.value : [];

  const todayRows =
    todayQuestsResult.status === "fulfilled" && !todayQuestsResult.value.error
      ? todayQuestsResult.value.data ?? []
      : [];
  const today: TodayProgress = {
    total: todayRows.length,
    completed: todayRows.filter((r: { status: string }) => r.status === "completed").length,
  };

  const forgettingRows =
    forgettingResult.status === "fulfilled" && !forgettingResult.value.error
      ? forgettingResult.value.data ?? []
      : [];
  const dangerCount = forgettingRows.length;
  let nextDday: number | null = null;
  if (forgettingRows.length > 0) {
    const earliest = forgettingRows[0].due_date as string;
    const diff = Math.ceil(
      (new Date(earliest).getTime() - new Date(todayStr).getTime()) / 86_400_000,
    );
    nextDday = Math.max(0, diff);
  }

  return { ok: true, gameState, badges, today, forgetting: { dangerCount, nextDday } };
}

// ── 배지 희귀도 라벨 / 스타일 ────────────────────────────────────────────────

const RARITY_LABEL: Record<BadgeRarity, string> = {
  common: "일반",
  rare: "희귀",
  epic: "영웅",
  legendary: "전설",
};

const RARITY_CLS: Record<BadgeRarity, string> = {
  common: "bg-[var(--color-mint-100)] text-[var(--color-mint-900)]",
  rare: "bg-[var(--color-mint-50)] text-[var(--color-mint-700)] border border-[var(--color-mint-300)]",
  epic: "bg-[var(--color-epic-bg)] text-[var(--color-epic-text)]",
  legendary: "bg-[var(--color-xp-soft)] text-[var(--color-text-on-warm)] border border-[var(--color-xp)]",
};

// ── 서브 컴포넌트 ───────────────────────────────────────────────────────────────

function CardShell({
  children,
  danger = false,
  achieved = false,
}: {
  children: ReactNode;
  danger?: boolean;
  achieved?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-card)] flex flex-col gap-2",
        achieved
          ? "border-[var(--color-mint-500)] bg-[var(--color-mint-50)]"
          : danger
            ? "border-[var(--color-risk-high)] bg-[var(--color-bg-elevated)]"
            : "border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
      {children}
    </p>
  );
}

function CardValue({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <p
      className={`text-2xl font-extrabold leading-none ${muted ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-strong)]"}`}
    >
      {children}
    </p>
  );
}

function CardSub({ children, danger = false, achieved = false }: { children: ReactNode; danger?: boolean; achieved?: boolean }) {
  return (
    <p
      className={`text-xs leading-snug ${danger ? "font-semibold text-[var(--color-risk-high)]" : achieved ? "font-semibold text-[var(--color-mint-700)]" : "text-[var(--color-text-muted)]"}`}
    >
      {children}
    </p>
  );
}

// ── 카드 1: 스트릭 ─────────────────────────────────────────────────────────────

function StreakCard({ streak }: { streak: number }) {
  const isActive = streak > 0;
  return (
    <CardShell achieved={isActive}>
      <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-mint-100)]">
        <Flame size={18} strokeWidth={1.5} color="var(--color-mint-700)" aria-hidden />
      </div>
      <CardLabel>스트릭</CardLabel>
      <CardValue>{streak}일</CardValue>
      <CardSub achieved={isActive}>
        {isActive ? "연속 학습 중 🔥" : "첫 도전, 오늘부터 시작!"}
      </CardSub>
    </CardShell>
  );
}

// ── 카드 2: 오늘 진척 ──────────────────────────────────────────────────────────

function TodayCard({ today }: { today: TodayProgress }) {
  const allDone = today.total > 0 && today.completed === today.total;
  const pct = today.total > 0 ? Math.round((today.completed / today.total) * 100) : 0;

  return (
    <CardShell achieved={allDone}>
      <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-mint-100)]">
        <CheckSquare size={18} strokeWidth={1.5} color="var(--color-mint-700)" aria-hidden />
      </div>
      <CardLabel>오늘 진척</CardLabel>
      {today.total === 0 ? (
        <>
          <CardValue muted>—</CardValue>
          <CardSub>오늘 배정된 퀘스트가 없어요</CardSub>
        </>
      ) : (
        <>
          <CardValue>
            <span className="text-[var(--color-mint-700)]">{today.completed}</span>
            <span className="text-base font-semibold text-[var(--color-text-muted)]">
              {" "}/ {today.total}
            </span>
          </CardValue>
          <div
            className="h-1.5 rounded-full bg-[var(--color-bg-sunken)] overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-all ${allDone ? "bg-[var(--color-mint-700)]" : "bg-[var(--color-mint-500)]"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <CardSub achieved={allDone}>
            {allDone ? "오늘 목표 달성! 🎉" : `남은 ${today.total - today.completed}개 · 도전하기 →`}
          </CardSub>
        </>
      )}
    </CardShell>
  );
}

// ── 카드 3: 기억 HP ────────────────────────────────────────────────────────────

function HpCard({
  hp,
  forgetting,
}: {
  hp: number;
  forgetting: ForgettingInfo;
}) {
  const isDanger = hp <= 2;
  const hpDotColor = (idx: number) => {
    if (idx >= hp) return "bg-[var(--color-bg-sunken)] border-[var(--color-border-strong)]";
    if (hp >= 4) return "bg-[var(--color-mint-500)] border-[var(--color-mint-700)]";
    if (hp === 3) return "bg-[var(--color-risk-mid)] border-[var(--color-risk-mid)]";
    return "bg-[var(--color-risk-high)] border-[var(--color-risk-high)]";
  };

  return (
    <CardShell danger={isDanger}>
      <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-mint-100)]">
        <ShieldCheck size={18} strokeWidth={1.5} color={isDanger ? "var(--color-risk-high)" : "var(--color-mint-700)"} aria-hidden />
      </div>
      <CardLabel>기억 HP</CardLabel>
      <CardValue>
        <span className={isDanger ? "text-[var(--color-risk-high)]" : "text-[var(--color-text-strong)]"}>{hp}</span>
        <span className="text-sm font-medium text-[var(--color-text-muted)]">/5</span>
      </CardValue>
      <div
        className="flex gap-1"
        role="meter"
        aria-valuenow={hp}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-label={`기억 HP ${hp}/5`}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border-2 ${hpDotColor(i)} ${hp === 1 && i === 0 ? "animate-pulse" : ""}`}
          />
        ))}
      </div>
      <CardSub danger={isDanger}>
        {forgetting.dangerCount === 0
          ? "아직 까먹은 항목이 없어요 👍"
          : forgetting.nextDday !== null
            ? `까먹기 직전 ${forgetting.dangerCount}개 · D-${forgetting.nextDday} 복습`
            : `까먹기 직전 ${forgetting.dangerCount}개`}
      </CardSub>
    </CardShell>
  );
}

// ── 카드 4: 등급/뱃지 ──────────────────────────────────────────────────────────

function RankCard({ rank, xp, badges }: { rank: string; xp: number; badges: GameBadge[] }) {
  return (
    <CardShell>
      <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center bg-[var(--color-xp-soft)]">
        <Medal size={18} strokeWidth={1.5} color="var(--color-text-on-warm)" aria-hidden />
      </div>
      <CardLabel>등급</CardLabel>
      <CardValue>{rank}</CardValue>
      {badges.length > 0 ? (
        <ul className="flex flex-wrap gap-1" aria-label="최근 획득 뱃지">
          {badges.map((b) => (
            <li
              key={b.badge_id}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${RARITY_CLS[b.rarity]}`}
              title={RARITY_LABEL[b.rarity]}
            >
              {b.badge_key} · {RARITY_LABEL[b.rarity]}
            </li>
          ))}
        </ul>
      ) : (
        <CardSub>아직 뱃지가 없어요</CardSub>
      )}
      <CardSub>총 {xp.toLocaleString()} XP</CardSub>
    </CardShell>
  );
}

// ── 페이지 (RSC) ───────────────────────────────────────────────────────────────

export async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const data = await fetchDashboardData(user?.id ?? "");

  if (!data.ok) {
    return (
      <div className="p-4 lg:p-6 max-w-[640px] mx-auto">
        <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-risk-high)] bg-[var(--color-bg-elevated)] p-4 text-sm text-[var(--color-risk-high)]">
          <AlertCircle size={16} strokeWidth={1.5} aria-hidden />
          {data.error}
        </div>
      </div>
    );
  }

  const { gameState, badges, today, forgetting } = data;

  return (
    <div className="p-4 lg:p-6 max-w-[1440px] mx-auto">
      {/* 헤더 */}
      <header className="flex items-center gap-3 mb-6">
        <Mascot mood="cheer" size="md" />
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text-strong)]">내 학습 현황</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
      </header>

      {/* 카드: 모바일 2×2 → 데스크톱 4열 한 줄 (design-lock §3-1 유동 컬럼 / design-review §2-2 stats 4박스) */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="학습 현황 요약">
        <StreakCard streak={gameState.streak_days} />
        <TodayCard today={today} />
        <HpCard hp={gameState.memory_hp} forgetting={forgetting} />
        <RankCard rank={gameState.rank} xp={gameState.total_xp} badges={badges} />
      </section>

      {/* 빠른 액션 */}
      <Link
        href={ROUTES.today}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] bg-[var(--color-mint-500)] px-6 py-4 text-base font-bold text-[var(--color-text-inverse)] shadow-[var(--shadow-elevated)] transition-colors hover:bg-[var(--color-mint-700)] sm:mx-auto sm:w-auto sm:px-12"
        aria-label="오늘 퀘스트 시작하기"
      >
        오늘 퀘스트 시작하기
      </Link>
    </div>
  );
}
