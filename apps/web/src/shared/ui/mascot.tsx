import { cn } from "@/shared/lib/cn";

export type MascotMood = "cheer" | "celebrate" | "think" | "comfort" | "sleep" | "surprise";

const MOOD_EMOJI: Record<MascotMood, string> = {
  cheer: "😊",
  celebrate: "🎉",
  think: "💭",
  comfort: "🥲",
  sleep: "😴",
  surprise: "😲",
};

const SIZE = { sm: 32, md: 48, lg: 72, xl: 120 } as const;

export function Mascot({
  mood = "cheer",
  size = "md",
  className,
}: {
  mood?: MascotMood;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const px = SIZE[size];
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[var(--color-mint-100)]",
        className,
      )}
      style={{ width: px, height: px, fontSize: px * 0.55 }}
      role="img"
      aria-label={`순공이 ${mood}`}
    >
      {MOOD_EMOJI[mood]}
    </div>
  );
}
