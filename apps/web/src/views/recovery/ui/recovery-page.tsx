"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Mascot } from "@/shared/ui/mascot";
import { MOCK_VARIANTS } from "@/shared/mocks/recovery-variants";
import type { VariantTier } from "@/shared/contracts";
import { ROUTES } from "@/shared/config/routes";

export function RecoveryPage({ objectId }: { objectId: string }) {
  const router = useRouter();
  const [activeTier, setActiveTier] = useState<VariantTier>("V1");
  const active = MOCK_VARIANTS.find((v) => v.tier === activeTier)!;

  return (
    <div className="mx-auto max-w-2xl p-4 lg:p-8 space-y-4">
      <header className="flex items-center gap-3">
        <Mascot mood="comfort" size="md" />
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-strong)]">
            오답회수 모드
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {objectId} · 변형으로 다시 도전
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {MOCK_VARIANTS.map((v) => (
          <button key={v.tier} onClick={() => setActiveTier(v.tier)}>
            <Badge
              className={
                activeTier === v.tier
                  ? "bg-[var(--color-mint-500)] text-[var(--color-text-inverse)]"
                  : ""
              }
            >
              {v.tier}
            </Badge>
          </button>
        ))}
      </div>

      <Card className="p-5 space-y-3">
        <div className="text-sm text-[var(--color-text-muted)]">
          {active.description}
        </div>
        <p className="text-base text-[var(--color-text-default)]">
          {active.prompt}
        </p>
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-[var(--color-mint-500)] text-[var(--color-text-inverse)] hover:bg-[var(--color-mint-700)]"
            onClick={() => router.push(ROUTES.result)}
          >
            풀기 완료 (+30 XP)
          </Button>
          <Button variant="outline" onClick={() => router.push(ROUTES.today)}>
            나가기
          </Button>
        </div>
      </Card>
    </div>
  );
}
