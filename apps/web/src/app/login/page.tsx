"use client";

import { useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo =
      (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin) +
      "/auth/callback";

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (err) {
      setError("이메일 전송에 실패했어요. 다시 시도해 주세요.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <Mascot mood="cheer" size="xl" />

      {sent ? (
        <div className="text-center space-y-2 max-w-xs">
          <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
            이메일을 확인해 주세요 ✉️
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-text-default)]">
              {email}
            </span>
            로 로그인 링크를 보냈어요. 링크를 탭하면 바로 입장해요.
          </p>
        </div>
      ) : (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
              순공대장 입장
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              이메일로 로그인 링크를 받아요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
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
              {loading ? "보내는 중…" : "로그인 링크 받기"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
