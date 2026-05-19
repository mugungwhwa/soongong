import { Mascot } from "@/shared/ui/mascot";
import { StatsGrid } from "@/widgets/stats-grid/ui/stats-grid";
import { QuestList } from "@/widgets/quest-list/ui/quest-list";
import { ReviewMap } from "@/widgets/review-map/ui/review-map";
import { SubjectProgress } from "@/widgets/subject-progress/ui/subject-progress";
import { ForgettingTop3 } from "@/widgets/forgetting-top3/ui/forgetting-top3";
import { UploadTrigger } from "@/features/upload-source/ui/upload-trigger";

export function TodayPage() {
  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <header className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Mascot mood="cheer" size="md" />
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-strong)]">
              안녕하세요, 김순공님!
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              오늘 회독 3개로 망각을 막아볼까요?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="알림"
            className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] hover:bg-[var(--color-mint-50)] transition flex items-center justify-center"
          >
            🔔
          </button>
          <UploadTrigger />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">
          <StatsGrid />

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
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
