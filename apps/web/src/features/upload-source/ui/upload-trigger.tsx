"use client";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { UploadSheet } from "@/widgets/upload-sheet/ui/upload-sheet";

export function UploadTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        className="bg-[var(--color-mint-500)] text-white hover:bg-[var(--color-mint-700)]"
        onClick={() => setOpen(true)}
      >
        + 문제 출제하기
      </Button>
      <UploadSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
