"use client";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";
import { PadCanvas } from "@/widgets/pad-canvas/ui/pad-canvas";
import { AnswerForm } from "@/features/quest-play/ui/answer-form";
import { useQuestPlay } from "@/features/quest-play/model/use-quest-play";
import { getQuestById } from "@/shared/mocks/quests";
import { ROUTES } from "@/shared/config/routes";

export function PlayPage({ questId }: { questId: string }) {
  const router = useRouter();
  const quest = getQuestById(questId);
  const play = useQuestPlay();

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

  return (
    <div className="mx-auto max-w-2xl p-4 lg:p-8 space-y-4">
      <header>
        <div className="text-sm text-[var(--color-text-muted)]">
          {quest.subject} · {quest.unit}
        </div>
        <h1 className="text-xl font-bold text-[var(--color-text-strong)]">{quest.topic}</h1>
      </header>

      {play.state === "playing" && (
        <>
          <Card className="p-4 bg-[var(--color-bg-sunken)] border-[var(--color-border-default)]">
            <p className="text-sm text-[var(--color-text-default)] leading-relaxed">
              수열 {`{a_n}`}이 a₁ = 1, a_{`{n+1}`} = 2a_n + 3 을 만족할 때 a₃ 의 값은?
            </p>
          </Card>
          <PadCanvas />
          <AnswerForm answer={play.answer} setAnswer={play.setAnswer} onSubmit={play.submit} />
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            힌트: 점화식을 한 단계씩 풀어 a₂, a₃을 구해 보세요.
          </p>
        </>
      )}

      {play.state === "submitted-correct" && (
        <Card className="p-6 text-center space-y-4 shadow-[var(--shadow-elevated)]">
          <Mascot mood="celebrate" size="xl" className="mx-auto" />
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
              className="bg-[var(--color-mint-500)] text-white hover:bg-[var(--color-mint-700)]"
              onClick={() => router.push(ROUTES.result)}
            >
              결과 보기
            </Button>
          </div>
        </Card>
      )}

      {play.state === "submitted-wrong" && (
        <Card className="p-6 text-center space-y-4 shadow-[var(--shadow-elevated)]">
          <Mascot mood="comfort" size="xl" className="mx-auto" />
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
              className="bg-[var(--color-mint-500)] text-white hover:bg-[var(--color-mint-700)]"
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
