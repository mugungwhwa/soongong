"use client";
import { Card } from "@/shared/ui/card";
import { Mascot } from "@/shared/ui/mascot";
import { useReviewProgress } from "@/entities/review-progress";

export function ReviewMap() {
  const { currentDay, totalDays, nextRewardXp } = useReviewProgress();
  const percent = Math.round((currentDay / totalDays) * 100);

  return (
    <Card className="p-5 shadow-[var(--shadow-card)] border-[var(--color-border-default)] bg-[image:var(--gradient-quest-map)]">
      <div className="flex items-center gap-4">
        <Mascot mood="cheer" size="lg" />
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-[var(--color-text-strong)]">
            회독지도에서 안내해드릴게요
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            오늘 {currentDay}일째 — {totalDays}일 완주까지 {totalDays - currentDay}일
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-mint-500)] transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[var(--color-mint-700)] whitespace-nowrap">
              +{nextRewardXp} XP
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
