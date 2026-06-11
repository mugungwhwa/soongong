import { Bell } from "lucide-react";
import { Mascot } from "@/shared/ui/mascot";
import { WrongNoteList } from "@/widgets/wrong-note-list";

export function WrongNotesPage() {
  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <header className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Mascot mood="think" size="md" />
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-strong)]">
              오답노트
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              틀린 문제를 다시 풀어 기억을 완성해요
            </p>
          </div>
        </div>

        <button
          aria-label="알림"
          className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] hover:bg-[var(--color-mint-50)] transition flex items-center justify-center"
        >
          <Bell
            size={16}
            strokeWidth={1.5}
            color="var(--color-text-muted)"
            fill="none"
            aria-hidden="true"
          />
        </button>
      </header>

      {/* 오답 리스트 (필터 + 정렬 + 카드 포함) */}
      <WrongNoteList />
    </div>
  );
}
