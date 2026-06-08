import Link from "next/link";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { RiskBadge } from "@/entities/quest";
import { ROUTES } from "@/shared/config/routes";
import type { Quest } from "@/shared/contracts";

const NUMBER_GLYPH = ["①", "②", "③", "④", "⑤"];

export function QuestCard({ quest, index }: { quest: Quest; index: number }) {
  return (
    <Card className="p-4 shadow-[var(--shadow-card)] border-[var(--color-border-default)]">
      <div className="flex items-center gap-3">
        <div className="text-2xl text-[var(--color-mint-700)] font-bold">
          {NUMBER_GLYPH[index] ?? `${index + 1}`}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span>{quest.subject}</span>
            <span>·</span>
            <span>{quest.unit}</span>
            <RiskBadge level={quest.riskLevel} />
          </div>
          <div className="text-base font-semibold text-[var(--color-text-strong)] truncate">
            {quest.topic}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
            형식: <b className="text-[var(--color-text-default)]">{quest.questFormat}</b>
            <span className="ml-3 text-[var(--color-mint-700)] font-semibold">+{quest.rewardXp} XP</span>
          </div>
        </div>
        <Link href={ROUTES.play(quest.questId)}>
          <Button className="bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]" size="sm">
            풀기
          </Button>
        </Link>
      </div>
    </Card>
  );
}
