import { Card } from "@/shared/ui/card";
import { Mascot } from "@/shared/ui/mascot";

const CURRENT_STEP = 8;
const TOTAL_STEPS = 30;
const NEXT_REWARD_XP = 100;

export function ReviewMap() {
  const percent = Math.round((CURRENT_STEP / TOTAL_STEPS) * 100);

  return (
    <Card className="p-5 shadow-[var(--shadow-card)] border-[var(--color-border-default)] bg-[image:var(--gradient-quest-map)]">
      <div className="flex items-center gap-4">
        <Mascot mood="cheer" size="lg" />
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-[var(--color-text-strong)]">
            회독지도에서 안내해드릴게요
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            오늘 {CURRENT_STEP}일째 — 30일 완주까지 {TOTAL_STEPS - CURRENT_STEP}일
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-mint-500)] transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[var(--color-mint-700)] whitespace-nowrap">
              +{NEXT_REWARD_XP} XP
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
