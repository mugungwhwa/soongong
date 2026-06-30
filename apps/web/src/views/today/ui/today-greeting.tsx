"use client";
import { useTodayQuests } from "@/entities/quest";

/** 6월 24일 식 한국어 월/일. */
function formatKoreanDate(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/**
 * 인사 블록 — SOO-144 정합(SOO-128 프로토타입 .greet 후속).
 *
 * 마스코트는 제거한다: 한 화면에 순공이가 인사·넛지·카메라로 3연속 노출되던 과노출을
 * 해소하고(Mike 요구), 홈 마스코트 노출은 메인 히어로(CameraHero)에서 유지한다.
 * "안녕하세요" 익명 인사도 제거(Mike: "안녕하세요 없어도됨") — 이름이 있으면 호명만 남긴다.
 * 헤드라인/서브카피는 break-keep + overflow-wrap:break-word로 어절 경계에서만 줄바꿈한다.
 */
export function TodayGreeting({ userName }: { userName?: string }) {
  const { quests, loading } = useTodayQuests();
  const remaining = loading ? null : quests.length;
  const prefix = userName ? `${userName}님, ` : "";
  const headline =
    remaining === null
      ? `${prefix}오늘의 회독을 불러오는 중이에요`
      : remaining > 0
        ? `${prefix}오늘 회독 ${remaining}개 남았어요`
        : `${prefix}오늘 회독을 다 마쳤어요`;

  return (
    <div className="min-w-0">
      <div className="break-keep text-lg font-extrabold tracking-tight text-[var(--color-text-strong)] [overflow-wrap:break-word] lg:text-2xl">
        {headline}
      </div>
      <div className="mt-1 break-keep text-sm text-[var(--color-text-default)] [overflow-wrap:break-word]">
        까먹기 직전인 개념부터 같이 만나봐요 · {formatKoreanDate(new Date())}
      </div>
    </div>
  );
}
