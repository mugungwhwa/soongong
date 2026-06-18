import Link from "next/link";
import { GeneratedProblemReviewList } from "@/features/generated-problem-review";
import type { GeneratedProblemReviewItem } from "@/entities/generated-problem";

export function AdminGeneratedPage({
  items,
  usingMock,
}: {
  items: GeneratedProblemReviewItem[];
  usingMock: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl p-4 lg:p-8 space-y-4">
      <header className="space-y-1">
        <Link
          href="/admin"
          className="text-xs text-[var(--color-text-muted)] hover:underline"
        >
          ← AI 분석 검수
        </Link>
        <h1 className="text-xl font-bold text-[var(--color-text-strong)]">
          생성 문제 검수
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          약점을 겨냥해 만든 변형 문항을 원 오답과 대조해 승인/반려합니다.
          {usingMock && (
            <span className="ml-1 text-[var(--color-text-muted)]">
              (샘플 데이터)
            </span>
          )}
        </p>
      </header>
      <GeneratedProblemReviewList items={items} />
    </div>
  );
}
