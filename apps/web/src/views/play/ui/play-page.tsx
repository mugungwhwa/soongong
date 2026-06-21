"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Eye, X } from "lucide-react";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { MathRenderer } from "@/shared/ui/math-renderer";
import { RiskBadge } from "@/entities/quest";
import { useRecallSession } from "@/entities/recall-session";
import {
  persistPlaySubmission,
  type PlaySubmission,
} from "@/features/quest-play";
// 순수 게임 룰 함수만 deep import — entities/game 배럴은 ./api(server supabase, next/headers)를
// 끌어와 client 컴포넌트 빌드를 깨므로 우회한다. (entities/game 무수정)
import { gradeToHpDelta, gradeToInterval } from "@/entities/game/lib/game-rules";
import type { ReviewGrade } from "@/shared/contracts";
import { ROUTES } from "@/shared/config/routes";

/**
 * 회독 진행 — 자가 회상(SOO-97). 떠올리기 → 정답 공개 → 3단계 자가평가(grade).
 *
 * grade(또렷/가물가물/막막)는 SOO-115/116 확정 계약으로 기존 영속화 경로
 * (persistPlaySubmission → completeQuest / update-game-state)에 그대로 전달한다.
 * 채점·진행·스케줄·HP 계산 로직은 엔진/게임화 소유 — 본 뷰는 grade 값만 세팅한다(read 훅 소비).
 * 버튼 보조 라벨도 게임 룰 SSoT 함수(gradeToHpDelta/gradeToInterval)에서 파생 — 하드코딩 없음.
 */
function intervalLabel(days: number): string {
  return days === 1 ? "내일 다시" : `${days}일 뒤 다시`;
}

const GRADES: {
  grade: ReviewGrade;
  emoji: string;
  label: string;
  hint: string;
}[] = [
  {
    grade: "clear",
    emoji: "😌",
    label: "또렷했어요",
    hint: `기억 HP +${gradeToHpDelta("clear")}`,
  },
  {
    grade: "fuzzy",
    emoji: "🤔",
    label: "가물가물",
    hint: intervalLabel(gradeToInterval("fuzzy", false, 0)),
  },
  {
    grade: "blank",
    emoji: "😮‍💨",
    label: "막막했어요",
    hint: intervalLabel(gradeToInterval("blank", false, 0)),
  },
];

export function PlayPage({ questId }: { questId: string }) {
  const router = useRouter();
  const session = useRecallSession(questId);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const pct = Math.round(
    (session.progress.current / session.progress.total) * 100,
  );

  function handleGrade(grade: ReviewGrade) {
    if (submitting) return;
    setSubmitting(true);
    const elapsedSeconds = Math.max(
      0,
      Math.floor((Date.now() - startedAtRef.current) / 1000),
    );
    // grade 를 세팅해 기존(무수정) 영속화 경로로 전달 — best-effort, 흐름은 막지 않음.
    const submission: PlaySubmission = {
      questId,
      isCorrect: grade === "clear",
      answer: "",
      elapsedSeconds,
      hintUsed: false,
      mode: "today",
      grade,
    };
    void persistPlaySubmission(submission);
    router.push(ROUTES.result);
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col p-4 lg:max-w-xl lg:p-6">
      {/* 세션 헤더 — 닫기 + 진행 + 번호 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="회독 그만두기"
          onClick={() => router.push(ROUTES.today)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-sunken)] text-[var(--color-text-muted)] transition-transform active:scale-90"
        >
          <X size={15} strokeWidth={2.4} aria-hidden />
        </button>
        <div
          className="h-2 flex-1 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)]"
          role="progressbar"
          aria-valuenow={session.progress.current}
          aria-valuemin={0}
          aria-valuemax={session.progress.total}
        >
          <div
            className="h-full rounded-[var(--radius-pill)] bg-[var(--color-mint-500)] transition-[width] duration-[var(--duration-slow)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="min-w-[34px] text-right text-xs font-extrabold text-[var(--color-mint-700)]">
          {session.progress.current}/{session.progress.total}
        </div>
      </div>

      {/* 맥락 */}
      <div className="mt-4 flex items-center gap-2">
        <RiskBadge level={session.riskLevel} />
        <span className="text-xs font-bold text-[var(--color-text-muted)]">
          {session.subject} · {session.unit} · {session.dday}
        </span>
      </div>

      {/* 회상 카드 */}
      <div className="mt-5 rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
        <div className="text-[11.5px] font-extrabold tracking-wide text-[var(--color-mint-700)]">
          {session.kicker}
        </div>
        <div className="mt-2 text-[22px] font-extrabold leading-snug tracking-tight text-[var(--color-text-strong)]">
          {session.concept}
        </div>
        <div className="mt-2.5 text-[13.5px] font-semibold leading-relaxed text-[var(--color-text-default)]">
          <MathRenderer content={session.prompt} format="latex" />
        </div>

        {/* 회상 → 공개 */}
        <div className="mt-5">
          <RecallReveal
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            answerText={session.answerText}
            answerFormat={session.answerFormat}
            answerNote={session.answerNote}
          />
        </div>
      </div>

      {/* 자가평가 — 공개 전 잠금 */}
      <RatePanel revealed={revealed} disabled={submitting} onGrade={handleGrade} />

      {/* 버디 마스코트 */}
      <Buddy revealed={revealed} />
    </div>
  );
}

function RecallReveal({
  revealed,
  onReveal,
  answerText,
  answerFormat,
  answerNote,
}: {
  revealed: boolean;
  onReveal: () => void;
  answerText: string;
  answerFormat: "latex" | "plaintext";
  answerNote: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      {!revealed ? (
        <motion.button
          key="veil"
          type="button"
          onClick={onReveal}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="flex min-h-[128px] w-full flex-col items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border-[1.5px] border-dashed border-[var(--color-border-strong)] bg-[var(--color-mint-50)] p-5 text-center transition-transform active:scale-[0.99]"
        >
          <Eye size={26} strokeWidth={2} className="text-[var(--color-mint-700)]" aria-hidden />
          <div className="text-xs font-bold text-[var(--color-mint-900)]">
            정답 확인하기
          </div>
          <div className="text-[11px] font-semibold text-[var(--color-text-muted)]">
            먼저 스스로 떠올린 다음 눌러주세요
          </div>
        </motion.button>
      ) : (
        <motion.div
          key="answer"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 0.61, 0.36, 1] }}
          className="min-h-[128px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-5 shadow-[var(--shadow-card)]"
        >
          <div className="text-[11px] font-extrabold tracking-wide text-[var(--color-mint-700)]">
            정답
          </div>
          <div className="mt-1.5 text-[15px] font-bold leading-relaxed text-[var(--color-text-strong)]">
            <MathRenderer content={answerText} format={answerFormat} />
          </div>
          <div className="mt-2 border-t border-dashed border-[var(--color-border-default)] pt-2 text-xs font-semibold leading-relaxed text-[var(--color-text-default)]">
            {answerNote}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RatePanel({
  revealed,
  disabled,
  onGrade,
}: {
  revealed: boolean;
  disabled: boolean;
  onGrade: (grade: ReviewGrade) => void;
}) {
  return (
    <div
      className={`mt-auto pt-5 transition-opacity duration-[var(--duration-mid)] ${
        revealed ? "opacity-100" : "pointer-events-none opacity-40"
      }`}
    >
      <div className="mb-3 text-center text-[12.5px] font-bold text-[var(--color-text-default)]">
        얼마나 또렷하게 떠올랐나요?
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {GRADES.map((g) => (
          <button
            key={g.grade}
            type="button"
            disabled={!revealed || disabled}
            onClick={() => onGrade(g.grade)}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-1.5 pb-3 pt-3.5 text-center transition-transform hover:border-[var(--color-border-strong)] active:scale-[0.96]"
          >
            <span className="block text-[22px] leading-none" aria-hidden>
              {g.emoji}
            </span>
            <span className="mt-1.5 block text-xs font-extrabold text-[var(--color-text-strong)]">
              {g.label}
            </span>
            <span className="mt-0.5 block text-[9.5px] font-bold text-[var(--color-text-muted)]">
              {g.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Buddy({ revealed }: { revealed: boolean }) {
  return (
    <div className="mt-4 flex items-center gap-2.5">
      <MascotReaction mood="cheer" size="sm" reason="회독 응원" className="shrink-0" />
      <div className="rounded-[var(--radius-lg)] rounded-bl-[4px] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-text-strong)] shadow-[var(--shadow-card)]">
        {revealed ? "어땠어요? 솔직하게 골라요" : "천천히 떠올려도 돼요"}
      </div>
    </div>
  );
}
