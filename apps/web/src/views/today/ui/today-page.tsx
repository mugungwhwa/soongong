import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { TierJourneyHero } from "@/widgets/tier-journey-hero";
import { FeatureGrid } from "@/widgets/feature-grid";
import { StatsGrid } from "@/widgets/stats-grid";
import { QuestList } from "@/widgets/quest-list";
import { ReviewMap } from "@/widgets/review-map";
import { SubjectProgress } from "@/widgets/subject-progress";
import { ForgettingTop3 } from "@/widgets/forgetting-top3";
import { NudgeBanner, NotificationBell, NudgeProvider } from "@/widgets/nudge-banner";
import { TodayGreeting } from "./today-greeting";
import { CameraHero } from "./camera-hero";
import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";
import { Brain, PartyPopper } from "lucide-react";

/**
 * 오늘 화면 (홈 대시보드).
 *
 * SOO-121 — SOO-97 목업 감각으로 정합: 심플리시티(과밀 덜고 핵심만)·명확함
 * (여백·타이포 위계)·최소 모션. 핵심 행동(자료 흡수)을 페이지 선두로 올리고,
 * 게임화 상태(등급·스탯)는 차분한 컨텍스트 밴드로 후퇴시킨다.
 *
 * 위계: 인사 → (넛지) → 인테이크 히어로(핵심) → 내 상태 → 오늘의 회독 → 바로가기 → 보조.
 * 섹션 간 넉넉한 수직 리듬(space-y-8/10)으로 밀도를 낮춰 "과밀" 해소.
 */
export function TodayPage({
  isFirstEntry = false,
  userName,
}: {
  isFirstEntry?: boolean;
  userName?: string;
}) {
  return (
    <div className="mx-auto max-w-[1440px] space-y-8 p-4 lg:space-y-10 lg:p-8">
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

      {/* NudgeProvider: useNudgeTrigger를 1회만 실행 — NudgeBanner/NotificationBell/QuestList가 context로 소비 */}
      <NudgeProvider>
        {/* 1. 인사 + 항시 액션 — 순공이 cheer + "오늘 회독 N개 남았어요" + 날짜 (SOO-128 .greet) */}
        <header className="flex items-start justify-between gap-3">
          <TodayGreeting userName={userName} />
          {/* 순공냅스(시그니처) + 알림. 모바일에선 사이드바가 숨으므로 여기가 상시 진입점 (SOO-90). */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={ROUTES.journey}
              aria-label="순공냅스 — 뉴럴 망각맵"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-mint-300)] bg-[var(--color-mint-50)] transition-colors hover:bg-[var(--color-mint-100)]"
            >
              <Brain
                size={16}
                strokeWidth={1.5}
                color="var(--color-mint-700)"
                fill="none"
                aria-hidden="true"
              />
            </Link>
            <NotificationBell />
          </div>
        </header>

        <NudgeBanner />

        {/* 2. 핵심 한 가지 — 카메라=메인 히어로 액션(촬영하기는 업로드 시트 재사용) */}
        <CameraHero />

        {/* 3. 내 상태 — 등급 strip + 스탯 4박스(차분한 컨텍스트). design-review §2-2 */}
        <section aria-label="내 상태" className="space-y-3">
          <TierJourneyHero />
          <StatsGrid />
        </section>

        {/* 4. 오늘의 회독 — 매일의 핵심 콘텐츠를 명확히 노출 */}
        <section id="today-quests" aria-label="오늘의 회독" className="space-y-3 scroll-mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            오늘의 회독
          </h2>
          <QuestList />
        </section>

        {/* 5. 보조 바로가기 */}
        <FeatureGrid />

        {/* 6. 하단 — 회독맵 / 과목별 진행 · 약점 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <ReviewMap />
          </div>
          <aside className="space-y-4">
            <SubjectProgress />
            <ForgettingTop3 />
          </aside>
        </div>
      </NudgeProvider>
    </div>
  );
}
