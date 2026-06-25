"use client";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { useTodayQuests } from "@/entities/quest";

/** 6월 24일 식 한국어 월/일. */
function formatKoreanDate(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/**
 * 인사 블록 — SOO-128 프로토타입(.greet) 정합.
 * 순공이(cheer) + "{이름}님, 오늘 회독 N개 남았어요" + 동반자 톤 서브카피 + 오늘 날짜.
 */
export function TodayGreeting({ userName }: { userName?: string }) {
  const { quests, loading } = useTodayQuests();
  const remaining = loading ? null : quests.length;
  const who = userName ? `${userName}님` : "안녕하세요";
  const headline =
    remaining === null
      ? `${who}, 오늘의 회독을 불러오는 중이에요`
      : remaining > 0
        ? `${who}, 오늘 회독 ${remaining}개 남았어요`
        : `${who}, 오늘 회독을 다 마쳤어요`;

  return (
    <div className="flex items-center gap-3.5">
      <MascotReaction
        mood="cheer"
        size="lg"
        reason="오늘의 회독 인사"
        priority
        className="drop-shadow-[var(--shadow-elevated)]"
      />
      <div className="min-w-0">
        <div className="text-lg font-extrabold tracking-tight text-[var(--color-text-strong)] lg:text-2xl">
          {headline}
        </div>
        <div className="mt-1 text-sm text-[var(--color-text-default)]">
          까먹기 직전인 개념부터 같이 만나봐요 · {formatKoreanDate(new Date())}
        </div>
      </div>
    </div>
  );
}
