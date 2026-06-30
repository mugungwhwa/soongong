"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";
import { MascotReaction } from "@/shared/ui/mascot-reaction";

/** 인증 코드 유효시간(초) — Supabase OTP 기본 만료와 동일 톤(10분). */
const CODE_TTL_SECONDS = 600;
/** 재전송 쿨다운(초) — 잦은 푸시/발송 압박 회피(§8 동반자 톤). */
const RESEND_COOLDOWN_SECONDS = 30;
const CODE_LENGTH = 6;

/** open redirect 방지: 내부 경로만 허용, 그 외 홈으로. */
function safeNext(value: string | null): string {
  if (!value) return "/today";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/today";
}

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Step = "email" | "code";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** 코드 발송 직후 짧게 뜨는 "보냈어요" 확인 피드백. */
  const [justSent, setJustSent] = useState(false);
  /** 남은 코드 유효시간(초). 0이면 만료 상태. */
  const [ttl, setTtl] = useState(0);
  /** 재전송 쿨다운(초). 0이면 재전송 가능. */
  const [cooldown, setCooldown] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);
  const expired = step === "code" && ttl <= 0;

  // 1초 틱: 유효시간·쿨다운 동시 카운트다운.
  useEffect(() => {
    if (step !== "code") return;
    const id = setInterval(() => {
      setTtl((t) => (t > 0 ? t - 1 : 0));
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  // 코드 단계 진입 시 자동 포커스.
  useEffect(() => {
    if (step === "code") codeInputRef.current?.focus();
  }, [step]);

  const sendCode = useCallback(
    async (targetEmail: string) => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { error: err } = await supabase.auth.signInWithOtp({
          email: targetEmail,
        });
        if (err) {
          setError("이메일 전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
          return false;
        }
        setStep("code");
        setCode("");
        setTtl(CODE_TTL_SECONDS);
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setJustSent(true);
        window.setTimeout(() => setJustSent(false), 4000);
        return true;
      } catch {
        setError("이메일 전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    await sendCode(email);
  }

  async function handleResend() {
    if (cooldown > 0 || loading) return;
    await sendCode(email);
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== CODE_LENGTH || expired) return;
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
        setCode("");
        codeInputRef.current?.focus();
        return;
      }
      router.push(next);
    } catch {
      setError("인증에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  function backToEmail() {
    setStep("email");
    setCode("");
    setError(null);
    setJustSent(false);
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
                  이메일을 적어주면 6자리 인증 코드를 보내드릴게요.
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
                  주소로 6자리 코드를 보냈어요.
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
                {loading ? "보내는 중…" : "인증 코드 받기"}
              </Button>
              <p className="mt-1 text-center text-xs leading-relaxed text-[var(--color-text-muted)]">
                비밀번호가 없어요. 코드만으로 안전하게 입장해요.
              </p>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="mt-6 flex flex-col gap-3">
              {justSent && !error && (
                <p
                  className="rounded-[var(--radius-md)] bg-[var(--color-mint-50)] px-3 py-2 text-center text-sm font-medium text-[var(--color-mint-900)]"
                  role="status"
                >
                  ✉️ 코드를 보냈어요
                </p>
              )}

              <label htmlFor="code" className="sr-only">
                6자리 인증 코드
              </label>
              <input
                id="code"
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={CODE_LENGTH}
                required
                disabled={expired}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
                }
                placeholder="••••••"
                aria-invalid={Boolean(error)}
                className="h-14 w-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 text-center text-2xl font-bold tracking-[0.5em] text-[var(--color-text-strong)] placeholder:tracking-[0.5em] placeholder:text-[var(--color-text-muted)] transition-colors focus:border-[var(--color-mint-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mint-300)] disabled:opacity-60"
              />

              {/* 상태 라인: 만료 / 오답 / 유효시간 카운트다운 */}
              {expired ? (
                <p
                  className="text-sm text-[var(--color-risk-mid)]"
                  role="alert"
                >
                  코드가 만료됐어요. 새 코드를 받아주세요.
                </p>
              ) : error ? (
                <p className="text-sm text-[var(--color-risk-high)]" role="alert">
                  {error}
                </p>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)]">
                  코드는 {mmss(ttl)} 후 만료돼요.
                </p>
              )}

              <Button
                type="submit"
                disabled={loading || code.length !== CODE_LENGTH || expired}
                className="h-12 w-full rounded-[var(--radius-lg)] bg-[var(--color-primary-cta)] text-base font-semibold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-mint-900)] disabled:opacity-60"
              >
                {loading ? "확인 중…" : "입장하기"}
              </Button>

              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <span>코드가 안 왔나요?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className="font-semibold text-[var(--color-mint-900)] underline-offset-2 hover:underline disabled:text-[var(--color-text-muted)] disabled:no-underline"
                >
                  {cooldown > 0 ? `재전송 (${cooldown}s)` : "코드 재전송"}
                </button>
              </div>

              <button
                type="button"
                onClick={backToEmail}
                className="text-center text-xs text-[var(--color-text-muted)] underline-offset-2 hover:underline"
              >
                다른 이메일로 시도하기
              </button>
            </form>
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
