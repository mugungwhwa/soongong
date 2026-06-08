"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";

export default function OnboardingPage() {
  const router = useRouter();
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!birthYear) return;

    const age = new Date().getFullYear() - Number(birthYear);
    if (age < 14) {
      setError("만 14세 미만은 보호자 동의 후 가입할 수 있습니다.");
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

    router.push("/today");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <Mascot mood="cheer" size="xl" />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
          순공이가 인사할게요
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          생년을 알려주세요. 회독퀘스트를 맞춰드려요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
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
          {loading ? "저장 중…" : "시작하기"}
        </Button>
      </form>
    </div>
  );
}
