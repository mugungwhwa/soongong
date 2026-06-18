/**
 * 쇼케이스 공용 표현 프리미티브 — design.duolingo.com 형태의 카테고리 문서를
 * 일관된 톤으로 렌더하기 위한 정적 빌딩 블록. 토큰값/컴포넌트 동작은 정하지 않고
 * "표현"만 담당한다(SOO-65: 내용 무변경, 카테고리화·표현만 재편).
 *
 * ⚠️ raw hex 금지(lint:tokens) · `dark:` 금지(lint:no-dark). 색은 var() 토큰만.
 */

import * as React from "react";

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
