import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { TierJourneyHero } from "@/widgets/tier-journey-hero";
import { FeatureGrid } from "@/widgets/feature-grid";
import { StatsGrid } from "@/widgets/stats-grid";
import { QuestList } from "@/widgets/quest-list";
import { ReviewMap } from "@/widgets/review-map";
import { SubjectProgress } from "@/widgets/subject-progress";
import { ForgettingTop3 } from "@/widgets/forgetting-top3";
import { IntakeHero } from "@/features/upload-source";
import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";
import { Bell, Brain, PartyPopper } from "lucide-react";

export function TodayPage({
  isFirstEntry = false,
  userName,
}: {
  isFirstEntry?: boolean;
  userName?: string;
}) {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 lg:p-8">
      {isFirstEntry && (
        <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-mint-300)] bg-[var(--color-mint-50)] p-4">
          <MascotReaction mood="praise" size="md" reason="첫 회독 준비" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-bold text-[var(--color-mint-700)]">
              회독 퀘스트가 준비됐어요!
              <PartyPopper
                size={16}
                strokeWidth={1.5}
                color="var(--color-mint-700)"
                fill="none"
                aria-hidden="true"
              />
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              아래 퀘스트를 풀고 첫 XP를 획득해봐요
            </p>
          </div>
        </div>
      )}

      {/* 1. 상단 상태 밴드 — 진도·등급·뇌(기억HP)·불(스트릭)을 한눈에 (SOO-81, Mike 구조 지시 2026-06-20) */}
      <section aria-label="내 상태" className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[var(--color-text-strong)] lg:text-2xl">
              {userName ? `안녕하세요, ${userName}님!` : "안녕하세요!"}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {isFirstEntry
                ? "순공이랑 첫 회독 퀘스트를 시작해볼까요?"
                : "오늘도 까먹기 전에 한 번 더, 순공이랑 같이 가요."}
            </p>
          </div>
          {/* 항시 노출 액션 — 순공냅스(시그니처) + 알림. 모바일에선 사이드바가 숨으므로 여기가 순공냅스 상시 진입점. */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={ROUTES.journey}
              aria-label="순공냅스 — 뉴럴 망각맵"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-mint-300)] bg-[var(--color-mint-50)] transition hover:bg-[var(--color-mint-100)]"
            >
              <Brain
                size={16}
                strokeWidth={1.5}
                color="var(--color-mint-700)"
                fill="none"
                aria-hidden="true"
              />
            </Link>
            <button
              aria-label="알림"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] transition hover:bg-[var(--color-mint-100)]"
            >
              <Bell
                size={16}
                strokeWidth={1.5}
                color="var(--color-text-muted)"
                fill="none"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
        <TierJourneyHero />
        <StatsGrid />
      </section>

      {/* 2. 중앙 대형 인테이크 히어로 — 핵심 행동(문제 사진 흡수) 승격 */}
      <IntakeHero />

      {/* 3. 보조 바로가기 */}
      <FeatureGrid />

      {/* 4. 하단 — 오늘의 회독 / 회독맵 / 약점 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:gap-6">
        <div className="min-w-0 space-y-4 lg:space-y-6">
          <section id="today-quests" className="space-y-3 scroll-mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              오늘의 회독 캠프
            </h2>
            <QuestList />
          </section>

          <ReviewMap />
        </div>

        <aside className="space-y-4">
          <SubjectProgress />
          <ForgettingTop3 />
        </aside>
      </div>
    </div>
  );
}
