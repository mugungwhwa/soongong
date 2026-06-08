"use client";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { PhotoUpload } from "./photo-upload";
import { LectureLogForm } from "./lecture-log-form";
import { CaptureNoteForm } from "./capture-note-form";
import { ManualTextForm } from "./manual-text-form";

type Mode = "menu" | "photo" | "lecture" | "capture" | "manual";

const OPTIONS: { mode: Mode; icon: string; label: string; hint: string; muted?: boolean }[] = [
  { mode: "photo",   icon: "📸", label: "문제사진 업로드",           hint: "풀었던 문제 사진" },
  { mode: "lecture", icon: "🎬", label: "인강 시청 기록",            hint: "강의명 + 단원 입력" },
  { mode: "capture", icon: "📝", label: "캡처 + 메모",               hint: "헷갈린 장면 1장" },
  { mode: "manual",  icon: "⌨️", label: "직접 입력 (사진 어려울 때)", hint: "텍스트로 문제 입력", muted: true },
];

export function UploadSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>("menu");

  function handleClose(v: boolean) {
    if (!v) setMode("menu");
    onOpenChange(v);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle>공부한 흔적 추가</SheetTitle>
        </SheetHeader>

        {mode === "menu" && (
          <div className="space-y-2">
            {OPTIONS.map((o) => (
              <button
                key={o.mode}
                onClick={() => setMode(o.mode)}
                className={`w-full flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] hover:bg-[var(--color-mint-50)] text-left transition${o.muted ? " opacity-60" : ""}`}
              >
                <span className="text-2xl">{o.icon}</span>
                <div>
                  <div className="font-semibold">{o.label}</div>
                  <div className="text-sm text-[var(--color-text-muted)]">{o.hint}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {mode === "photo"   && <PhotoUpload    onBack={() => setMode("menu")} />}
        {mode === "lecture" && <LectureLogForm onBack={() => setMode("menu")} />}
        {mode === "capture" && <CaptureNoteForm onBack={() => setMode("menu")} />}
        {mode === "manual"  && <ManualTextForm  onBack={() => setMode("menu")} />}
      </SheetContent>
    </Sheet>
  );
}
