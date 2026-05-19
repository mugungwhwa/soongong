"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Mascot } from "@/shared/ui/mascot";

export function LoginPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <Mascot mood="cheer" size="xl" />
      <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
        순공대장에 오신 걸 환영해요
      </h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        와꾸 데모 — 로그인 없이 진입
      </p>
      <Button
        className="bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
        onClick={() => router.push("/today")}
      >
        시작하기 (더미)
      </Button>
    </div>
  );
}
