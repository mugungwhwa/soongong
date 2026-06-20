import Image from "next/image";
import { cn } from "@/shared/lib/cn";

export type MascotMood =
  | "cheer"
  | "celebrate"
  | "think"
  | "comfort"
  | "sleep"
  | "surprise";

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
        "relative inline-flex items-center justify-center rounded-full bg-[var(--color-mint-100)] overflow-hidden",
        className,
      )}
      style={{ width: px, height: px }}
      role="img"
      aria-label={`순공이 ${mood}`}
    >
      <Image
        src="/brand/soongong-main.png"
        alt=""
        width={px}
        height={px}
        priority={size === "xl"}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
