"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";

/**
 * 스태거 스크롤 reveal — SOO-96/97 모션 언어(기본 ease-out-soft 페이드업) 계승.
 *
 * 뷰포트 진입 시 한 번만 페이드업한다. 모션 토큰은 tokens.css 참조(--duration-slow,
 * --ease-out-soft) — 두 번째 SSoT 금지. `prefers-reduced-motion`이면 변환 없이 즉시
 * 표시한다(접근성). 랜딩(brand-hero) 전용 내부 컴포넌트.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** 스태거용 등장 지연(ms). 같은 묶음 안에서 0/60/120… 식으로 준다. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // reduced-motion: 변환·관찰 없이 즉시 노출.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={shown ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-3.5 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
