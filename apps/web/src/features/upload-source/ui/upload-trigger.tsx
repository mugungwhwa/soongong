"use client";
import { Button } from "@/shared/ui/button";
import { useTriggerUpload } from "../model/use-trigger-upload";

export function UploadTrigger() {
  const triggerUpload = useTriggerUpload();
  return (
    <Button
      className="bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
      onClick={triggerUpload}
    >
      + 문제 출제하기
    </Button>
  );
}
