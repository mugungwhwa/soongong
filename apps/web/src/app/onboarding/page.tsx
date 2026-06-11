"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";
import { ReviewPromiseReveal } from "@/features/onboarding-promise";
import { SUBJECTS } from "@/shared/contracts";
import type { Subject } from "@/shared/contracts";

type Step = "birth" | "subjects" | "upload";
/** 업로드 스텝 내부 연출 단계 — 3스텝 구조는 유지, 마지막 스텝 안에서만 전환. */
type UploadPhase = "idle" | "analyzing" | "reveal";

const STEP_INDEX: Record<Step, number> = { birth: 0, subjects: 1, upload: 2 };
const SUBJECT_ICONS: Record<Subject, string> = { 수학: "📐", 영어: "📖", 국어: "📚" };

function ProgressBar({ current }: { current: Step }) {
  const idx = STEP_INDEX[current];
  return (
    <div className="flex gap-1.5 w-full max-w-xs mx-auto mb-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
            i <= idx ? "bg-[var(--color-mint-500)]" : "bg-[var(--color-bg-sunken)]"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("birth");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 미리보기 blob URL 해제 — 파일 변경 시 이전 URL, 언마운트 시 현재 URL을 revoke (메모리 누수 방지).
  useEffect(() => {
    if (!uploadPreview) return;
    return () => URL.revokeObjectURL(uploadPreview);
  }, [uploadPreview]);

  async function handleBirthSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!birthYear) return;
    const age = new Date().getFullYear() - Number(birthYear);
    if (age < 14) {
      setError("만 14세 미만은 보호자 동의 후 가입할 수 있어요.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await supabase
      .from("users")
      .update({ birth_year: Number(birthYear) })
      .eq("id", user.id);
    setLoading(false);
    setError(null);
    setStep("subjects");
  }

  function toggleSubject(s: Subject) {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("5MB 이하 사진만 업로드할 수 있어요.");
      return;
    }
    setHasFile(true);
    setUploadPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function handleAnalyze() {
    if (!hasFile) return;
    setUploadPhase("analyzing");
    // mock: 1.6s 분석 시뮬레이션 (실제 OCR은 P3). 끝나면 "복습 스케줄 약속" 클라이맥스로.
    await new Promise((r) => setTimeout(r, 1600));
    setUploadPhase("reveal");
  }

  // ── Step 1: birth ──────────────────────────────────────
  if (step === "birth") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <ProgressBar current="birth" />
        <Mascot mood="cheer" size="xl" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
            순공이가 인사할게요
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            생년을 알려주세요. 회독퀘스트를 맞춰드려요.
          </p>
        </div>
        <form onSubmit={handleBirthSubmit} className="w-full max-w-xs space-y-3">
          <input
            type="number"
            min={1990}
            max={new Date().getFullYear()}
            required
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value) || "")}
            className="w-full h-12 px-4 rounded-xl border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-mint-500)]"
            placeholder="2007"
          />
          {error && (
            <p className="text-xs text-[var(--color-risk-high)]">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
          >
            {loading ? "저장 중…" : "다음 →"}
          </Button>
        </form>
      </div>
    );
  }

  // ── Step 2: subjects ───────────────────────────────────
  if (step === "subjects") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <ProgressBar current="subjects" />
        <Mascot mood="cheer" size="xl" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
            어떤 과목을 공부할 건가요?
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            여러 개 선택할 수 있어요
          </p>
        </div>
        <div className="w-full max-w-xs flex flex-col gap-3">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSubject(s)}
              className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border-2 transition-all text-left font-semibold ${
                selectedSubjects.includes(s)
                  ? "border-[var(--color-mint-500)] bg-[var(--color-mint-50)] text-[var(--color-mint-700)]"
                  : "border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-default)]"
              }`}
            >
              <span className="text-2xl">{SUBJECT_ICONS[s]}</span>
              <span>{s}</span>
              {selectedSubjects.includes(s) && (
                <span className="ml-auto text-[var(--color-mint-500)]">✓</span>
              )}
            </button>
          ))}
        </div>
        <div className="w-full max-w-xs">
          <Button
            className="w-full bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)] disabled:opacity-40"
            disabled={selectedSubjects.length === 0}
            onClick={() => setStep("upload")}
          >
            다음 →
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 3: upload (idle → analyzing → reveal) ─────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <ProgressBar current="upload" />

      {uploadPhase === "reveal" ? (
        // 클라이맥스 — "복습 스케줄 약속" 연출
        <ReviewPromiseReveal
          previewUrl={uploadPreview}
          onStart={() => router.push("/today?first=1")}
        />
      ) : uploadPhase === "analyzing" ? (
        // 변환 중 — 사진 → 1·3·7·14일 회독으로 나누는 순간
        <div className="w-full max-w-xs flex flex-col items-center gap-5 text-center">
          <Mascot mood="think" size="xl" className="animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
              순공이가 회독 퀘스트를 짜는 중…
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              이 문제를 1·3·7·14일 복습으로 나누고 있어요
            </p>
          </div>
          <div className="flex gap-1.5" role="status" aria-label="분석 중">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-[var(--color-mint-500)] animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      ) : (
        // idle — 첫 사진 업로드
        <>
          <Mascot mood="cheer" size="xl" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
              첫 문제를 찍어봐요! 📸
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              풀었던 문제 사진을 올리면 순공이가 복습 일정으로 약속해줄게요
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <label
              htmlFor="onboarding-upload"
              aria-label="사진 선택"
              className="block border-2 border-dashed border-[var(--color-mint-500)] rounded-xl p-8 text-center cursor-pointer hover:bg-[var(--color-mint-50)] transition focus-within:ring-2 focus-within:ring-[var(--color-mint-500)]"
            >
              {uploadPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadPreview}
                  alt="preview"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl">📷</div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    사진을 탭해서 선택하세요
                  </p>
                </div>
              )}
            </label>
            <input
              id="onboarding-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="sr-only"
              onChange={handleFileChange}
            />

            {error && (
              <p className="text-xs text-[var(--color-risk-high)]">{error}</p>
            )}

            <Button
              className="w-full bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)] disabled:opacity-40"
              disabled={!hasFile}
              onClick={handleAnalyze}
            >
              복습 일정 만들기
            </Button>

            <button
              type="button"
              className="w-full text-sm text-[var(--color-text-muted)] underline underline-offset-2 py-2 hover:text-[var(--color-text-default)] transition"
              onClick={() => router.push("/today?first=1")}
            >
              나중에 하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
