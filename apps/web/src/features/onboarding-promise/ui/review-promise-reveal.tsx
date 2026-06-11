"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CalendarHeart, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";
import type { ReviewCycle } from "@/shared/contracts";

/**
 * 온보딩 클라이맥스 — "복습 스케줄 약속".
 *
 * 첫 사진 업로드 → AI가 1·3·7·14일 회독 퀘스트로 변환되는 순간을 연출한다.
 * 정체성: 순공대장 = 까먹음 방지/복습 약속 (콴다 = 막힘 풀이와 대비).
 * 카피 톤은 게임화 SSoT(`01_제품_UX_게임화/게임성_기획_구조.md`)를 따른다.
 */

type CycleStep = {
  cycle: ReviewCycle;
  label: string;
  note: string;
};

/** 회독 주기별 약속 문구 — 망각곡선 위에 "다시 꺼내줄게" 프레임. fear-based 금지. */
const CYCLE_STEPS: readonly CycleStep[] = [
  { cycle: 1, label: "첫 복습", note: "기억이 선명할 때 한 번 더" },
  { cycle: 3, label: "두 번째 복습", note: "슬슬 흐려질 때 다시 꺼내줄게" },
  { cycle: 7, label: "세 번째 복습", note: "까먹기 딱 좋은 타이밍에 콕" },
  { cycle: 14, label: "장기기억 굳히기", note: "이제 진짜 네 것이 돼" },
] as const;

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatPromiseDate(base: Date, addDays: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + addDays);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY[d.getDay()]})`;
}

export function ReviewPromiseReveal({
  previewUrl,
  onStart,
}: {
  /** 업로드한 첫 사진 미리보기 — "사진 → 일정" 변환을 시각적으로 잇는다. */
  previewUrl: string | null;
  onStart: () => void;
}) {
  // 기준일은 마운트 시점 1회 고정 (렌더마다 흔들리지 않도록).
  const base = new Date();

  useEffect(() => {
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.35 },
      colors: ["#2AB8D0", "#F2C94C", "#7DD8EA"],
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm flex flex-col items-center gap-5"
    >
      <Mascot mood="celebrate" size="xl" />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
          너의 복습, 순공이가 약속할게 🤝
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
          이 문제, 네 번 다시 만나면 진짜 네 것이 돼.
          <br />
          까먹을 때마다 순공이가 먼저 꺼내줄게.
        </p>
      </div>

      {/* 변환 헤더: 사진 1장 → 회독 퀘스트 4개 (아하 모먼트) */}
      <div className="flex items-center gap-3 w-full px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--color-mint-50)] border border-[var(--color-border-default)]">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="업로드한 첫 문제"
            className="h-11 w-11 rounded-[var(--radius-md)] object-cover shrink-0"
          />
        ) : (
          <div className="h-11 w-11 rounded-[var(--radius-md)] bg-[var(--color-mint-100)] grid place-items-center text-xl shrink-0">
            📷
          </div>
        )}
        <span className="text-base">→</span>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-mint-900)]">
          <Sparkles size={16} strokeWidth={1.75} />
          회독 퀘스트 {CYCLE_STEPS.length}개 완성
        </div>
      </div>

      {/* 회독 일정 타임라인 */}
      <ol className="relative w-full pl-1">
        {CYCLE_STEPS.map((step, i) => (
          <motion.li
            key={step.cycle}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.18, duration: 0.32 }}
            className="relative flex gap-3 pb-4 last:pb-0"
          >
            {/* 세로 연결선 */}
            {i < CYCLE_STEPS.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[19px] top-10 bottom-1 w-0.5 bg-[var(--color-border-default)]"
              />
            )}
            {/* 주기 노드 */}
            <div className="shrink-0 h-10 w-10 rounded-full bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] grid place-items-center text-xs font-bold shadow-[var(--shadow-card)]">
              D+{step.cycle}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--color-text-strong)]">
                  {step.label}
                </span>
                <span className="text-xs font-medium text-[var(--color-mint-700)] whitespace-nowrap">
                  {formatPromiseDate(base, step.cycle)}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {step.note}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>

      <Button
        className="w-full bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
        onClick={onStart}
      >
        <CalendarHeart size={18} strokeWidth={1.75} className="mr-1.5" />첫 회독
        시작하기 →
      </Button>
    </motion.div>
  );
}
