import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import type { AnalysisResult } from "@/shared/mocks/analysis";

const STRATEGY_LABEL: Record<"numeric_swap" | "target_change", string> = {
  numeric_swap: "숫자 변형",
  target_change: "요구값 변경",
};

export function AnalysisCard({ result }: { result: AnalysisResult }) {
  const wrongReasons =
    result.wrongReasonCandidates ??
    (result.detectedWrongReason ? [result.detectedWrongReason] : []);

  return (
    <Card className="p-5 space-y-3 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Badge>{result.subject}</Badge>
        <span>
          {result.unit} · {result.topic}
        </span>
      </div>
      <p className="text-sm text-[var(--color-text-default)] bg-[var(--color-bg-sunken)] p-3 rounded-[var(--radius-md)]">
        {result.rawTextSnippet}
      </p>
      <div className="flex flex-wrap gap-4 text-sm">
        <span>
          난이도: <b>{result.difficultyLevel}/5</b>
        </span>
        <span>
          유형: <b>{result.questionType}</b>
        </span>
        <span>
          신뢰도:{" "}
          <b className="text-[var(--color-mint-700)]">
            {(result.confidenceScore * 100).toFixed(0)}%
          </b>
        </span>
      </div>
      {wrongReasons.length > 0 && (
        <div className="text-sm">
          <span className="text-[var(--color-text-muted)]">예상 오답 원인:</span>{" "}
          {wrongReasons.map((reason, i) => (
            <span key={reason}>
              <span className="text-[var(--color-risk-mid)] font-semibold">
                {reason}
              </span>
              {i < wrongReasons.length - 1 && (
                <span className="text-[var(--color-text-muted)]">, </span>
              )}
            </span>
          ))}
        </div>
      )}

      {result.variation && (
        <div className="border-t border-[var(--color-border-default)] pt-3 mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Badge>변형 {result.variation.level}</Badge>
            <span className="text-[var(--color-text-muted)]">
              {STRATEGY_LABEL[result.variation.strategy]}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-default)] bg-[var(--color-bg-sunken)] p-3 rounded-[var(--radius-md)]">
            {result.variation.stem}
          </p>
          <div className="text-sm">
            <span className="text-[var(--color-text-muted)]">예상 정답률:</span>{" "}
            <b className="text-[var(--color-mint-700)]">
              {(result.variation.expectedCorrectRate * 100).toFixed(0)}%
            </b>
          </div>
        </div>
      )}
    </Card>
  );
}
