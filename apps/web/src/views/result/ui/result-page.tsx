"use client";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { ResultRewards } from "@/widgets/result-rewards/ui/result-rewards";
import { ROUTES } from "@/shared/config/routes";

export function ResultPage() {
  return (
    <div className="mx-auto max-w-xl p-4 lg:p-8 space-y-6">
      <ResultRewards earnedXp={60} />
      <Link href={ROUTES.today}>
        <Button variant="outline" className="w-full">
          홈으로
        </Button>
      </Link>
    </div>
  );
}
