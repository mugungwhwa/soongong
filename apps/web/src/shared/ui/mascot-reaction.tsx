import Image from "next/image";
import { cn } from "@/shared/lib/cn";

/**
 * 순공이(듀공) 표정 반응 컴포넌트 — 마스코트 락(순공이 단일).
 *
 * mood → 반신 표정 누끼 자산(`public/mascot/main-half-*-alpha.png`, SOO-80) 매핑.
 * 자산 정본·라벨은 스타일가이드 board 9(`/styleguide`)에서 시각 확인.
 *
 * - `down`(시무룩)은 Mike 제작 예정 자산이라 현재 미존재 → idle 폴백 + 1회 경고.
 *   자산 도착 시 아래 moodAsset.down 경로만 채우면 전 화면 자동 전환(호출처 무수정).
 * - 게임 이벤트(스트릭/XP/기억HP)·망각위험 → mood 방출 트리거는 Phase 2b 후속
 *   (게임화 리드 / 회독·망각 리드). 본 컴포넌트는 "검증 측" 렌더만 담당.
 */
export type MascotMoodReaction = "idle" | "cheer" | "nudge" | "praise" | "down";

const sizeMap = { sm: 32, md: 48, lg: 72, xl: 120 } as const;

const mascotDir = "/mascot";

/**
 * mood → 자산 파일명. `null` = 자산 미존재(→ idle 폴백).
 * 자산이 들어오면 파일명을 채우는 것만으로 자동 전환된다(두 번째 SSoT 금지: 경로는 여기 한 곳).
 */
const moodAsset: Record<MascotMoodReaction, string | null> = {
  idle: "main-half-alpha.png", // 기본
  cheer: "main-half-cheer-alpha.png", // 응원
  nudge: "main-half-comeon-alpha.png", // 이리와(조름) — 망각위험·복습 due
  praise: "main-half-good-alpha.png", // 칭찬 — 결과·완료
  down: null, // 시무룩(오답+loss 통합) — Mike 제작 예정. 도착 전 idle 폴백.
};

const moodLabel: Record<MascotMoodReaction, string> = {
  idle: "기본",
  cheer: "응원",
  nudge: "이리와",
  praise: "칭찬",
  down: "시무룩",
};

// dev 환경에서 폴백 경고는 mood당 1회만(렌더 루프 스팸 방지).
const warned = new Set<MascotMoodReaction>();

export function MascotReaction({
  mood = "idle",
  size = "md",
  reason,
  className,
  priority,
}: {
  mood?: MascotMoodReaction;
  size?: keyof typeof sizeMap;
  /** 노출 맥락(접근성 라벨 + 폴백 경고에 표기). 예: "3일 미회독". */
  reason?: string;
  className?: string;
  priority?: boolean;
}) {
  const px = sizeMap[size];
  const asset = moodAsset[mood];
  // 자산이 없으면 idle 폴백(자산 도착 시 자동 전환).
  const resolvedMood: MascotMoodReaction = asset ? mood : "idle";

  if (
    !asset &&
    process.env.NODE_ENV !== "production" &&
    !warned.has(mood)
  ) {
    warned.add(mood);
    // eslint-disable-next-line no-console
    console.warn(
      `[MascotReaction] mood="${mood}"${reason ? ` (${reason})` : ""} 자산 미존재 — idle 폴백. ` +
        `public${mascotDir}/ 에 자산 추가 후 moodAsset.${mood} 채우면 자동 전환.`,
    );
  }

  const file = moodAsset[resolvedMood]!;
  const label = `순공이 ${moodLabel[resolvedMood]}${reason ? ` — ${reason}` : ""}`;

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
