"use client";

import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  MOCK_ADMIN_QUEUE,
  type AdminReviewItem,
} from "@/shared/mocks/admin-queue";
import { createClient } from "@/shared/lib/supabase/client";
import { ErrorReportButton } from "@/features/admin-review";

type Decision = "approved" | "modified" | "rejected";

async function recordAuditLog(
  itemId: string,
  decision: Decision,
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const actionMap: Record<Decision, string> = {
    approved: "approve",
    rejected: "reject",
    modified: "correct",
  };

  await supabase.from("audit_logs").insert({
    actor_id: user?.id ?? null,
    actor_role: "reviewer",
    action: actionMap[decision],
    target_table: "parsed_learning_objects",
    target_id: itemId,
    diff: { decision },
  });
}

export function AdminReviewList() {
  const [items, setItems] = useState<AdminReviewItem[]>(MOCK_ADMIN_QUEUE);

  async function act(itemId: string, decision: Decision) {
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, status: decision } : i)),
    );
    // audit_logs 기록 — DB trigger 없이도 DoD 검증 가능
    await recordAuditLog(itemId, decision);
  }

  return (
    <div className="space-y-3">
      {items.map((i) => (
        <Card key={i.itemId} className="p-4 flex items-center gap-4">
          <div className="text-3xl">{i.thumbnailPlaceholder}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span>{i.studentMaskedId}</span> · <Badge>{i.subject}</Badge>
            </div>
            <div className="font-semibold">{i.detectedTopic}</div>
            <div className="text-xs">
              신뢰도 {(i.confidenceScore * 100).toFixed(0)}%
            </div>
          </div>
          {i.status === "pending" ? (
            <div className="flex gap-1 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => act(i.itemId, "modified")}
              >
                수정
              </Button>
              <Button size="sm" onClick={() => act(i.itemId, "approved")}>
                승인
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => act(i.itemId, "rejected")}
              >
                폐기
              </Button>
              <ErrorReportButton
                targetTable="parsed_learning_objects"
                targetId={i.itemId}
              />
            </div>
          ) : (
            <Badge
              variant={
                i.status === "approved"
                  ? "default"
                  : i.status === "rejected"
                    ? "destructive"
                    : "secondary"
              }
            >
              {i.status === "approved"
                ? "승인됨"
                : i.status === "rejected"
                  ? "폐기됨"
                  : "수정됨"}
            </Badge>
          )}
        </Card>
      ))}
    </div>
  );
}
