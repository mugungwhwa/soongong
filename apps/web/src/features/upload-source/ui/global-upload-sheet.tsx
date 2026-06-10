"use client";
import { useUploadSheetStore } from "../model/upload-sheet-store";
import { UploadSheet } from "./upload-sheet";

export function GlobalUploadSheet() {
  const open = useUploadSheetStore((s) => s.open);
  const setOpen = useUploadSheetStore((s) => s.setOpen);
  return <UploadSheet open={open} onOpenChange={setOpen} />;
}
