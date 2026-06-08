"use client";

import { useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

export function ErrorReportButton({
  targetTable,
  targetId,
}: {
  targetTable: string;
  targetId: string;
}) {
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("error_reports").insert({
      user_id: user.id,
      target_table: targetTable,
      target_id: targetId,
      reason,
    });
    setSent(true);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setReason("");
      setSent(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          오류 신고
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>오류 신고</DialogTitle>
        {sent ? (
          <p className="text-sm mt-3">
            신고가 접수됐어요. 확인 후 처리합니다.
          </p>
        ) : (
          <div className="space-y-3 mt-3">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="어디가 잘못됐는지 알려주세요..."
              className="w-full rounded-lg border border-input p-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button onClick={submit} disabled={!reason.trim()}>
              신고 보내기
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
