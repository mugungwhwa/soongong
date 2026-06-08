"use client";

import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { createClient } from "@/shared/lib/supabase/client";
import { ErrorReportButton } from "./error-report-button";

export type PendingItem = {
  object_id: string;
  subject: string;
  unit: string | null;
  topic: string | null;
  difficulty_level: string | null;
  extracted_text: string | null;
  confidence_score: number | null;
};

export function ReviewQueue({ items }: { items: PendingItem[] }) {
  const supabase = createClient();

  async function decide(
    objectId: string,
    decision: "approved" | "rejected",
  ) {
    await supabase
      .from("parsed_learning_objects")
      .update({ reviewer_status: decision })
      .eq("object_id", objectId);
    window.location.reload();
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] py-8 text-center">
        검수 대기 항목이 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.object_id}>
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">{item.subject}</Badge>
                {item.unit && (
                  <Badge variant="secondary">{item.unit}</Badge>
                )}
                {item.difficulty_level && (
                  <Badge variant="outline">{item.difficulty_level}</Badge>
                )}
                {item.confidence_score !== null && (
                  <Badge
                    variant={
                      item.confidence_score < 0.7 ? "destructive" : "default"
                    }
                  >
                    신뢰도 {(item.confidence_score * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[var(--color-text-primary)] line-clamp-4">
                {item.extracted_text ?? "(추출 텍스트 없음)"}
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                size="sm"
                onClick={() => decide(item.object_id, "approved")}
              >
                승인
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => decide(item.object_id, "rejected")}
              >
                폐기
              </Button>
              <ErrorReportButton
                targetTable="parsed_learning_objects"
                targetId={item.object_id}
              />
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}
