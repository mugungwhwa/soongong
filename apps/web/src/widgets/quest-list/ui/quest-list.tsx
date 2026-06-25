"use client";
import Link from "next/link";
import { useTodayQuests } from "@/entities/quest";
import { useNudgeContext } from "@/shared/lib/nudge-context";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { ROUTES } from "@/shared/config/routes";
import { QuestCard } from "./quest-card";

export function QuestList() {
  const { quests, loading, error } = useTodayQuests();
  const { active: nudgeActive, reason: nudgeReason, count: nudgeCount } = useNudgeContext();

  if (loading) {
    return (
      <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
        퀘스트 불러오는 중…
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="py-4 text-center text-sm text-[var(--color-risk-high)]">
        퀘스트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  if (quests.length === 0) {
    if (nudgeActive) {
      return (
        <div className="flex flex-col items-center gap-3 py-6">
          <MascotReaction mood="nudge" size="lg" reason={nudgeReason ?? undefined} />
          <p className="text-sm font-bold text-[var(--color-risk-high)]">
            까먹기 직전이에요!
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {nudgeReason ? `${nudgeReason} · ` : ""}복습 대기 {nudgeCount}개
          </p>
        </div>
      );
    }
    return (
      <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">
        오늘의 퀘스트가 없습니다. 문제를 업로드해 보세요!
      </p>
    );
  }

  // 완료 진행도: Quest 계약엔 완료 카운트가 없어 mock 유지(데이터 배선은 후속).
  // 진행 카드가 비지 않도록 보수적으로 절반 미만을 완료로 가정.
  const total = quests.length;
  const done = Math.floor(total / 2);
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const firstQuestId = quests[0]?.questId;

  return (
    <div className="flex flex-col gap-2.5">
      {/* due 진행 카드 — 오늘 회독 전체 진행을 한눈에 (프로토타입 .due) */}
      <div className="flex items-center gap-3.5 rounded-[var(--radius-lg)] bg-[var(--color-mint-700)] px-4 py-4 text-[var(--color-text-inverse)] shadow-[var(--shadow-card)]">
        <div className="min-w-0 flex-1">
          <b className="text-base font-extrabold">
            오늘 회독 {total}개 · {done}개 완료
          </b>
          <div className="mt-2 h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[rgba(255,255,255,0.22)]">
            <i
              className="block h-full rounded-[var(--radius-pill)] bg-white"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        {firstQuestId && (
          <Link
            href={ROUTES.play(firstQuestId)}
            className="shrink-0 rounded-[var(--radius-pill)] bg-white px-4 py-2.5 text-sm font-extrabold text-[var(--color-mint-900)]"
          >
            이어서
          </Link>
        )}
      </div>

      {quests.map((q, i) => (
        <QuestCard key={q.questId} quest={q} index={i} />
      ))}
    </div>
  );
}
