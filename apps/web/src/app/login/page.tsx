"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";

function safeNext(value: string | null): string {
  if (!value) return "/today";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/today";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({ email });
      if (err) {
        setError("이메일 전송에 실패했어요. 다시 시도해 주세요.");
      } else {
        setStep("code");
      }
    } catch {
      setError("이메일 전송에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (err) {
        setError("코드가 올바르지 않아요. 다시 확인해 주세요.");
      } else {
        router.push(next);
      }
    } catch {
      setError("인증에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <Mascot mood="cheer" size="xl" />

      {step === "email" ? (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
              순공대장 입장
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              이메일로 인증 코드를 받아요
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="w-full max-w-xs space-y-3">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-full h-12 px-4 rounded-xl border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-mint-500)]"
            />
            {error && (
              <p className="text-xs text-[var(--color-risk-high)]">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
            >
              {loading ? "보내는 중…" : "인증 코드 받기"}
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="text-center space-y-2 max-w-xs">
            <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
              코드를 입력해 주세요 ✉️
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              <span className="font-medium text-[var(--color-text-default)]">
                {email}
              </span>
              로 6자리 코드를 보냈어요.
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="w-full max-w-xs space-y-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full h-12 px-4 rounded-xl border border-[var(--color-border-default)] text-sm text-center tracking-widest focus:outline-none focus:border-[var(--color-mint-500)]"
            />
            {error && (
              <p className="text-xs text-[var(--color-risk-high)]">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
            >
              {loading ? "확인 중…" : "로그인"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="w-full text-xs text-[var(--color-text-muted)] underline"
            >
              이메일 다시 입력하기
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
