"use client";
import { useState } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (!error) setSent(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <Mascot mood="cheer" size="xl" />
      <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
        순공대장에 오신 걸 환영해요
      </h1>

      {sent ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center max-w-xs">
          메일함을 확인해주세요.
          <br />
          링크를 클릭하면 바로 입장됩니다.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            className="w-full h-12 px-4 rounded-xl border border-[var(--color-border-default)] text-sm focus:outline-none focus:border-[var(--color-mint-500)]"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
          >
            {loading ? "전송 중…" : "매직 링크 받기"}
          </Button>
        </form>
      )}
    </div>
  );
}
