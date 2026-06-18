import Link from "next/link";
import { AdminReviewList } from "@/widgets/admin-review-list";

export function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 lg:p-8 space-y-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-strong)]">
            AI 분석 검수
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            신뢰도 낮은 분석 결과를 사람이 보정
          </p>
        </div>
        <Link
          href="/admin/generated"
          className="shrink-0 text-sm text-[var(--color-primary-cta)] hover:underline"
        >
          생성 문제 검수 →
        </Link>
      </header>
      <AdminReviewList />
    </div>
  );
}
