"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

export function UploadSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>오늘 뭘 올릴까요?</SheetTitle>
        </SheetHeader>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Day 4에서 3-옵션 시트 + mock 분석 흐름이 들어옵니다.
        </p>
      </SheetContent>
    </Sheet>
  );
}
