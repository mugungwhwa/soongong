"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";
import { MascotReaction } from "@/shared/ui/mascot-reaction";

/** 재전송 쿨다운(초) — 잦은 발송 압박 회피(§8 동반자 톤). */
const RESEND_COOLDOWN_SECONDS = 30;

const CALLBACK_ERRORS: Record<string, string> = {
  missing_code: "인증 링크가 올바르지 않아요. 다시 시도해 주세요.",
  auth_failed: "로그인 링크가 만료됐어요. 새 링크를 받아주세요.",
};

/** open redirect 방지: 내부 경로만 허용, 그 외 홈으로. */
function safeNext(value: string | null): string {
  if (!value) return "/today";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/today";
}

type Step = "email" | "sent";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    const err = searchParams.get("error");
    return err ? (CALLBACK_ERRORS[err] ?? "로그인에 실패했어요. 다시 시도해 주세요.") : null;
  });
  /** 재전송 쿨다운(초). 0이면 재전송 가능. */
  const [cooldown, setCooldown] = useState(0);

  // 1초 틱: 재전송 쿨다운 카운트다운.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const sendLink = useCallback(
    async (targetEmail: string) => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const redirectTo =
          (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin) +
          `/auth/callback?next=${encodeURIComponent(next)}`;

        const { error: err } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: { emailRedirectTo: redirectTo },
        });
        if (err) {
          setError("이메일 전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
          return;
        }
        setStep("sent");
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } catch {
        setError("이메일 전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    },
    [next],
  );

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    await sendLink(email);
  }

  async function handleResend() {
    if (cooldown > 0 || loading) return;
    await sendLink(email);
  }

  function backToEmail() {
    setStep("email");
    setError(null);
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-[var(--color-background)] px-5 py-10">
      <div className="w-full max-w-[26rem] flex flex-col items-center">
        <Logo lang="ko" variant="light" className="h-9 w-auto" priority />

        <section
          className="mt-7 w-full rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-card)] px-6 py-8 shadow-[var(--shadow-card)] sm:px-8"
          aria-live="polite"
        >
          <div className="flex flex-col items-center text-center">
            <MascotReaction mood="cheer" size="xl" priority reason="로그인 환영" />

            {step === "email" ? (
              <>
                <h1 className="mt-4 text-2xl font-bold text-[var(--color-text-strong)]">
                  순공대장에 입장해요
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-default)]">
                  이메일을 적어주면 로그인 링크를 보내드릴게요.
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-4 text-2xl font-bold text-[var(--color-text-strong)]">
                  메일함을 확인해 주세요
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-default)]">
                  <span className="font-semibold text-[var(--color-text-strong)]">
                    {email}
                  </span>
                  <br />
                  주소로 로그인 링크를 보냈어요. 링크를 탭하면 바로 입장해요.
                </p>
              </>
            )}
          </div>

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="mt-6 flex flex-col gap-3">
              <label htmlFor="email" className="sr-only">
                이메일 주소
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                className="h-12 w-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 text-base text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)] transition-colors focus:border-[var(--color-mint-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-300)]"
              />
              {error && (
                <p className="text-sm text-[var(--color-risk-high)]" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={loading || !email}
                className="h-12 w-full rounded-[var(--radius-lg)] bg-[var(--color-primary-cta)] text-base font-semibold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-mint-900)] disabled:opacity-60"
              >
                {loading ? "보내는 중…" : "로그인 링크 받기"}
              </Button>
              <p className="mt-1 text-center text-xs leading-relaxed text-[var(--color-text-muted)]">
                비밀번호가 없어요. 메일함의 링크만으로 안전하게 입장해요.
              </p>
            </form>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              {error && (
                <p className="text-sm text-[var(--color-risk-high)]" role="alert">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <span>메일이 안 왔나요?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className="font-semibold text-[var(--color-mint-900)] underline-offset-2 hover:underline disabled:text-[var(--color-text-muted)] disabled:no-underline"
                >
                  {cooldown > 0 ? `재전송 (${cooldown}s)` : "링크 재전송"}
                </button>
              </div>

              <button
                type="button"
                onClick={backToEmail}
                className="text-center text-xs text-[var(--color-text-muted)] underline-offset-2 hover:underline"
              >
                다른 이메일로 시도하기
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
