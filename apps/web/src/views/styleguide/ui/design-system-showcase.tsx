"use client";

/**
 * /styleguide 디자인 시스템 쇼케이스 — design.duolingo.com 형태의 카테고리 탐색.
 * 좌측 4그룹 내비(Foundations / Components / Patterns / Content) + 항목별 라이브 뷰.
 *
 * SOO-65: 기존 /styleguide 자산(토큰 조종석·브랜드 갤러리·잠긴 결정)을 한 글자도
 * 바꾸지 않고 그대로 재사용한다 — 카테고리화·내비·표현만 재편. 다크모드 토글은
 * Light-only 잠긴 결정과 충돌하여 도입하지 않는다(Foundations에 정책 카드로 대체).
 */

import * as React from "react";
import { useState } from "react";
import { StyleguidePage } from "./styleguide-page";
import { BrandGallery } from "./brand-gallery";
import { LockedDecisions } from "./locked-decisions";
import { ShowcaseSection } from "./showcase-kit";
import {
  FoundationsColor,
  FoundationsTypography,
  FoundationsRadiusSpacing,
  FoundationsLightOnly,
} from "./showcase-foundations";
import {
  CompButton,
  CompBadge,
  CompCard,
  CompInput,
  CompDialog,
  CompToast,
  CompPopover,
} from "./showcase-components";
import { PatternsLayout, PatternsInteraction, ContentVoice } from "./showcase-patterns";

interface Leaf {
  id: string;
  label: string;
  /** 자체 <main>을 가져오는 뷰(조종석)는 content <main> 밖에서 렌더한다. */
  full?: boolean;
  render: () => React.ReactNode;
}

interface NavGroup {
  category: string;
  leaves: Leaf[];
}

const NAV: NavGroup[] = [
  {
    category: "Foundations",
    leaves: [
      { id: "color", label: "색상 토큰", render: () => <FoundationsColor /> },
      {
        id: "type",
        label: "타이포그래피",
        render: () => <FoundationsTypography />,
      },
      {
        id: "radius",
        label: "Radius · Spacing",
        render: () => <FoundationsRadiusSpacing />,
      },
      {
        id: "light-only",
        label: "Light-only 정책",
        render: () => <FoundationsLightOnly />,
      },
      {
        id: "brand",
        label: "브랜드 자산",
        render: () => (
          <ShowcaseSection
            eyebrow="Foundations"
            title="브랜드 자산"
            description="로고·앱 아이콘·마스코트·hero. PNG는 색이 baked되어 토큰 비구동(레퍼런스 표시)."
          >
            <BrandGallery />
          </ShowcaseSection>
        ),
      },
      {
        id: "cockpit",
        label: "토큰 플레이그라운드 (조종석)",
        full: true,
        render: () => <StyleguidePage />,
      },
    ],
  },
  {
    category: "Components",
    leaves: [
      { id: "button", label: "Button", render: () => <CompButton /> },
      { id: "badge", label: "Badge", render: () => <CompBadge /> },
      { id: "card", label: "Card", render: () => <CompCard /> },
      { id: "input", label: "Input", render: () => <CompInput /> },
      { id: "dialog", label: "Dialog", render: () => <CompDialog /> },
      { id: "toast", label: "Toast", render: () => <CompToast /> },
      { id: "popover", label: "Popover", render: () => <CompPopover /> },
    ],
  },
  {
    category: "Patterns",
    leaves: [
      { id: "layout", label: "레이아웃", render: () => <PatternsLayout /> },
      {
        id: "interaction",
        label: "상호작용",
        render: () => <PatternsInteraction />,
      },
    ],
  },
  {
    category: "Content & Voice",
    leaves: [
      { id: "voice", label: "보이스 · 톤", render: () => <ContentVoice /> },
      {
        id: "locked",
        label: "잠긴 결정",
        render: () => (
          <ShowcaseSection
            eyebrow="Content & Voice"
            title="잠긴 결정 · 절대 금지"
            description="ui-master §4.2 인용 — 조정 대상 아님, 표시만. 값은 tokens.css가 SSoT."
          >
            <LockedDecisions />
          </ShowcaseSection>
        ),
      },
    ],
  },
];

const ALL_LEAVES: Leaf[] = NAV.flatMap((g) => g.leaves);

export function DesignSystemShowcase() {
  const [activeId, setActiveId] = useState<string>("color");
  const active = ALL_LEAVES.find((l) => l.id === activeId) ?? ALL_LEAVES[0];

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* 좌측 카테고리 내비 */}
      <nav
        aria-label="디자인 시스템 카테고리"
        className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r border-[var(--color-border-default)] bg-[var(--color-surface)] px-4 py-6 md:block"
      >
        <div className="mb-5 px-2">
          <p className="text-sm font-bold text-[var(--color-text-strong)]">
            순공대장 디자인 시스템
          </p>
          <span className="mt-1 inline-block rounded-[var(--radius-pill)] bg-[var(--color-warning-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-on-warm)]">
            dev only · noindex
          </span>
        </div>
        {NAV.map((group) => (
          <div key={group.category} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              {group.category}
            </p>
            <ul className="space-y-0.5">
              {group.leaves.map((leaf) => {
                const isActive = leaf.id === active.id;
                return (
                  <li key={leaf.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(leaf.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={
                        isActive
                          ? "w-full rounded-[var(--radius-md)] bg-[var(--color-mint-100)] px-2 py-1.5 text-left text-[13px] font-semibold text-[var(--color-mint-900)]"
                          : "w-full rounded-[var(--radius-md)] px-2 py-1.5 text-left text-[13px] text-[var(--color-text-default)] transition-colors hover:bg-[var(--color-bg-sunken)]"
                      }
                    >
                      {leaf.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 모바일: 가로 스크롤 칩 내비 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10 flex gap-1.5 overflow-x-auto border-b border-[var(--color-border-default)] bg-[var(--color-surface)] px-3 py-2 md:hidden">
          {ALL_LEAVES.map((leaf) => {
            const isActive = leaf.id === active.id;
            return (
              <button
                key={leaf.id}
                type="button"
                onClick={() => setActiveId(leaf.id)}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-mint-100)] px-3 py-1 text-xs font-semibold text-[var(--color-mint-900)]"
                    : "shrink-0 rounded-[var(--radius-pill)] px-3 py-1 text-xs text-[var(--color-text-muted)]"
                }
              >
                {leaf.label}
              </button>
            );
          })}
        </div>

        {/* 콘텐츠 — 조종석은 자체 <main>을 가지므로 그대로, 그 외는 <main> 래핑 */}
        {active.full ? (
          active.render()
        ) : (
          <main className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-8">
            {active.render()}
          </main>
        )}
      </div>
    </div>
  );
}
