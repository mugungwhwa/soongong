"use client";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
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

  function goRecover(it: WrongReviewItem) {
    router.push(it.objectId ? ROUTES.recovery(it.objectId) : ROUTES.today);
  }
  function recoverAll() {
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
        {/* 헤더 — 마스코트 다독임(comfort=down mood) + 동반자 카피 */}
        <motion.header variants={item} className="flex items-center gap-3.5">
          <MascotReaction
            mood="down"
            size="lg"
            reason="오답 다독임"
            className="shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-[var(--color-text-strong)] lg:text-[25px]">
              오답 회수
            </h1>
            <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-[var(--color-text-default)]">
              틀린 문제는 부끄러운 게 아니라 가장 빠른 지름길이에요. 확실히 내 것이 될 때까지 같이 회수해요.
            </p>
          </div>
        </motion.header>

        {/* 오답 → 회독 루프 연결 배너 */}
        <motion.div
          variants={item}
          className="mt-4 flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-[var(--color-mint-300)] bg-gradient-to-br from-[var(--color-mint-50)] to-[var(--color-surface)] p-3.5"
        >
          <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-[var(--color-mint-100)]">
            <RefreshCw
              size={20}
              strokeWidth={1.8}
              className="text-[var(--color-mint-700)]"
              aria-hidden
            />
          </span>
          <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--color-text-default)]">
            회수한 오답은{" "}
            <b className="font-bold text-[var(--color-mint-900)]">
              회독 큐로 들어가
            </b>{" "}
            1·3·7·14일에 다시 만나요. 한 번 틀린 개념이 회독 루프를 타고 안정권까지 굳어집니다.
          </p>
        </motion.div>

        {/* 요약 3박스 */}
        <motion.div variants={item} className="mt-4 grid grid-cols-3 gap-2.5">
          <SummaryBox
            value={String(summary.reviewCount)}
            label="회수 대기"
            emphasis
          />
          <SummaryBox value={`~${summary.estimatedMinutes}분`} label="예상 시간" />
          <SummaryBox value={summary.scheduleLabel} label="회독 일정" />
        </motion.div>

        {/* 섹션 헤더 — 회수 대기 오답 + 전체 담기 */}
        <motion.div
          variants={item}
          className="mb-2.5 mt-5 flex items-center justify-between"
        >
          <h2 className="text-base font-extrabold tracking-tight text-[var(--color-text-strong)]">
            회수 대기 오답
          </h2>
          <button
            type="button"
            onClick={recoverAll}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-primary-cta)] px-3.5 py-2 text-[12.5px] font-extrabold text-[var(--color-text-inverse)] transition-transform active:scale-[0.97]"
          >
            <Plus size={15} strokeWidth={2.6} aria-hidden />
            전체 회독에 담기
          </button>
        </motion.div>

        {/* 위험순 리스트 — 앱=1열 / 웹=2열 */}
        <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2">
          {items.map((it) => (
            <ReviewRow key={it.id} item={it} onClick={() => goRecover(it)} />
          ))}
        </div>

        {/* 안심 카피 — 압박 없는 동반자 톤 */}
        <motion.p
          variants={item}
          className="mt-5 text-center text-[11.5px] font-semibold leading-relaxed text-[var(--color-text-muted)]"
        >
          한 번에 다 안 해도 돼요. 오늘 못 하면 순공이가 일정에 다시 올려둘게요.
        </motion.p>
      </motion.div>
    </div>
  );
}

function SummaryBox({
  value,
  label,
  emphasis,
}: {
  value: string;
  label: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-3 text-center shadow-[var(--shadow-card)]">
      <div
        className={
          emphasis
            ? "text-xl font-extrabold tracking-tight text-[var(--color-mint-900)]"
            : "text-xl font-extrabold tracking-tight text-[var(--color-text-strong)]"
        }
      >
        {value}
      </div>
      <div className="mt-1 text-[11.5px] font-bold text-[var(--color-text-muted)]">
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
    <motion.div
      variants={item}
      className="flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-3.5 shadow-[var(--shadow-card)]"
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
      <div className="flex shrink-0 flex-col items-end gap-2">
        <RiskBadge level={it.riskLevel} />
        <button
          type="button"
          onClick={onClick}
          className="whitespace-nowrap rounded-[var(--radius-pill)] bg-[var(--color-mint-100)] px-3.5 py-2 text-[12.5px] font-extrabold text-[var(--color-mint-900)] transition-transform active:scale-[0.97]"
        >
          회독에 담기
        </button>
      </div>
    </motion.div>
  );
}
