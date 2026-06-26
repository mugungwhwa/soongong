"use client";
import Link from "next/link";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { Card } from "@/shared/ui/card";
import { StatCard } from "@/shared/ui/stat-card";
import { TierJourneyHero } from "@/widgets/tier-journey-hero";
import { useGameState } from "@/entities/user-game-state";
import { useForgettingTop } from "@/entities/forgetting";
import { useWrongNoteReview } from "@/entities/wrong-note-review";
import { useTodayQuests } from "@/entities/quest";
import { ROUTES } from "@/shared/config/routes";
import { BadgeCollection } from "./badge-collection";
import {
  Flame,
  Brain,
  Clock,
  Zap,
  Trophy,
  Lock,
  ChevronRight,
  BookOpen,
  RotateCcw,
} from "lucide-react";

/** 기억HP 0–5 정수 점 (하트·백분율 금지, design-review §2-2). */
function HpDots({ hp, size = 14 }: { hp: number; size?: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(hp)));
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: size,
            height: size,
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

// 위험도 pill 색 — entities/quest RiskBadge 와 동일 bg/fg 페어(데사처드 + 대비 보정).
// mid 는 밝은 warm 배경이라 어두운 text-on-warm 을 써야 읽힌다.
function riskStyle(risk: number): { bg: string; fg: string } {
  if (risk >= 70)
    return { bg: "var(--color-risk-high)", fg: "var(--color-text-inverse)" };
  if (risk >= 40)
    return { bg: "var(--color-risk-mid)", fg: "var(--color-text-on-warm)" };
  return { bg: "var(--color-risk-low)", fg: "var(--color-text-inverse)" };
}

function SectionCard({
  id,
  title,
  icon,
  children,
  action,
}: {
  id?: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card
      id={id}
      className="scroll-mt-20 p-5 shadow-[var(--shadow-card)]"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-[var(--color-text-strong)]">
          <span className="text-[var(--color-mint-700)]">{icon}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

/** 활동 한눈 요약 박스 (무엇을·얼마나). */
/**
 * 내 기록 (내 정보) — "내가 뭘 얼마나 했고, 게임 상태가 어떤지" 한눈에.
 *
 * 데이터는 전부 실데이터(useGameState/useForgettingTop/useWrongNoteReview/useTodayQuests/
 * useEarnedBadges) — 목업 없음. 게임 룰/값은 SSoT(game-rules.ts)·표시·연결만 한다(새 기획 X).
 * 게임성 강도: 본 화면은 게임 화면이 아니라 차분한 기록/프로필 surface — 카드 기반,
 * 네온/파티클 없음(Light Study Garden). 홈 stats 카드 클릭 → 각 섹션 anchor 로 진입.
 */
export function MePage() {
  const s = useGameState();
  const forgetting = useForgettingTop();
  const wrong = useWrongNoteReview();
  const { quests } = useTodayQuests();

  return (
    <div className="mx-auto max-w-[960px] space-y-6 p-4 lg:p-8">
      {/* 헤더 — 순공이 동반자 톤 */}
      <header className="flex items-center gap-4">
        <MascotReaction mood="cheer" size="lg" reason="내 기록 보기" />
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-[var(--color-text-strong)]">
            내 기록
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            지금까지의 회독 여정과 기억 상태를 한눈에 모았어요.
          </p>
        </div>
      </header>

      {/* 활동 한눈 — 무엇을·얼마나 */}
      <section aria-label="활동 요약" className="grid grid-cols-2 gap-[var(--stat-card-gap)] sm:grid-cols-4 items-stretch">
        <StatCard icon={<BookOpen size={14} strokeWidth={1.5} />} label="오늘 회독" value={quests.length} suffix="개" />
        <StatCard icon={<RotateCcw size={14} strokeWidth={1.5} />} label="오답 회수" value={wrong.summary.reviewCount} suffix="개" />
        <StatCard icon={<Clock size={14} strokeWidth={1.5} />} label="순공시간" value={s.todayMinutes} suffix="분" />
        <StatCard icon={<Zap size={14} strokeWidth={1.5} />} label="누적 XP" value={s.totalXp.toLocaleString()} suffix="XP" />
      </section>

      {/* 등급 진행 — TierJourneyHero 재사용(→ /journey 여정) */}
      <SectionCard
        id="rank"
        title="등급 진행"
        icon={<Trophy size={18} strokeWidth={1.5} />}
        action={
          <Link
            href={ROUTES.journey}
            className="flex items-center gap-0.5 text-xs font-bold text-[var(--color-mint-700)] hover:underline"
          >
            여정 보기
            <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
          </Link>
        }
      >
        <TierJourneyHero />
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 스트릭 */}
        <SectionCard id="streak" title="스트릭" icon={<Flame size={18} strokeWidth={1.5} />}>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold leading-none text-[var(--color-text-strong)]">
              {s.streakDays}
            </span>
            <span className="pb-1 text-sm font-bold text-[var(--color-text-muted)]">
              일 연속
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            {s.streakDays > 0
              ? "오늘도 이어가고 있어요. 내일도 순공이가 기다릴게요."
              : "오늘 회독 하나로 새 스트릭을 시작해봐요."}
          </p>
        </SectionCard>

        {/* 순공시간 */}
        <SectionCard id="study-time" title="순공시간" icon={<Clock size={18} strokeWidth={1.5} />}>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold leading-none text-[var(--color-text-strong)]">
              {s.todayMinutes}
            </span>
            <span className="pb-1 text-sm font-bold text-[var(--color-text-muted)]">
              분 (오늘)
            </span>
          </div>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            오늘 집중한 순공 시간이에요. 조금씩 쌓아가요.
          </p>
        </SectionCard>
      </div>

      {/* 기억 HP — 전체 + 개념별 망각위험 */}
      <SectionCard id="hp" title="기억 HP" icon={<Brain size={18} strokeWidth={1.5} />}>
        <div className="flex items-center gap-3">
          <HpDots hp={s.memoryHp} size={18} />
          <span className="text-sm font-bold text-[var(--color-text-muted)]">
            {Math.max(0, Math.min(5, Math.round(s.memoryHp)))} / 5
          </span>
        </div>
        <p className="mt-3 mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          망각위험 높은 개념
        </p>
        {forgetting.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            지금은 망각위험이 높은 개념이 없어요. 잘 유지되고 있어요.
          </p>
        ) : (
          <ul className="space-y-2">
            {forgetting.map((item, i) => (
              <li
                key={`${item.topic}-${i}`}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[var(--color-text-strong)]">
                    {item.topic}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {item.subject}
                  </span>
                </span>
                {(() => {
                  const rs = riskStyle(item.risk);
                  return (
                    <span
                      className="shrink-0 rounded-[var(--radius-pill)] px-2 py-0.5 text-[11px] font-bold"
                      style={{ background: rs.bg, color: rs.fg }}
                    >
                      위험 {item.risk}
                    </span>
                  );
                })()}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={ROUTES.journey}
          className="mt-3 inline-flex items-center gap-0.5 text-xs font-bold text-[var(--color-mint-700)] hover:underline"
        >
          순공냅스에서 전체 보기
          <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
        </Link>
      </SectionCard>

      {/* 뱃지 컬렉션 */}
      <SectionCard id="badges" title="뱃지 컬렉션" icon={<Trophy size={18} strokeWidth={1.5} />}>
        <BadgeCollection />
      </SectionCard>

      {/* 순공리그 — MVP 1차 잠금 (게임화 SSoT §7) */}
      <SectionCard id="league" title="순공리그" icon={<Trophy size={18} strokeWidth={1.5} />}>
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-sunken)] px-4 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
            <Lock size={18} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-strong)]">
              곧 열려요
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              순공리그는 다음 업데이트에서 만나요.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 활동 기록 — 오늘 회독 / 오답 회수 */}
      <SectionCard
        id="activity"
        title="오늘 활동"
        icon={<BookOpen size={18} strokeWidth={1.5} />}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href={ROUTES.today}
            className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-4 py-3 transition-colors hover:border-[var(--color-mint-500)] hover:bg-[var(--color-mint-50)]"
          >
            <span>
              <span className="block text-xs font-bold text-[var(--color-text-muted)]">
                오늘의 회독
              </span>
              <span className="text-lg font-extrabold text-[var(--color-text-strong)]">
                {quests.length}개
              </span>
            </span>
            <ChevronRight size={18} strokeWidth={2} color="var(--color-mint-700)" aria-hidden="true" />
          </Link>
          <Link
            href={ROUTES.wrongNotes}
            className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-4 py-3 transition-colors hover:border-[var(--color-mint-500)] hover:bg-[var(--color-mint-50)]"
          >
            <span>
              <span className="block text-xs font-bold text-[var(--color-text-muted)]">
                오답 회수
              </span>
              <span className="text-lg font-extrabold text-[var(--color-text-strong)]">
                {wrong.summary.reviewCount}개 대기
              </span>
            </span>
            <ChevronRight size={18} strokeWidth={2} color="var(--color-mint-700)" aria-hidden="true" />
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
