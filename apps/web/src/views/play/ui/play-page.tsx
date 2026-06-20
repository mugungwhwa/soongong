"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { MascotReaction } from "@/shared/ui/mascot-reaction";
import { PadCanvas, type PadCanvasHandle } from "@/widgets/pad-canvas";
import { AnswerForm, useQuestPlay, persistPlaySubmission } from "@/features/quest-play";
import { getQuestById } from "@/shared/mocks/quests";
import { getAnalysisResultByObjectId } from "@/shared/mocks/analysis-results";
import { MathRenderer } from "@/shared/ui/math-renderer";
import { ROUTES } from "@/shared/config/routes";

export function PlayPage({ questId }: { questId: string }) {
  const router = useRouter();
  const quest = getQuestById(questId);
  const play = useQuestPlay();
  const canvasRef = useRef<PadCanvasHandle | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  async function handleSubmit() {
    const elapsed = Math.max(
      0,
      Math.floor((Date.now() - startedAtRef.current) / 1000),
    );
    // 캔버스 데이터는 view 에서 추출(레이어 분리) → plain 값으로 feature 에 전달
    let strokeJSON: unknown;
    let pngBlob: Blob | null = null;
    if (canvasRef.current) {
      try {
        strokeJSON = canvasRef.current.getStrokeJSON();
        pngBlob = await canvasRef.current.exportPNG();
      } catch {
        /* 캔버스 추출 실패해도 진행 */
      }
    }
    const isCorrect = play.submit();
    if (!quest) return;
    // best-effort 영속화 — 데모 흐름을 막지 않음
    void persistPlaySubmission({
      questId: quest.questId,
      isCorrect,
      answer: play.answer,
      elapsedSeconds: elapsed,
      hintUsed: false,
      mode: "today",
      strokeJSON,
      pngBlob,
    });
  }

  if (!quest) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-[var(--color-text-strong)]">퀘스트를 찾을 수 없습니다</h1>
        <Button variant="outline" className="mt-4" onClick={() => router.push(ROUTES.today)}>
          홈으로
        </Button>
      </div>
    );
  }

  const analysis = getAnalysisResultByObjectId(quest.objectId);

  return (
    <div className="mx-auto max-w-2xl p-4 lg:p-8 space-y-4">
      <header className="flex items-center gap-3">
        {play.state === "playing" && (
          <MascotReaction
            mood="cheer"
            size="md"
            reason="회독 시작"
            className="shrink-0"
          />
        )}
        <div className="min-w-0">
          <div className="text-sm text-[var(--color-text-muted)]">
            {quest.subject} · {quest.unit}
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-strong)]">{quest.topic}</h1>
        </div>
      </header>

      {play.state === "playing" && (
        <>
          <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border-default)]">
            <p className="text-sm text-[var(--color-text-default)] leading-relaxed">
              <MathRenderer
                content={analysis?.rawTextSnippet ?? quest.topic}
                format={analysis?.formula_format}
              />
            </p>
          </Card>
          <PadCanvas onReady={(h) => (canvasRef.current = h)} />
          <AnswerForm answer={play.answer} setAnswer={play.setAnswer} onSubmit={handleSubmit} />
          {analysis?.formula_format === "latex" && (
            <p className="text-xs text-[var(--color-text-muted)] text-center">
              힌트: 점화식을 한 단계씩 풀어 보세요.
            </p>
          )}
        </>
      )}

      {play.state === "submitted-correct" && (
        <Card className="p-6 text-center space-y-4 shadow-[var(--shadow-elevated)]">
          <MascotReaction mood="praise" size="xl" reason="정답! 회독 완료" className="mx-auto" />
          <div className="text-xl font-bold text-[var(--color-mint-700)]">
            정답! +{quest.rewardXp} XP
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            오늘 회독 1개 완료. 결과 화면으로 이동할까요?
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push(ROUTES.today)}>
              홈으로
            </Button>
            <Button
              className="bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
              onClick={() => router.push(ROUTES.result)}
            >
              결과 보기
            </Button>
          </div>
        </Card>
      )}

      {play.state === "submitted-wrong" && (
        <Card className="p-6 text-center space-y-4 shadow-[var(--shadow-elevated)]">
          <MascotReaction mood="down" size="xl" reason="오답" className="mx-auto" />
          <div className="text-lg font-semibold text-[var(--color-text-strong)]">
            아쉬워요. 오답회수로 회복할까요?
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            변형 문제(V1-V5)로 다시 도전하면 +30 XP를 받아요.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={play.reset}>
              다시 풀기
            </Button>
            <Button
              className="bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
              onClick={() => router.push(ROUTES.recovery(quest.objectId))}
            >
              오답회수 가기
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
