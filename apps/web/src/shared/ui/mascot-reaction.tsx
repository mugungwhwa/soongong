import Image from "next/image";
import { cn } from "@/shared/lib/cn";

/**
 * 순공이(듀공) 표정 반응 컴포넌트 — 마스코트 락(순공이 단일).
 *
 * mood → 반신 표정 누끼 자산(`public/mascot/main-half-*-alpha.png`, SOO-80) 매핑.
 * 자산 정본·라벨은 스타일가이드 board 9(`/styleguide`)에서 시각 확인.
 *
 * - `down`(시무룩, 오답+loss)은 전용 표정 대신 `comeon` 자산을 겸용한다(Mike 확정).
 *   `nudge`(이리와)와 같은 이미지를 쓰되 mood 의미·라벨은 분리 — 전용 시무룩 표정은 추후 필요 시 분리.
 * - 게임 이벤트(스트릭/XP/기억HP)·망각위험 → mood 방출 트리거는 Phase 2b 후속
 *   (게임화 리드 / 회독·망각 리드). 본 컴포넌트는 "검증 측" 렌더만 담당.
 */
export type MascotMoodReaction = "idle" | "cheer" | "nudge" | "praise" | "down";

const sizeMap = { sm: 32, md: 48, lg: 72, xl: 120 } as const;

const mascotDir = "/mascot";

/**
 * mood → 자산 파일명. 5종 mood 모두 실자산 보유(두 번째 SSoT 금지: 경로는 여기 한 곳).
 * `down`은 `comeon` 자산 겸용(Mike 확정) — 전용 시무룩 표정 도입 시 이 줄만 교체하면 전 화면 자동 전환.
 */
const moodAsset: Record<MascotMoodReaction, string> = {
  idle: "main-half-alpha.png", // 기본
  cheer: "main-half-cheer-alpha.png", // 응원
  nudge: "main-half-comeon-alpha.png", // 이리와(조름) — 망각위험·복습 due
  praise: "main-half-good-alpha.png", // 칭찬 — 결과·완료
  down: "main-half-comeon-alpha.png", // 시무룩(오답+loss) — comeon 겸용(Mike 확정)
};

const moodLabel: Record<MascotMoodReaction, string> = {
  idle: "기본",
  cheer: "응원",
  nudge: "이리와",
  praise: "칭찬",
  down: "시무룩",
};

export function MascotReaction({
  mood = "idle",
  size = "md",
  reason,
  className,
  priority,
}: {
  mood?: MascotMoodReaction;
  size?: keyof typeof sizeMap;
  /** 노출 맥락(접근성 라벨에 표기). 예: "3일 미회독". */
  reason?: string;
  className?: string;
  priority?: boolean;
}) {
  const px = sizeMap[size];
  const file = moodAsset[mood];
  const label = `순공이 ${moodLabel[mood]}${reason ? ` — ${reason}` : ""}`;

  return (
    <Image
      src={`${mascotDir}/${file}`}
      alt={label}
      width={px}
      height={px}
      priority={priority ?? size === "xl"}
      className={cn("object-contain", className)}
      style={{ width: px, height: px }}
    />
  );
}
