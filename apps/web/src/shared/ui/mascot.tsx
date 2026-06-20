import {
  MascotReaction,
  type MascotMoodReaction,
} from "@/shared/ui/mascot-reaction";

/**
 * 구 Mascot API 호환 래퍼.
 *
 * 기존 호출처(홈/회독/결과/빈상태 등)는 `mood`를 받지만 컴포넌트가 이를 무시하고
 * 단일 자산만 로드했다(design-review §2-1 blocking 위반). 이 래퍼는 구 6 mood를
 * 표정 자산이 있는 신 mood(`MascotReaction`)로 매핑해 전 화면 표정 분기를 살린다.
 *
 * 신규 코드는 `MascotReaction`(idle/cheer/nudge/praise/down)을 직접 쓴다.
 */
export type MascotMood =
  | "cheer"
  | "celebrate"
  | "think"
  | "comfort"
  | "sleep"
  | "surprise";

// 구 mood → 신 표정 mood. 자산이 있는 표정으로 의미 보존 매핑.
// celebrate/축하 → praise(칭찬), comfort/위로(오답+loss 통합) → down(시무룩, 자산 도착 전 idle 폴백),
// think·sleep/휴식 → idle(차분 기본), surprise → cheer(긍정 환기).
const moodMap: Record<MascotMood, MascotMoodReaction> = {
  cheer: "cheer",
  celebrate: "praise",
  think: "idle",
  comfort: "down",
  sleep: "idle",
  surprise: "cheer",
};

export function Mascot({
  mood = "cheer",
  size = "md",
  className,
}: {
  mood?: MascotMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <MascotReaction mood={moodMap[mood]} size={size} className={className} />
  );
}
