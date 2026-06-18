/**
 * 쇼케이스 공용 표현 프리미티브 — design.duolingo.com 형태의 카테고리 문서를
 * 일관된 톤으로 렌더하기 위한 정적 빌딩 블록. 토큰값/컴포넌트 동작은 정하지 않고
 * "표현"만 담당한다(SOO-65: 내용 무변경, 카테고리화·표현만 재편).
 *
 * ⚠️ raw hex 금지(lint:tokens) · `dark:` 금지(lint:no-dark). 색은 var() 토큰만.
 */

import * as React from "react";
import { Check, X } from "lucide-react";

/** 카테고리 뷰 한 칸의 헤더 + 본문 래퍼. */
export function ShowcaseSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-mint-700)]">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold text-[var(--color-text-strong)]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

/** 예시 한 묶음을 담는 카드(라이브 예시 + 캡션). */
export function ExampleCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-[var(--color-text-strong)]">
          {title}
        </h3>
        {hint ? (
          <span className="text-[11px] text-[var(--color-text-muted)]">
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** "사용 토큰" 칩 줄 — 각 컴포넌트가 의존하는 CSS 변수를 명시한다. */
export function TokenChips({ tokens }: { tokens: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[var(--color-border-default)] pt-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        사용 토큰
      </span>
      {tokens.map((t) => (
        <code
          key={t}
          className="rounded-[var(--radius-sm)] bg-[var(--color-bg-sunken)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-default)]"
        >
          {t}
        </code>
      ))}
    </div>
  );
}

/** 색 토큰 한 칸 — 스와치 + 변수명. 값(hex)은 표기하지 않는다(SSoT=tokens.css). */
export function Swatch({ varName, label }: { varName: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border-default)] p-2">
      <span
        className="h-9 w-9 shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-border-default)]"
        style={{ background: `var(${varName})` }}
      />
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-[var(--color-text-strong)]">
          {label}
        </span>
        <code className="block truncate font-mono text-[10px] text-[var(--color-text-muted)]">
          {varName}
        </code>
      </span>
    </div>
  );
}

/**
 * Do / Don't 2열 가드레일 — 컴포넌트 4단 틀의 ④번 칸.
 * do = 동반자/권장, dont = 금지. 톤은 design-review §2-5 기준.
 */
export function DoDont({
  dos,
  donts,
}: {
  dos: React.ReactNode[];
  donts: React.ReactNode[];
}) {
  return (
    <div className="mt-4 grid gap-4 border-t border-[var(--color-border-default)] pt-4 sm:grid-cols-2">
      <div className="rounded-[var(--radius-md)] bg-[var(--color-mint-50)] p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-mint-700)]">
          <Check className="h-3.5 w-3.5" /> Do
        </h4>
        <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--color-text-default)]">
          {dos.map((d, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="select-none text-[var(--color-mint-500)]">·</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[var(--radius-md)] bg-[var(--color-risk-bg)] p-3">
        <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-danger)]">
          <X className="h-3.5 w-3.5" /> Don&apos;t
        </h4>
        <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
          {donts.map((d, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="select-none text-[var(--color-risk-high)]">·</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * 규칙 표 — Duolingo 차용/변형/거절 매트릭스·게임성 강도 캡 등 정적 문서 표.
 * 값은 본 표가 아니라 design-review 스킬 §2~§3이 SSoT(여기선 렌더만).
 */
export function RuleTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="bg-[var(--color-bg-sunken)]">
            {columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-3 py-2 font-bold text-[var(--color-text-strong)]"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-t border-[var(--color-border-default)] align-top"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 leading-relaxed text-[var(--color-text-default)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 결정 태그 pill — 차용 / 변형 / 거절 등 분류 라벨.
 * 색은 의미별 토큰만(차용=mint, 변형=warning, 거절=danger).
 */
export function VerdictPill({
  kind,
}: {
  kind: "차용" | "변형" | "거절" | "부분 차용" | "차용(잠금)";
}) {
  const tone =
    kind === "거절"
      ? "bg-[var(--color-risk-bg)] text-[var(--color-danger)]"
      : kind === "변형"
        ? "bg-[var(--color-warning-bg)] text-[var(--color-text-on-warm)]"
        : "bg-[var(--color-mint-50)] text-[var(--color-mint-700)]";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-bold ${tone}`}
    >
      {kind}
    </span>
  );
}

/** placeholder 빈 상태 — 아직 자산이 약한 카테고리(예: Content) 안내. */
export function PlaceholderNote({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-sunken)] p-6 text-center">
      <p className="text-sm font-bold text-[var(--color-text-default)]">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-[var(--color-text-muted)]">
        {children}
      </p>
    </div>
  );
}
