"use client";
import { useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/shared/lib/supabase/client";
import { createSource, uploadSourceFile, runIntakePipeline } from "@/entities/source";
import { ROUTES } from "@/shared/config/routes";
import { buildLoginGateUrl } from "../model/login-gate";

type AnalysisStep = "idle" | "upload" | "ocr" | "quest" | "done";

const STEP_LABELS: Record<AnalysisStep, string> = {
  idle: "분석 시작",
  upload: "사진 업로드 중...",
  ocr: "문제 인식 중...",
  quest: "회독 퀘스트 생성 중...",
  done: "완료!",
};

const ORDERED_STEPS: AnalysisStep[] = ["upload", "ocr", "quest"];

export function PhotoUpload({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
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
      if (!user) {
        // 입구 게이트가 1차 방어. 여기 도달은 촬영 중 세션 만료 등 예외 케이스.
        // 막다른 에러 대신 로그인으로 보내고, 완료 후 시트를 다시 연다(두 경로 동일 동작).
        router.push(buildLoginGateUrl(pathname));
        return;
      }

      const rawUrl = await uploadSourceFile(user.id, file);
      if (!rawUrl) throw new Error("업로드 실패");

      const source = await createSource({ source_type: "problem_photo", raw_url: rawUrl });
      if (!source) throw new Error("저장 실패");

      // compliance + OCR 단계. generate-problem은 내부에서 keepalive로 백그라운드 진행.
      setStep("ocr");
      await runIntakePipeline(source.source_id);
      // 회독 퀘스트 생성 완료 — 명확한 완료 상태를 잠깐 보여준 뒤 오늘의 회독으로 이동.
      // 업로드는 오늘 화면 위 모달이라 router.push는 목록을 재조회하지 않는다.
      // 하드 내비게이션으로 오늘의 회독 목록이 새로고침 없이 최신 데이터로 갱신되게 한다.
      setStep("quest");
      await new Promise((resolve) => setTimeout(resolve, 400));
      setStep("done");
      setTimeout(() => window.location.assign(ROUTES.today), 1400);
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
        className="border-2 border-dashed border-[var(--color-mint)] rounded-xl p-8 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <p className="text-muted-foreground text-sm">사진을 탭해서 선택하세요 (최대 5MB)</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          // 모바일: 후면 카메라 직행(SOO-26 촬영 1단계). 데스크톱은 capture를 무시 → 기존 파일 선택 유지.
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {loading && step !== "done" && (
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

      {step === "done" && (
        <div className="space-y-3 rounded-xl border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 p-4 text-center">
          <CheckCircle2 size={28} className="mx-auto text-[var(--color-primary)]" />
          <div>
            <p className="font-bold text-foreground">회독 퀘스트로 만들었어요!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              오늘의 회독에 담았어요 · 잠시 후 이동합니다
            </p>
          </div>
          <Button className="w-full" onClick={() => window.location.assign(ROUTES.today)}>
            오늘의 회독 보러가기
          </Button>
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {step !== "done" && (
        <Button
          className="w-full"
          disabled={!file || loading}
          onClick={handleSubmit}
        >
          {loading && <Loader2 className="animate-spin mr-2" size={16} />}
          {loading ? STEP_LABELS[step] : "분석 시작"}
        </Button>
      )}
    </div>
  );
}
