"use client";

import {
  Repeat,
  Brain,
  Undo2,
  TrendingUp,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { ALL_EDITABLE_VARS, VAR_KIND, type TokenDraft } from "../model/tokens";

/** 보드 제목 공통 헤더 */
function BoardTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-sunken)] text-[10px] text-[var(--color-text-default)]">
        {n}
      </span>
      {children}
    </h3>
  );
}

function Board({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <BoardTitle n={n}>{title}</BoardTitle>
      {children}
    </section>
  );
}

const ICONS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Repeat, label: "회독루틴" },
  { Icon: Brain, label: "기억관리" },
  { Icon: Undo2, label: "오답회수" },
  { Icon: TrendingUp, label: "순공성장" },
  { Icon: ShieldCheck, label: "망각방어" },
  { Icon: Settings, label: "설정" },
];

const BADGES: { label: string; bg: string; fg: string }[] = [
  { label: "신규", bg: "var(--color-info-bg)", fg: "var(--color-info)" },
  { label: "완료", bg: "var(--color-mint-100)", fg: "var(--color-mint-900)" },
  { label: "중요", bg: "var(--color-warning-bg)", fg: "var(--color-text-on-warm)" },
  { label: "위험", bg: "var(--color-risk-bg)", fg: "var(--color-danger)" },
  { label: "도전", bg: "var(--color-epic-bg)", fg: "var(--color-epic-text)" },
];

interface TokenPreviewProps {
  draft: TokenDraft;
  previewScale: number;
}

/**
 * 우측 라이브 프리뷰 — 보드 1~5. 부모(styleguide-page)가 래퍼에 덮은
 * CSS 변수를 var() 로 참조하므로, 좌측 조정 시 즉시 리렌더된다.
 */
export function TokenPreview({ draft, previewScale }: TokenPreviewProps) {
  const colorVars = ALL_EDITABLE_VARS.filter((v) => VAR_KIND[v] === "color");

  return (
    <div className="space-y-5">
      {/* 1. COLORS */}
      <Board n={1} title="Colors">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {colorVars.map((v) => (
            <div
              key={v}
              className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-2"
            >
              <span
                className="h-8 w-8 shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border-default)]"
                style={{ background: `var(${v})` }}
              />
              <span className="min-w-0">
                <span className="block truncate font-mono text-[11px] text-[var(--color-text-default)]">
                  {v.replace("--color-", "")}
                </span>
                <span className="block font-mono text-[10px] uppercase text-[var(--color-text-muted)]">
                  {draft[v]}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Board>

      {/* 2. TYPOGRAPHY */}
      <Board n={2} title="Typography · Pretendard">
        <div style={{ fontSize: `${previewScale}em` }} className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {(
              [
                ["Regular", 400],
                ["Medium", 500],
                ["SemiBold", 600],
                ["Bold", 700],
              ] as const
            ).map(([name, w]) => (
              <span
                key={w}
                style={{ fontWeight: w }}
                className="text-lg text-[var(--color-text-strong)]"
              >
                순공대장 {name}
              </span>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-[var(--color-border-default)] pt-3">
            <p className="text-3xl font-bold text-[var(--color-text-strong)]">
              Display · 오늘의 회독길
            </p>
            <p className="text-xl font-semibold text-[var(--color-text-strong)]">
              Heading · 까먹기 전에 다시
            </p>
            <p className="text-base text-[var(--color-text-default)]">
              Body · 학생의 막힘이 아니라 까먹음을 푼다.
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Caption · 1 · 3 · 7 · 14일 회독 퀘스트
            </p>
          </div>
        </div>
      </Board>

      {/* 3. COMPONENTS */}
      <Board n={3} title="Components">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-[var(--radius-md)] bg-[var(--color-primary-cta)] px-4 py-2 text-sm font-semibold text-[var(--color-text-inverse)] transition-opacity hover:opacity-90"
          >
            기본
          </button>
          <button
            type="button"
            className="rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text-strong)] transition-colors hover:bg-[var(--color-bg-sunken)]"
          >
            보조
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-[var(--radius-md)] bg-[var(--color-neutral)] px-4 py-2 text-sm font-semibold text-[var(--color-text-inverse)] opacity-50"
          >
            비활성
          </button>
          <button
            type="button"
            aria-label="아이콘 버튼"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-mint-100)] text-[var(--color-mint-700)] transition-opacity hover:opacity-90"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </Board>

      {/* 4. ICONS */}
      <Board n={4} title="Icons">
        <div className="flex flex-wrap gap-4">
          {ICONS.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-mint-50)] text-[var(--color-mint-700)]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </Board>

      {/* 5. BADGES */}
      <Board n={5} title="Badges">
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => (
            <span
              key={b.label}
              className="rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold"
              style={{ background: b.bg, color: b.fg }}
            >
              {b.label}
            </span>
          ))}
        </div>
      </Board>
    </div>
  );
}
