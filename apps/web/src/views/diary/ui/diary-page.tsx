import { Mascot } from "@/shared/ui/mascot";
import {
  MOCK_DIARY_TODAY,
  MOCK_DIARY_ENTRIES,
  type DiaryEntry,
} from "@/shared/mocks/diary";

function StatChip({ value, unit, label }: { value: number; unit: string; label: string }) {
  return (
    <div className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] px-3 py-2 text-center">
      <div className="text-lg font-extrabold leading-none text-[var(--color-text-strong)]">
        {value}
        <span className="text-xs font-semibold text-[var(--color-text-muted)]"> {unit}</span>
      </div>
      <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">{label}</div>
    </div>
  );
}

function TimelineEntry({ entry }: { entry: DiaryEntry }) {
  return (
    <li className="relative pl-6">
      {/* 타임라인 점 + 선 */}
      <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[var(--color-mint-500)] border-2 border-[var(--color-bg)]" />
      <span className="absolute left-[5px] top-5 bottom-0 w-px bg-[var(--color-border-default)]" />
      <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">{entry.dateLabel}</p>
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-3.5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {entry.subjects.map((s) => (
            <span
              key={s}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-mint-50)] text-[var(--color-mint-700)]"
            >
              {s}
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-text-default)]">{entry.say}</p>
        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-mint-700)]">+{entry.xp} XP</span>
          <span>{entry.minutes}분</span>
          <span>회독 {entry.quests}개</span>
        </div>
      </div>
    </li>
  );
}

export function DiaryPage() {
  const today = MOCK_DIARY_TODAY;

  return (
    <div className="p-4 lg:p-6 max-w-[640px] mx-auto">
      {/* 헤더 — 순공이는 오늘 카드(히어로)에서 화자로 유지하고, 헤더의 장식 마스코트는
          제거한다(SOO-157: 1 뷰포트 = 마스코트 1개). */}
      <header className="mb-5">
        <h1 className="text-lg font-bold text-[var(--color-text-strong)]">순공일지</h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          오늘 무엇을 회독했는지, 순공이가 한 줄로 남겨드려요.
        </p>
      </header>

      {/* 오늘 카드 */}
      <section
        className="rounded-[var(--radius-xl)] border border-[var(--color-mint-300)] bg-[var(--color-mint-50)] p-4 shadow-[var(--shadow-card)] mb-6"
        aria-label="오늘 일지"
      >
        <div className="flex items-start gap-3">
          <Mascot mood="cheer" size="sm" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-[var(--color-mint-700)]">{today.dateLabel}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-default)]">{today.say}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <StatChip value={today.xp} unit="XP" label="오늘 획득" />
          <StatChip value={today.minutes} unit="분" label="순공 시간" />
          <StatChip value={today.quests} unit="개" label="회독 완료" />
        </div>
      </section>

      {/* 지난 기록 타임라인 */}
      <h2 className="text-sm font-bold text-[var(--color-text-strong)] mb-3">지난 기록</h2>
      <ol className="space-y-4">
        {MOCK_DIARY_ENTRIES.map((entry) => (
          <TimelineEntry key={entry.dateLabel} entry={entry} />
        ))}
      </ol>

      <p className="mt-6 text-center text-[11px] text-[var(--color-text-muted)]">
        일지는 현재 예시 기록이에요 · 회독을 시작하면 순공이가 매일 채워줘요
      </p>
    </div>
  );
}
