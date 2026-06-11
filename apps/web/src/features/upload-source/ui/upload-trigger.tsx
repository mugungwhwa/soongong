"use client";
import { Button } from "@/shared/ui/button";
import { useUploadSheetStore } from "../model/upload-sheet-store";

export function UploadTrigger() {
  const openSheet = useUploadSheetStore((s) => s.openSheet);
  return (
    <Button
      className="bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
      onClick={openSheet}
    >
      + 문제 출제하기
    </Button>
  );
}
