"use client";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Play } from "lucide-react";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { MemoryHp } from "@/shared/ui/memory-hp";
import { RiskBadge } from "@/entities/quest";
import {
  useWrongNoteReview,
  type WrongReviewItem,
} from "@/entities/wrong-note-review";
import { ROUTES } from "@/shared/config/routes";

/** 스태거 fade-up reveal — SOO-97/SOO-96 디자인 언어 계승. */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export function WrongNotesPage() {
  const { items, summary } = useWrongNoteReview();
  const router = useRouter();

  const reduceMotion = useReducedMotion();

  function startReview() {
    const first = items[0];
    router.push(
      first?.objectId ? ROUTES.recovery(first.objectId) : ROUTES.today,
    );
  }

  return (
    <div className="mx-auto max-w-md p-4 lg:max-w-2xl lg:p-8">
      <motion.div
        variants={container}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
      >
        {/* 헤더 — 마스코트 이리와(복습 due) + 동반자 카피 */}
        <motion.header variants={item} className="flex items-center gap-3.5">
          <MascotReaction
            mood="nudge"
            size="lg"
            reason="복습 due"
            className="shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold leading-tight tracking-tight text-[var(--color-text-strong)]">
              놓친 개념도
              <br />
              금방 다시 또렷해져요
            </h1>
            <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[var(--color-text-default)]">
              틀린 건 약점이 아니라 다음에 더 오래 기억할 신호예요. 위험한 것부터 같이 정리해요.
            </p>
          </div>
        </motion.header>

        {/* 요약 3박스 */}
        <motion.div variants={item} className="mt-5 flex gap-2.5">
          <SummaryBox value={String(summary.reviewCount)} label="복습할 개념" />
          <SummaryBox value={`~${summary.estimatedMinutes}분`} label="예상 시간" />
          <SummaryBox value={summary.scheduleLabel} label="회독 일정" />
        </motion.div>

        {/* 위험순 리스트 — 앱=1열 / 웹=2열 */}
        <div className="mt-5 flex flex-col gap-2.5 lg:grid lg:grid-cols-2">
          {items.map((it) => (
            <ReviewRow
              key={it.id}
              item={it}
              onClick={() =>
                router.push(
                  it.objectId ? ROUTES.recovery(it.objectId) : ROUTES.today,
                )
              }
            />
          ))}
        </div>

        {/* 복습 시작 CTA + 안심 카피 */}
        <motion.button
          variants={item}
          type="button"
          onClick={startReview}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-primary-cta)] p-4 text-[15px] font-extrabold text-[var(--color-text-inverse)] shadow-[var(--shadow-elevated)] transition-transform active:scale-[0.97]"
        >
          <Play size={17} strokeWidth={2.4} aria-hidden />
          지금 {summary.reviewCount}개 복습 시작
        </motion.button>
        <motion.p
          variants={item}
          className="mt-3 text-center text-[11.5px] font-semibold leading-relaxed text-[var(--color-text-muted)]"
        >
          한 번에 다 안 해도 돼요. 오늘 못 하면 순공이가 일정에 다시 올려둘게요.
        </motion.p>
      </motion.div>
    </div>
  );
}

function SummaryBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-3 text-center shadow-[var(--shadow-card)]">
      <div className="text-lg font-extrabold text-[var(--color-text-strong)]">
        {value}
      </div>
      <div className="mt-1 text-[10.5px] font-bold text-[var(--color-text-muted)]">
        {label}
      </div>
    </div>
  );
}

function ReviewRow({
  item: it,
  onClick,
}: {
  item: WrongReviewItem;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={item}
      type="button"
      onClick={onClick}
      className="flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-3.5 text-left shadow-[var(--shadow-card)] transition-transform active:scale-[0.985]"
    >
      <MemoryHp value={it.memoryHp} orientation="vertical" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold tracking-tight text-[var(--color-text-strong)]">
          {it.concept}
        </div>
        <div className="mt-0.5 text-[11.5px] font-semibold text-[var(--color-text-muted)]">
          {it.unit} · {it.dday}
        </div>
        <div className="mt-1.5 rounded-[var(--radius-sm)] bg-[var(--color-bg-sunken)] px-2 py-1.5 text-[11px] font-semibold leading-snug text-[var(--color-text-default)]">
          {it.missReason}
        </div>
      </div>
      <div className="shrink-0">
        <RiskBadge level={it.riskLevel} />
      </div>
    </motion.button>
  );
}
