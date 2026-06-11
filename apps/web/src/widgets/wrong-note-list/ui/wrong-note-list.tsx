"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";
import { Mascot } from "@/shared/ui/mascot";
import type { WrongNote } from "@/shared/contracts";
import { SUBJECTS } from "@/shared/contracts";
import { WrongNoteCard } from "./wrong-note-card";
import { SubjectIcon } from "./subject-icon";

// ---------------------------------------------------------------------------
// 더미 데이터 — TODO(P4): Supabase wrong_notes + 망각엔진 API로 교체.
// ---------------------------------------------------------------------------
const DUMMY_WRONG_NOTES: WrongNote[] = [
  {
    id: "wn-1",
    subject: "수학",
    unit: "미적분 · 함수의 극값",
    title: "수학 23번 — 미분 극값 계산",
    memoryHp: 2,
    riskLevel: "high",
    lastWrongAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    isOverdue: true,
    recoveryQuestId: null,
  },
  {
    id: "wn-2",
    subject: "영어",
    unit: "독해 · 추론",
    title: "영어 34번 — 빈칸 추론",
    memoryHp: 3,
    riskLevel: "mid",
    lastWrongAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    isOverdue: false,
    recoveryQuestId: null,
  },
  {
    id: "wn-3",
    subject: "수학",
    unit: "수열 · 점화식",
    title: "수학 7번 — 등비수열 점화식",
    memoryHp: 4,
    riskLevel: "mid",
    lastWrongAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
    isOverdue: false,
    recoveryQuestId: null,
  },
  {
    id: "wn-4",
    subject: "국어",
    unit: "독서 · 과학기술 지문",
    title: "국어 19번 — 비문학 추론",
    memoryHp: 5,
    riskLevel: "low",
    lastWrongAt: new Date(Date.now() - 14 * 86400_000).toISOString(),
    isOverdue: false,
    recoveryQuestId: null,
  },
  {
    id: "wn-5",
    subject: "국어",
    unit: "문학 · 현대시",
    title: "국어 27번 — 화자의 태도 파악",
    memoryHp: 1,
    riskLevel: "high",
    lastWrongAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    isOverdue: true,
    recoveryQuestId: null,
  },
];

// ---------------------------------------------------------------------------
// 정렬 옵션
// ---------------------------------------------------------------------------
type SortKey = "latest" | "risk" | "hp_asc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "risk", label: "위험도순" },
  { key: "hp_asc", label: "HP 낮은순" },
];

const RISK_RANK: Record<string, number> = { high: 0, mid: 1, low: 2 };

function sortNotes(notes: WrongNote[], sort: SortKey): WrongNote[] {
  return [...notes].sort((a, b) => {
    if (sort === "latest")
      return (
        new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime()
      );
    if (sort === "risk")
      return RISK_RANK[a.riskLevel] - RISK_RANK[b.riskLevel];
    if (sort === "hp_asc") return a.memoryHp - b.memoryHp;
    return 0;
  });
}

// ---------------------------------------------------------------------------
// 스켈레톤
// ---------------------------------------------------------------------------
function WrongNoteListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-24 rounded-[var(--radius-lg)]" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 빈 상태
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <Mascot mood="celebrate" size="lg" />
      <div className="text-center space-y-1">
        <p className="text-base font-semibold text-[var(--color-text-strong)]">
          아직 틀린 문제가 없어요!
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          퀘스트를 풀면 오답이 여기에 쌓여요
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WrongNoteList
// ---------------------------------------------------------------------------
interface Props {
  /**
   * TODO(P4): isLoading / error 상태는 실데이터 훅 연동 후 활성화.
   * 현재는 더미 데이터 사용.
   */
  isLoading?: boolean;
  isError?: boolean;
}

export function WrongNoteList({ isLoading = false, isError = false }: Props) {
  const [activeSubject, setActiveSubject] = useState<string>("전체");
  const [sortKey, setSortKey] = useState<SortKey>("latest");

  const filtered = useMemo(() => {
    const base =
      activeSubject === "전체"
        ? DUMMY_WRONG_NOTES
        : DUMMY_WRONG_NOTES.filter((n) => n.subject === activeSubject);
    return sortNotes(base, sortKey);
  }, [activeSubject, sortKey]);

  if (isLoading) return <WrongNoteListSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Mascot mood="comfort" size="md" />
        <p className="text-sm text-[var(--color-text-muted)]">
          오답 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 과목 필터 칩 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["전체", ...SUBJECTS].map((subj) => (
          <button
            key={subj}
            onClick={() => setActiveSubject(subj)}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-[var(--radius-pill)] text-sm font-medium border transition-colors"
            style={{
              background:
                activeSubject === subj
                  ? "var(--color-mint-500)"
                  : "var(--color-bg-elevated)",
              color:
                activeSubject === subj
                  ? "var(--color-text-inverse)"
                  : "var(--color-text-default)",
              borderColor:
                activeSubject === subj
                  ? "var(--color-mint-500)"
                  : "var(--color-border-default)",
            }}
          >
            {subj !== "전체" && (
              <SubjectIcon
                subject={subj}
                size={14}
                color={
                  activeSubject === subj
                    ? "var(--color-text-inverse)"
                    : "var(--color-mint-700)"
                }
              />
            )}
            {subj}
          </button>
        ))}
      </div>

      {/* 정렬 + 카운트 바 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-muted)]">
          총 <strong className="text-[var(--color-text-default)]">{filtered.length}개</strong> 오답
        </p>
        <div className="relative">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="appearance-none pl-3 pr-7 py-1 text-xs rounded-[var(--radius-sm)] border cursor-pointer"
            style={{
              background: "var(--color-bg-elevated)",
              borderColor: "var(--color-border-default)",
              color: "var(--color-text-default)",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            strokeWidth={1.5}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-muted)" }}
          />
        </div>
      </div>

      {/* 카드 리스트 or 빈 상태 */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((note) => (
            <WrongNoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
