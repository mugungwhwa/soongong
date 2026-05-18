import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import type { AnalysisResult } from "@/shared/mocks/analysis";

export function AnalysisCard({ result }: { result: AnalysisResult }) {
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
      {result.detectedWrongReason && (
        <div className="text-sm">
          <span className="text-[var(--color-text-muted)]">예상 오답 원인:</span>{" "}
          <span className="text-[var(--color-risk-mid)] font-semibold">
            {result.detectedWrongReason}
          </span>
        </div>
      )}
    </Card>
  );
}
