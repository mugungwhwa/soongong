"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Star, RotateCcw } from "lucide-react";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { MemoryHp } from "@/shared/ui/memory-hp";
import { useGameState } from "@/entities/user-game-state";
import { useReviewSession } from "@/entities/review-session";
import { ROUTES } from "@/shared/config/routes";

/** 스태거 fade-up reveal — SOO-97/SOO-96 디자인 언어 계승. */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export function ResultPage() {
  const game = useGameState();
  const session = useReviewSession();

  return (
    <div className="mx-auto max-w-md p-4 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden flex flex-col items-center text-center px-5 py-8"
      >
        <Halo />

        {/* 마스코트 — 결과=칭찬(praise), 스프링 등장 */}
        <MascotPop>
          <MascotReaction
            mood="praise"
            size="xl"
            reason="회독 완료 · 망각 방어"
            className="relative z-[1]"
          />
        </MascotPop>

        <motion.h1
          variants={item}
          className="relative z-[1] mt-4 text-2xl font-extrabold tracking-tight leading-tight text-[var(--color-text-strong)]"
        >
          회독 <b className="text-[var(--color-mint-700)]">{session.reviewedCount}개</b> 끝!
          <br />
          오늘도 망각을 막았어요
        </motion.h1>

        <motion.p
          variants={item}
          className="relative z-[1] mt-2 max-w-[300px] text-[13px] font-semibold leading-relaxed text-[var(--color-text-default)]"
        >
          또렷해진 개념이 늘었어요. 이 페이스면 시험 전까지 기억이 단단하게 남아요.
        </motion.p>

        {/* 3 스탯: 오늘 회독 / 기억 HP(0–5) / 또렷해진 개념 */}
        <div className="relative z-[1] mt-8 grid w-full grid-cols-3 gap-2.5">
          <StatCard label="오늘 회독">
            <div className="text-xl font-extrabold leading-none tracking-tight text-[var(--color-text-strong)]">
              <CountUp to={session.reviewedCount} />
              <span className="text-xs font-extrabold text-[var(--color-text-muted)]"> 개</span>
            </div>
          </StatCard>
          <StatCard label="기억 HP">
            <div className="flex justify-center pb-0.5">
              <MemoryHp value={game.memoryHp} animate />
            </div>
          </StatCard>
          <StatCard label="또렷해진 개념">
            <div className="text-xl font-extrabold leading-none tracking-tight text-[var(--color-text-strong)]">
              +<CountUp to={session.vividGained} />
            </div>
          </StatCard>
        </div>

        {/* XP 획득 pill */}
        <motion.div
          variants={item}
          className="relative z-[1] mt-5 flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-warning-bg)] px-4 py-2 text-[13px] font-extrabold text-[var(--color-text-on-warm)]"
        >
          <Star size={15} strokeWidth={2.4} aria-hidden />
          <span>
            +<CountUp to={session.earnedXp} /> XP · {game.rank}
          </span>
        </motion.div>

        <motion.div
          variants={item}
          className="relative z-[1] mt-4 text-xs font-semibold text-[var(--color-text-default)]"
        >
          연속 순공 <b className="text-[var(--color-mint-700)]">{game.streakDays}일</b> · 무리하지
          않아도 괜찮아요 🌱
        </motion.div>

        {/* 액션 */}
        <div className="relative z-[1] mt-8 flex w-full flex-col gap-2.5">
          <ReviewCta fuzzyCount={session.fuzzyCount} />
          <HomeCta />
        </div>
      </motion.div>
    </div>
  );
}

/** 결과 후광 — mint 토큰 기반 반투명 글로우(color-mix로 토큰 참조, 하드코딩 색 없음). */
function Halo() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -top-10 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full"
      style={{
        background:
          "radial-gradient(circle, color-mix(in srgb, var(--color-mint-500) 28%, transparent), transparent 62%)",
      }}
      initial={{ opacity: 0, scale: 1 }}
      animate={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 1, scale: [1, 1.06, 1] }
      }
      transition={
        reduceMotion
          ? { duration: 0.38 }
          : { duration: 3.6, repeat: Infinity, ease: [0.22, 0.61, 0.36, 1] }
      }
    />
  );
}

/** 마스코트 스프링 팝 — 등장만 spring(디자인 언어: 마스코트/로고 등장만 탄성). */
function MascotPop({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.5, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : { type: "spring", stiffness: 320, damping: 18 }
      }
      className="relative z-[1]"
    >
      {children}
    </motion.div>
  );
}

function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={item}
      className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-2 pb-3 pt-4 shadow-[var(--shadow-card)]"
    >
      {children}
      <div className="mt-1.5 text-[10.5px] font-bold text-[var(--color-text-muted)]">
        {label}
      </div>
    </motion.div>
  );
}

function ReviewCta({ fuzzyCount }: { fuzzyCount: number }) {
  const router = useRouter();
  return (
    <motion.button
      variants={item}
      type="button"
      onClick={() => router.push(ROUTES.wrongNotes)}
      className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-primary-cta)] p-4 text-[15px] font-extrabold text-[var(--color-text-inverse)] shadow-[var(--shadow-elevated)] transition-transform active:scale-[0.97]"
    >
      <RotateCcw size={17} strokeWidth={2.4} aria-hidden />
      가물가물했던 {fuzzyCount}개 가볍게 복습
    </motion.button>
  );
}

function HomeCta() {
  const router = useRouter();
  return (
    <motion.button
      variants={item}
      type="button"
      onClick={() => router.push(ROUTES.today)}
      className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4 text-[15px] font-extrabold text-[var(--color-mint-900)] shadow-[var(--shadow-card)] transition-transform active:scale-[0.97]"
    >
      오늘은 여기까지 · 홈으로
    </motion.button>
  );
}

/** 카운트업 — ease-out cubic, prefers-reduced-motion 시 즉시 최종값. */
function CountUp({ to, duration = 900 }: { to: number; duration?: number }) {
  const reduceMotion = useReducedMotion();
  const [v, setV] = useState(reduceMotion ? to : 0);
  useEffect(() => {
    if (reduceMotion) {
      setV(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, reduceMotion]);
  return <span>{v}</span>;
}
