"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/shared/lib/supabase/client";
import { createSource, uploadSourceFile, runIntakePipeline } from "@/entities/source";

type AnalysisStep = "idle" | "upload" | "ocr" | "quest";

const STEP_LABELS: Record<AnalysisStep, string> = {
  idle: "분석 시작",
  upload: "캡처 업로드 중...",
  ocr: "문제 인식 중...",
  quest: "회독 퀘스트 생성됨 ✓",
};

const ORDERED_STEPS: AnalysisStep[] = ["upload", "ocr", "quest"];

export function CaptureNoteForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [step, setStep] = useState<AnalysisStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const loading = step !== "idle";

  function handleFile(f: File) {
    if (f.size > 5 * 1024 * 1024) {
      setError("5MB 이하 사진만 업로드할 수 있어요.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function handleSubmit() {
    if (!file) return;
    setStep("upload");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const rawUrl = await uploadSourceFile(user.id, file);
      if (!rawUrl) throw new Error("업로드 실패");

      const source = await createSource({
        source_type: "capture_note",
        raw_url: rawUrl,
        metadata: { student_note: note.trim() || undefined },
      });
      if (!source) throw new Error("저장 실패");

      // generate-problem은 내부에서 keepalive로 백그라운드 진행.
      setStep("ocr");
      await runIntakePipeline(source.source_id);
      setStep("quest");

      router.push(`/analysis/${source.source_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했어요.");
      setStep("idle");
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft size={16} /> 뒤로
      </button>

      <div
        className="border-2 border-dashed border-[var(--color-mint)] rounded-xl p-6 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="max-h-36 mx-auto rounded-lg object-contain" />
        ) : (
          <p className="text-muted-foreground text-sm">캡처 이미지를 탭해서 선택하세요</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      <div>
        <Label htmlFor="capture-note">헷갈렸던 부분 메모 (선택)</Label>
        <Textarea
          id="capture-note"
          placeholder="예) 적분 기호 앞 상수 처리를 계속 틀림"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>

      {loading && (
        <div className="space-y-1 py-1">
          {ORDERED_STEPS.map((s) => {
            const idx = ORDERED_STEPS.indexOf(s);
            const curIdx = ORDERED_STEPS.indexOf(step as Exclude<AnalysisStep, "idle">);
            const done = idx < curIdx;
            const active = s === step;
            return (
              <div
                key={s}
                className={`flex items-center gap-2 text-sm transition-opacity ${
                  active ? "opacity-100 font-medium" : done ? "opacity-60" : "opacity-25"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={14} className="shrink-0 text-[var(--color-primary)]" />
                ) : active ? (
                  <Loader2 size={14} className="shrink-0 animate-spin text-[var(--color-primary)]" />
                ) : (
                  <span className="shrink-0 w-3.5 h-3.5" />
                )}
                {STEP_LABELS[s]}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button className="w-full" disabled={!file || loading} onClick={handleSubmit}>
        {loading && <Loader2 className="animate-spin mr-2" size={16} />}
        {loading ? STEP_LABELS[step] : "분석 시작"}
      </Button>
    </div>
  );
}
