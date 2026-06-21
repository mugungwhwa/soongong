"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** 스태거용 등장 지연(ms). 같은 묶음 안에서 0/60/120… 식으로 준다. */
  delay?: number;
}

/**
 * 스태거 스크롤 reveal — SOO-96/97 모션 언어(기본 ease-out-soft 페이드업) 계승.
 *
 * 뷰포트 진입 시 한 번만 페이드업한다. 모션 토큰은 tokens.css 참조(--duration-slow,
 * --ease-out-soft) — 두 번째 SSoT 금지. `prefers-reduced-motion`이면 변환 없이 즉시
 * 표시한다(접근성). 랜딩(brand-hero) 전용 내부 컴포넌트.
 *
 * 접근성·견고성: 숨김(opacity-0) 상태는 **하이드레이션 이후에만** 적용한다. JS가 없거나
 * hydration이 실패해도 정적 HTML은 항상 노출(opacity-100) — 핵심 랜딩이 사라지지 않는다.
 * 마운트 시점에 이미 뷰포트 안인 콘텐츠(상단 히어로)는 숨김 전환 없이 바로 노출해 깜빡임을 막는다.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // reduced-motion: 변환·관찰 없이 즉시 노출.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      setHydrated(true);
      return;
    }

    // 마운트 시 이미 뷰포트 안이면(상단 히어로) 숨김 전환 없이 즉시 노출 — 깜빡임 방지.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShown(true);
      setHydrated(true);
      return;
    }

    setHydrated(true);
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

  // 하이드레이션 전에는 항상 노출(정적 HTML 가시성 보장). 숨김은 하이드레이션 후 애니메이션 상태에서만.
  const hidden = hydrated && !shown;

  return (
    <div
      ref={ref}
      style={shown ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)] motion-reduce:transition-none",
        hidden ? "translate-y-3.5 opacity-0" : "translate-y-0 opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
