"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { MathRenderer } from "@/shared/ui/math-renderer";
import { useRecoverySession } from "@/entities/wrong-note-review";
import type { RecoveryVariantItem } from "@/entities/wrong-note-review";
import { persistPlaySubmission } from "@/features/quest-play";
import { ROUTES } from "@/shared/config/routes";

/**
 * 오답회수 모드 — 실데이터 연결(SOO-135).
 *
 * mock 완전 제거: fetchRecoverySession이
 *   1) generated_problems 조회 (이미지 업로드 경로)
 *   2) 없으면 generate-problem Edge Function 지연 트리거 (텍스트 입력 경로)
 *   3) 여전히 없으면 PLO 원문 V1 폴백
 * 순서로 실데이터를 채운다. grade=clear로 고정(오답회수 성공 의미).
 */
export function RecoveryPage({ objectId }: { objectId: string }) {
  const router = useRouter();
  const { session, loading, error } = useRecoverySession(objectId);
  const [activeTier, setActiveTier] = useState<"V1" | "V2" | "V3">("V1");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <RecoveryStatus message="변형 문항을 불러오는 중이에요…" />;
  }
  if (error || !session || session.variants.length === 0) {
    return (
      <RecoveryStatus
        message="변형 문항이 없어요"
        sub="자료를 올리면 순공이가 변형 문항을 만들어 드려요."
        onHome={() => router.push(ROUTES.today)}
      />
    );
  }

  const activeVariant =
    session.variants.find((v) => v.tier === activeTier) ?? session.variants[0]!;

  async function handleComplete() {
    if (submitting || !session) return;
    setSubmitting(true);
    if (session.questId) {
      // 오답회수 성공 → persistPlaySubmission 으로 일정 재조정 + 게임상태 갱신
      void persistPlaySubmission({
        questId: session.questId,
        isCorrect: true,
        answer: "",
        elapsedSeconds: 0,
        hintUsed: false,
        mode: "wrong_recovery",
        grade: "clear",
      });
    }
    router.push(ROUTES.result);
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col p-4 lg:max-w-xl lg:p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="나가기"
          onClick={() => router.push(ROUTES.today)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-sunken)] text-[var(--color-text-muted)] transition-transform active:scale-90"
        >
          <X size={15} strokeWidth={2.4} aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-extrabold tracking-wide text-[var(--color-risk-high)]">
            오답회수 모드
          </div>
          <div className="text-xs font-bold text-[var(--color-text-muted)]">
            {session.subject} · {session.topic}
          </div>
        </div>
      </div>

      {/* 난이도 탭 — 변형 2개 이상일 때만 노출 */}
      {session.variants.length > 1 && (
        <div className="mt-4 flex gap-2">
          {session.variants.map((v) => (
            <button
              key={v.tier}
              type="button"
              onClick={() => setActiveTier(v.tier)}
              className={`rounded-[var(--radius-pill)] px-3 py-1 text-xs font-bold transition-colors ${
                activeTier === v.tier
                  ? "bg-[var(--color-mint-500)] text-[var(--color-text-inverse)]"
                  : "border border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              }`}
            >
              {v.tier}
            </button>
          ))}
        </div>
      )}

      {/* 문항 카드 */}
      <VariantCard variant={activeVariant} />

      {/* 마스코트 */}
      <div className="mt-4 flex items-center gap-2.5">
        <MascotReaction
          mood="cheer"
          size="sm"
          reason="오답회수 응원"
          className="shrink-0"
        />
        <div className="rounded-[var(--radius-lg)] rounded-bl-[4px] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-text-strong)] shadow-[var(--shadow-card)]">
          이 변형으로 약점을 완전히 잡아봐요
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="mt-auto pt-6">
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleComplete()}
          className="flex w-full items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-cta)] p-4 text-[15px] font-extrabold text-[var(--color-text-inverse)] shadow-[var(--shadow-elevated)] transition-transform active:scale-[0.97] disabled:opacity-60"
        >
          {submitting ? "저장 중…" : `풀기 완료${session.questId ? " (+30 XP)" : ""}`}
        </button>
        <button
          type="button"
          onClick={() => router.push(ROUTES.today)}
          className="mt-3 w-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-3 text-sm font-bold text-[var(--color-text-muted)] transition-transform active:scale-[0.97]"
        >
          나가기
        </button>
      </div>
    </div>
  );
}

function VariantCard({ variant }: { variant: RecoveryVariantItem }) {
  return (
    <div className="mt-5 rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
      <div className="text-[11px] font-semibold leading-relaxed text-[var(--color-text-muted)]">
        {variant.description}
      </div>
      <div className="mt-3 text-[15px] font-bold leading-relaxed text-[var(--color-text-strong)]">
        <MathRenderer content={variant.stem} format={variant.formulaFormat} />
      </div>
    </div>
  );
}

function RecoveryStatus({
  message,
  sub,
  onHome,
}: {
  message: string;
  sub?: string;
  onHome?: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <MascotReaction mood="idle" size="lg" reason="오답회수 대기" />
      <div className="text-base font-extrabold text-[var(--color-text-strong)]">
        {message}
      </div>
      {sub && (
        <p className="max-w-[280px] text-[13px] font-semibold leading-relaxed text-[var(--color-text-default)]">
          {sub}
        </p>
      )}
      {onHome && (
        <button
          type="button"
          onClick={onHome}
          className="mt-2 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 py-3 text-[14px] font-extrabold text-[var(--color-mint-900)] shadow-[var(--shadow-card)] transition-transform active:scale-[0.97]"
        >
          홈으로
        </button>
      )}
    </div>
  );
}
