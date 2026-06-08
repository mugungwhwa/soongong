"use client";
import { useState } from "react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { MOCK_ADMIN_QUEUE } from "@/shared/mocks/admin-queue";
import type { AdminReviewItem } from "@/shared/contracts";

export function AdminReviewList() {
  const [items, setItems] = useState<AdminReviewItem[]>(MOCK_ADMIN_QUEUE);

  function act(itemId: string, status: AdminReviewItem["status"]) {
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, status } : i)),
    );
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
            <div className="flex gap-1">
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
            </div>
          ) : (
            <Badge>{i.status}</Badge>
          )}
        </Card>
      ))}
    </div>
  );
}
