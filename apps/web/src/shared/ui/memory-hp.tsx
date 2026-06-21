"use client";
import { motion, useReducedMotion } from "framer-motion";

/**
 * 기억 HP pips — 0–5 정수 시각화 (잠긴 결정: CLAUDE.md §2, 게임성_기획_구조.md §4-2).
 *
 * 백분율·하트 표현 금지. 항상 5칸 중 채워진 칸 수로만 표현한다.
 * 결과 화면(가로, 채움 애니메이션) / 오답·복습 리스트(세로 pips)에서 공통 사용.
 */
const MAX_HP = 5;
const SPRING_EASE = [0.34, 1.56, 0.64, 1] as const;

export function MemoryHp({
  value,
  orientation = "horizontal",
  animate = false,
  className,
}: {
  /** 기억 HP. 0–5 정수로 클램프된다(범위 밖 입력 방어). */
  value: number;
  orientation?: "horizontal" | "vertical";
  /** 채워진 칸에 스프링 펄스 진입 모션을 줄지(결과 화면용). */
  animate?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const hp = Math.max(0, Math.min(MAX_HP, Math.round(value)));
  const vertical = orientation === "vertical";
  const doAnimate = animate && !reduceMotion;

  return (
    <div
      role="img"
      aria-label={`기억 HP ${hp} / ${MAX_HP}`}
      className={className}
      style={{
        display: "flex",
        flexDirection: vertical ? "column-reverse" : "row",
        gap: vertical ? 2 : 3,
        alignItems: "center",
      }}
    >
      {Array.from({ length: MAX_HP }).map((_, i) => {
        const on = i < hp;
        return (
          <motion.span
            key={i}
            aria-hidden
            initial={doAnimate ? { scaleY: 0.4 } : false}
            animate={doAnimate && on ? { scaleY: [0.4, 1.25, 1] } : { scaleY: 1 }}
            transition={{
              duration: 0.38,
              delay: doAnimate ? 0.06 * i : 0,
              ease: SPRING_EASE,
            }}
            style={{
              width: vertical ? 13 : 8,
              height: vertical ? 6 : 13,
              borderRadius: 3,
              display: "block",
              background: on
                ? "var(--color-mint-500)"
                : "var(--color-border-default)",
            }}
          />
        );
      })}
    </div>
  );
}
