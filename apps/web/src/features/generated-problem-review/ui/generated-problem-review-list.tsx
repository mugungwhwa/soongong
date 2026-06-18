"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";
import { MathRenderer } from "@/shared/ui/math-renderer";
import { createClient } from "@/shared/lib/supabase/client";
import {
  REJECT_REASONS,
  type GeneratedProblemReviewItem,
  type RejectReason,
  type ReviewDecision,
} from "@/entities/generated-problem";

type RowStatus =
  | { kind: "pending" }
  | { kind: "rejecting" }
  | { kind: "approved" }
  | { kind: "rejected"; reason: RejectReason };

const MODE_LABEL: Record<string, string> = {
  rebuild: "재정비",
  maintain: "유지",
  stretch: "도전",
};

async function recordDecision(
  problemId: string,
  decision: ReviewDecision,
  reason?: RejectReason,
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("audit_logs").insert({
    actor_id: user?.id ?? null,
    actor_role: "reviewer",
    action: decision === "approved" ? "approve" : "reject",
    target_table: "generated_problems",
    target_id: problemId,
    diff: reason ? { decision, reason } : { decision },
  });
}

function SourceContrast({
  item,
}: {
  item: GeneratedProblemReviewItem;
}) {
  if (!item.source) {
    return (
      <p className="text-xs text-[var(--color-text-muted)]">
        원 오답 기록을 찾을 수 없습니다 (학습객체 삭제됨).
      </p>
    );
  }
  return (
    <div className="rounded-md bg-[var(--color-mint-50)] p-3 space-y-1.5">
      <p className="text-xs font-semibold text-[var(--color-text-muted)]">
        원 오답
      </p>
      {item.source.extractedText && (
        <p className="text-sm text-[var(--color-text-default)]">
          <MathRenderer content={item.source.extractedText} format="latex" />
        </p>
      )}
      {item.source.detectedWrongReason && (
        <p className="text-xs text-[var(--color-text-muted)]">
          감지된 오답 사유: {item.source.detectedWrongReason}
        </p>
      )}
      {item.source.studentNote && (
        <p className="text-xs text-[var(--color-text-muted)]">
          학생 메모: {item.source.studentNote}
        </p>
      )}
    </div>
  );
}

function ReviewCard({ item }: { item: GeneratedProblemReviewItem }) {
  const [status, setStatus] = useState<RowStatus>({ kind: "pending" });

  async function approve() {
    setStatus({ kind: "approved" });
    await recordDecision(item.problemId, "approved");
  }

  async function reject(reason: RejectReason) {
    setStatus({ kind: "rejected", reason });
    await recordDecision(item.problemId, "rejected", reason);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{item.subject}</Badge>
          {item.unit && <Badge variant="secondary">{item.unit}</Badge>}
          <Badge variant="secondary">{item.topic}</Badge>
          <Badge variant="outline">
            {item.difficultyLevel} · {MODE_LABEL[item.difficultyMode] ?? item.difficultyMode}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 원 오답 대조 */}
        <SourceContrast item={item} />

        {/* 겨냥 약점 */}
        {item.targetsWrongReason.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[var(--color-text-muted)]">
              겨냥 약점
            </span>
            {item.targetsWrongReason.map((t) => (
              <Badge key={t} variant="default" className="font-normal">
                {t}
              </Badge>
            ))}
          </div>
        )}

        {/* 생성된 문항 */}
        <div className="rounded-md border border-[var(--color-border)] p-3 space-y-2">
          <CardTitle className="text-sm">생성 문항</CardTitle>
          <p className="text-sm text-[var(--color-text-default)]">
            <MathRenderer content={item.stem} format="latex" />
          </p>
          {item.choices && item.choices.length > 0 && (
            <ol className="list-decimal pl-5 space-y-1 text-sm text-[var(--color-text-default)]">
              {item.choices.map((c, i) => (
                <li key={i}>
                  <MathRenderer content={c} format="latex" />
                </li>
              ))}
            </ol>
          )}
          <p className="text-sm">
            <span className="font-semibold text-[var(--color-text-muted)]">
              정답:{" "}
            </span>
            <MathRenderer content={item.answer} format="latex" />
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            <span className="font-semibold">해설: </span>
            <MathRenderer content={item.explanation} format="latex" />
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-2">
        {status.kind === "pending" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={approve}>
              승인
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setStatus({ kind: "rejecting" })}
            >
              반려
            </Button>
          </div>
        )}

        {status.kind === "rejecting" && (
          <div className="space-y-2">
            <p className="text-xs text-[var(--color-text-muted)]">
              반려 사유를 선택하세요
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REJECT_REASONS.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant="outline"
                  onClick={() => reject(r)}
                >
                  {r}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatus({ kind: "pending" })}
              >
                취소
              </Button>
            </div>
          </div>
        )}

        {status.kind === "approved" && (
          <Badge variant="default" className="w-fit">
            ✓ 승인됨
          </Badge>
        )}

        {status.kind === "rejected" && (
          <Badge variant="destructive" className="w-fit">
            반려됨 · {status.reason}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}

export function GeneratedProblemReviewList({
  items,
}: {
  items: GeneratedProblemReviewItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Mascot mood="sleep" size="xl" />
        <p className="text-sm font-semibold text-[var(--color-text-strong)]">
          아직 검토할 생성 문제가 없어요
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          학생이 스샷을 올리면 순공이가 약점을 겨냥한 변형 문제를 만들어 올게요.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.problemId}>
          <ReviewCard item={item} />
        </li>
      ))}
    </ul>
  );
}
