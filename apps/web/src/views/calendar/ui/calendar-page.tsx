import { Bell } from "lucide-react";
import { Mascot } from "@/shared/ui/mascot";
import { ReviewCalendar } from "@/widgets/review-calendar";

export function CalendarPage() {
  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <header className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Mascot mood="cheer" size="md" />
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text-strong)]">
              회독 캘린더
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              1/3/7/14일 회독 일정을 한눈에 확인해요
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

      {/* 캘린더 위젯 */}
      <ReviewCalendar />
    </div>
  );
}
