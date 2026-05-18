"use client";
import { useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";
import { AnalysisCard } from "./analysis-card";
import {
  useUploadFlow,
  type SourceType,
} from "@/features/upload-source/model/use-upload-flow";

const OPTIONS: { type: SourceType; label: string; icon: string; hint: string }[] = [
  { type: "photo", label: "문제사진", icon: "📸", hint: "교재/시험지 촬영본" },
  { type: "lecture-log", label: "인강기록", icon: "🎬", hint: "수강 후 메모/캡처" },
  { type: "memo", label: "캡처+메모", icon: "📝", hint: "스크린샷+자유 텍스트" },
];

export function UploadSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const flow = useUploadFlow();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleClose(v: boolean) {
    if (!v) flow.reset();
    onOpenChange(v);
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>오늘 뭘 올릴까요?</SheetTitle>
        </SheetHeader>

        {flow.step === "select-type" && (
          <div className="mt-4 space-y-2">
            {OPTIONS.map((o) => (
              <button
                key={o.type}
                onClick={() => flow.pickType(o.type)}
                className="w-full flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] hover:bg-[var(--color-mint-50)] text-left transition"
              >
                <span className="text-2xl">{o.icon}</span>
                <div>
                  <div className="font-semibold">{o.label}</div>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    {o.hint}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {flow.step === "pick-file" && (
          <div className="mt-4 space-y-3 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              파일을 선택하세요 (mock — 어떤 파일이든 같은 결과)
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => flow.uploadFile(e.target.files?.[0] ?? null)}
            />
            <Button
              onClick={() => fileRef.current?.click()}
              className="bg-[var(--color-mint-500)] text-white hover:bg-[var(--color-mint-700)]"
            >
              파일 선택
            </Button>
          </div>
        )}

        {flow.step === "analyzing" && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <Mascot mood="think" size="xl" />
            <p className="text-[var(--color-text-default)]">순공이가 분석 중...</p>
            <div className="w-32 h-1 bg-[var(--color-mint-100)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-mint-500)] animate-pulse"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        )}

        {flow.step === "result" && flow.result && (
          <div className="mt-4 space-y-3">
            <AnalysisCard result={flow.result} />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => flow.reset()}
              >
                수정하기
              </Button>
              <Button
                className="flex-1 bg-[var(--color-mint-500)] text-white hover:bg-[var(--color-mint-700)]"
                onClick={() => handleClose(false)}
              >
                맞아요
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
