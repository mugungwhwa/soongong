"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Mascot } from "@/shared/ui/mascot";
import { Skeleton } from "@/shared/ui/skeleton";
import { Card } from "@/shared/ui/card";
import type { ReviewQuest, ReviewCycle } from "@/shared/contracts";
import { DayDetailPanel } from "./day-detail-panel";

// ---------------------------------------------------------------------------
// 회독 차수별 점 색상 (등록 토큰만 사용)
// ---------------------------------------------------------------------------
const CYCLE_DOT_COLOR: Record<ReviewCycle, string> = {
  1: "var(--color-mint-300)",
  3: "var(--color-mint-500)",
  7: "var(--color-mint-700)",
  14: "var(--color-mint-900)",
};

// ---------------------------------------------------------------------------
// 더미 데이터 — TODO(P4): Supabase review_quests + 망각엔진 API로 교체.
// 기준: 2026년 6월 (이번 달 기준 상대 날짜 배치)
// ---------------------------------------------------------------------------
function makeDummyQuests(baseYear: number, baseMonth: number): ReviewQuest[] {
  const d = (day: number) =>
    `${baseYear}-${String(baseMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const reg = (day: number) =>
    `${baseYear}-${String(baseMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return [
    {
      id: "rq-1",
      subject: "수학",
      unit: "미적분 · 함수의 극값",
      title: "수학 23번 — 미분 극값 계산",
      cycle: 1,
      scheduledDate: d(1),
      registeredDate: reg(1),
      status: "done",
    },
    {
      id: "rq-2",
      subject: "영어",
      unit: "독해 · 추론",
      title: "영어 34번 — 빈칸 추론",
      cycle: 3,
      scheduledDate: d(2),
      registeredDate: reg(2),
      status: "done",
    },
    {
      id: "rq-3",
      subject: "수학",
      unit: "수열 · 점화식",
      title: "수학 7번 — 등비수열 점화식",
      cycle: 1,
      scheduledDate: d(2),
      registeredDate: reg(2),
      status: "done",
    },
    {
      id: "rq-4",
      subject: "국어",
      unit: "독서 · 과학기술 지문",
      title: "국어 19번 — 비문학 추론",
      cycle: 7,
      scheduledDate: d(3),
      registeredDate: reg(3),
      status: "done",
    },
    {
      id: "rq-5",
      subject: "수학",
      unit: "미적분 · 함수의 극값",
      title: "수학 23번 — 미분 극값 계산",
      cycle: 3,
      scheduledDate: d(4),
      registeredDate: reg(1),
      status: "done",
    },
    {
      id: "rq-6",
      subject: "국어",
      unit: "문학 · 현대시",
      title: "국어 27번 — 화자의 태도 파악",
      cycle: 1,
      scheduledDate: d(4),
      registeredDate: reg(4),
      status: "done",
    },
    {
      id: "rq-7",
      subject: "영어",
      unit: "독해 · 추론",
      title: "영어 34번 — 빈칸 추론",
      cycle: 7,
      scheduledDate: d(7),
      registeredDate: reg(1),
      status: "overdue",
    },
    {
      id: "rq-8",
      subject: "수학",
      unit: "수열 · 점화식",
      title: "수학 7번 — 등비수열 점화식",
      cycle: 3,
      scheduledDate: d(8),
      registeredDate: reg(5),
      status: "overdue",
    },
    {
      id: "rq-9",
      subject: "국어",
      unit: "독서 · 과학기술 지문",
      title: "국어 19번 — 비문학 추론",
      cycle: 14,
      scheduledDate: d(8),
      registeredDate: reg(1),
      status: "overdue",
    },
    {
      id: "rq-10",
      subject: "수학",
      unit: "미적분 · 함수의 극값",
      title: "수학 23번 — 미분 극값 계산",
      cycle: 1,
      scheduledDate: d(10),
      registeredDate: reg(10),
      status: "scheduled",
    },
    {
      id: "rq-11",
      subject: "영어",
      unit: "독해 · 추론",
      title: "영어 34번 — 빈칸 추론",
      cycle: 3,
      scheduledDate: d(10),
      registeredDate: reg(7),
      status: "scheduled",
    },
    {
      id: "rq-12",
      subject: "국어",
      unit: "문학 · 현대시",
      title: "국어 27번 — 화자의 태도 파악",
      cycle: 7,
      scheduledDate: d(12),
      registeredDate: reg(5),
      status: "scheduled",
    },
    {
      id: "rq-13",
      subject: "수학",
      unit: "수열 · 점화식",
      title: "수학 7번 — 등비수열 점화식",
      cycle: 1,
      scheduledDate: d(12),
      registeredDate: reg(12),
      status: "scheduled",
    },
    {
      id: "rq-14",
      subject: "수학",
      unit: "미적분 · 함수의 극값",
      title: "수학 23번 — 미분 극값 계산",
      cycle: 14,
      scheduledDate: d(15),
      registeredDate: reg(1),
      status: "scheduled",
    },
    {
      id: "rq-15",
      subject: "영어",
      unit: "독해 · 추론",
      title: "영어 34번 — 빈칸 추론",
      cycle: 1,
      scheduledDate: d(19),
      registeredDate: reg(19),
      status: "scheduled",
    },
    {
      id: "rq-16",
      subject: "국어",
      unit: "독서 · 과학기술 지문",
      title: "국어 19번 — 비문학 추론",
      cycle: 3,
      scheduledDate: d(19),
      registeredDate: reg(16),
      status: "scheduled",
    },
    {
      id: "rq-17",
      subject: "수학",
      unit: "수열 · 점화식",
      title: "수학 7번 — 등비수열 점화식",
      cycle: 7,
      scheduledDate: d(22),
      registeredDate: reg(15),
      status: "scheduled",
    },
    {
      id: "rq-18",
      subject: "국어",
      unit: "문학 · 현대시",
      title: "국어 27번 — 화자의 태도 파악",
      cycle: 14,
      scheduledDate: d(26),
      registeredDate: reg(12),
      status: "scheduled",
    },
    {
      id: "rq-19",
      subject: "수학",
      unit: "미적분 · 함수의 극값",
      title: "수학 23번 — 미분 극값 계산",
      cycle: 7,
      scheduledDate: d(30),
      registeredDate: reg(23),
      status: "scheduled",
    },
  ];
}

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------
function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0=일, 6=토
}

// ---------------------------------------------------------------------------
// 서브컴포넌트: 스켈레톤
// ---------------------------------------------------------------------------
function ReviewCalendarSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-10 rounded-[var(--radius-lg)]" />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => (
          <Skeleton key={i} className="h-12 rounded-[var(--radius-md)]" />
        ))}
      </div>
      <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 서브컴포넌트: 빈 상태
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <Mascot mood="cheer" size="lg" />
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-[var(--color-text-strong)]">
          이번 달 회독 퀘스트가 없어요!
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          오답노트에서 문제를 등록하면 회독 일정이 잡혀요
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 서브컴포넌트: 이번 주 요약 스탯 카드
// ---------------------------------------------------------------------------
function WeekStatsCard({
  doneCount,
  todayCount,
  streak,
}: {
  doneCount: number;
  todayCount: number;
  streak: number;
}) {
  return (
    <Card className="p-3">
      <div className="grid grid-cols-3 divide-x divide-[var(--color-border-default)]">
        <div className="flex flex-col items-center gap-0.5 px-2">
          <span
            className="text-xl font-bold"
            style={{ color: "var(--color-mint-500)" }}
          >
            {doneCount}
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            이번 달 완료
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-2">
          <span
            className="text-xl font-bold"
            style={{ color: "var(--color-mint-700)" }}
          >
            {todayCount}
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            오늘 예정
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-2">
          <span
            className="text-xl font-bold flex items-center gap-0.5"
            style={{ color: "var(--color-risk-mid)" }}
          >
            <Flame size={16} strokeWidth={1.5} aria-hidden="true" />
            {streak}
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            연속 일수
          </span>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 서브컴포넌트: 차수별 범례
// ---------------------------------------------------------------------------
function CycleLegend() {
  const items: { label: string; color: string }[] = [
    { label: "1일차", color: "var(--color-mint-300)" },
    { label: "3일차", color: "var(--color-mint-500)" },
    { label: "7일차", color: "var(--color-mint-700)" },
    { label: "14일차", color: "var(--color-mint-900)" },
    { label: "기한초과", color: "var(--color-risk-high)" },
  ];
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--color-text-muted)]">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------------
interface Props {
  /** TODO(P4): isLoading / isError는 실데이터 훅 연동 후 활성화. */
  isLoading?: boolean;
  isError?: boolean;
}

export function ReviewCalendar({ isLoading = false, isError = false }: Props) {
  // 하이드레이션 안전: 마운트 후 today 확정
  const [today, setToday] = useState<Date | null>(null);
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(5); // 0-indexed: 5 = 6월
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(toDateKey(now));
  }, []);

  const quests = useMemo(
    () => makeDummyQuests(viewYear, viewMonth + 1),
    [viewYear, viewMonth],
  );

  // 날짜 → 퀘스트 맵
  const questsByDate = useMemo(() => {
    const map: Record<string, ReviewQuest[]> = {};
    for (const q of quests) {
      if (!map[q.scheduledDate]) map[q.scheduledDate] = [];
      map[q.scheduledDate].push(q);
    }
    return map;
  }, [quests]);

  const todayKey = today ? toDateKey(today) : null;

  // 스탯 계산
  const doneCount = quests.filter((q) => q.status === "done").length;
  const todayCount = todayKey
    ? (questsByDate[todayKey]?.length ?? 0)
    : 0;
  const streak = 5; // TODO(P4): 실데이터 연동 후 계산

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }

  function goToday() {
    if (today) {
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
      setSelectedDate(toDateKey(today));
    }
  }

  const selectedQuests = selectedDate
    ? (questsByDate[selectedDate] ?? [])
    : [];

  if (isLoading) return <ReviewCalendarSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Mascot mood="comfort" size="md" />
        <p className="text-sm text-[var(--color-text-muted)]">
          캘린더를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (quests.length === 0) return <EmptyState />;

  const monthLabel = `${viewYear}년 ${viewMonth + 1}월`;
  const DOW_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

  // 그리드 셀 배열 (앞쪽 빈 칸 + 날짜 셀 + 뒤쪽 빈 칸)
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  return (
    <div className="space-y-3">
      {/* 이번 달 요약 스탯 */}
      <WeekStatsCard
        doneCount={doneCount}
        todayCount={todayCount}
        streak={streak}
      />

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            aria-label="이전 달"
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors hover:bg-[var(--color-mint-50)]"
            style={{ borderColor: "var(--color-border-default)" }}
          >
            <ChevronLeft
              size={16}
              strokeWidth={1.5}
              style={{ color: "var(--color-text-muted)" }}
            />
          </button>
          <span
            className="text-base font-semibold"
            style={{ color: "var(--color-text-strong)" }}
          >
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            aria-label="다음 달"
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors hover:bg-[var(--color-mint-50)]"
            style={{ borderColor: "var(--color-border-default)" }}
          >
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              style={{ color: "var(--color-text-muted)" }}
            />
          </button>
        </div>
        <button
          onClick={goToday}
          className="px-3 py-1 rounded-[var(--radius-pill)] text-xs font-medium border transition-colors hover:bg-[var(--color-mint-50)]"
          style={{
            borderColor: "var(--color-mint-500)",
            color: "var(--color-mint-700)",
          }}
        >
          오늘
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7">
        {DOW_LABELS.map((label, idx) => (
          <div
            key={label}
            className="text-center text-[11px] font-medium py-1"
            style={{
              color:
                idx === 0
                  ? "var(--color-risk-high)"
                  : idx === 6
                    ? "var(--color-mint-500)"
                    : "var(--color-text-muted)",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: totalCells }, (_, idx) => {
          const dayNum = idx - firstDow + 1;
          const isValid = dayNum >= 1 && dayNum <= daysInMonth;
          if (!isValid) {
            return <div key={idx} className="h-12" />;
          }
          const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const dayQuests = questsByDate[dateKey] ?? [];
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const col = idx % 7;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(dateKey)}
              className="h-12 flex flex-col items-center justify-start pt-1 gap-0.5 rounded-[var(--radius-md)] transition-colors"
              style={{
                background: isSelected
                  ? "var(--color-mint-50)"
                  : "transparent",
              }}
            >
              {/* 날짜 숫자 */}
              <span
                className="text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full"
                style={{
                  background: isToday ? "var(--color-mint-500)" : "transparent",
                  color: isToday
                    ? "var(--color-text-inverse)"
                    : col === 0
                      ? "var(--color-risk-high)"
                      : col === 6
                        ? "var(--color-mint-500)"
                        : "var(--color-text-default)",
                  fontWeight: isToday ? 700 : undefined,
                }}
              >
                {dayNum}
              </span>
              {/* 회독 점 배지 */}
              <div className="flex gap-[2px] flex-wrap justify-center min-h-[6px]">
                {dayQuests.slice(0, 4).map((q) => (
                  <span
                    key={q.id}
                    className="inline-block w-[5px] h-[5px] rounded-full"
                    style={{
                      background:
                        q.status === "overdue"
                          ? "var(--color-risk-high)"
                          : CYCLE_DOT_COLOR[q.cycle],
                    }}
                  />
                ))}
                {dayQuests.length > 4 && (
                  <span
                    className="text-[9px] leading-none"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    +{dayQuests.length - 4}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 차수별 범례 */}
      <CycleLegend />

      {/* 날짜 선택 → 하단 패널 */}
      {selectedDate && (
        <DayDetailPanel date={selectedDate} quests={selectedQuests} />
      )}
    </div>
  );
}
