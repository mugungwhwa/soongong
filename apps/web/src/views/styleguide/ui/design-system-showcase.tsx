"use client";

/**
 * /styleguide 디자인 시스템 쇼케이스 — design.duolingo.com 형태의 카테고리 탐색.
 * 좌측 5그룹 내비 + 항목별 라이브 뷰.
 *
 * SOO-69 (v2): SOO-65 first-cut(4분류) → 5분류 재편.
 *   Foundations / Brand & Mascot / Components / Patterns·도메인규칙 / Principles & Guardrails
 * 토큰·컴포넌트 내용은 불변 — 재편·표현·시각화만. Light-only 유지(다크모드 금지).
 * 모바일 내비는 현재 카테고리의 leaf만 표시(전체 평면 나열 제거).
 */

import * as React from "react";
import { useState } from "react";
import { StyleguidePage } from "./styleguide-page";
import {
  FoundationsColor,
  FoundationsTypography,
  FoundationsRadiusSpacing,
  FoundationsLightOnly,
} from "./showcase-foundations";
import { BrandMascot, BrandAssets } from "./showcase-brand";
import {
  CompButton,
  CompBadge,
  CompCard,
  CompInput,
  CompDialog,
  CompToast,
  CompPopover,
} from "./showcase-components";
import {
  PatternsLayout,
  PatternsInteraction,
  PatternsMotion,
  DomainMemoryHp,
  DomainRisk,
  DomainIntensityCaps,
} from "./showcase-patterns";
import {
  PrinciplesMatrix,
  PrinciplesGuardrails,
  PrinciplesVoice,
} from "./showcase-principles";
import {
  PlatformStack,
  PlatformDelivery,
  PlatformMergeGate,
  PlatformPrinciples,
} from "./showcase-platform";

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
      { id: "type", label: "타이포그래피", render: () => <FoundationsTypography /> },
      {
        id: "radius",
        label: "Radius · Spacing",
        render: () => <FoundationsRadiusSpacing />,
      },
      { id: "light-only", label: "Light-only 정책", render: () => <FoundationsLightOnly /> },
      {
        id: "cockpit",
        label: "토큰 플레이그라운드 (조종석)",
        full: true,
        render: () => <StyleguidePage />,
      },
    ],
  },
  {
    category: "Brand & Mascot",
    leaves: [
      { id: "mascot", label: "순공이 · mood", render: () => <BrandMascot /> },
      { id: "brand-assets", label: "로고 · 자산 (플랫/3D)", render: () => <BrandAssets /> },
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
    category: "Patterns · 도메인규칙",
    leaves: [
      { id: "layout", label: "레이아웃", render: () => <PatternsLayout /> },
      { id: "interaction", label: "상호작용", render: () => <PatternsInteraction /> },
      { id: "motion", label: "모션 언어 (SOO-96)", render: () => <PatternsMotion /> },
      { id: "hp", label: "기억HP 게이지", render: () => <DomainMemoryHp /> },
      { id: "risk", label: "위험도 pill", render: () => <DomainRisk /> },
      { id: "intensity", label: "게임성 강도 캡", render: () => <DomainIntensityCaps /> },
    ],
  },
  {
    category: "Principles & Guardrails",
    leaves: [
      { id: "matrix", label: "Duolingo 매트릭스", render: () => <PrinciplesMatrix /> },
      { id: "guardrails", label: "잠긴 결정 · 폐기 회귀", render: () => <PrinciplesGuardrails /> },
      { id: "voice", label: "Voice 원칙", render: () => <PrinciplesVoice /> },
    ],
  },
  {
    category: "Platform · 개발 가이드",
    leaves: [
      { id: "stack", label: "스택 & FSD 레이어", render: () => <PlatformStack /> },
      { id: "delivery", label: "배포 · PWA · 2026 전략", render: () => <PlatformDelivery /> },
      { id: "merge-gate", label: "머지 게이트 · 브랜치", render: () => <PlatformMergeGate /> },
      { id: "platform-principles", label: "서비스화 · 상시 원칙", render: () => <PlatformPrinciples /> },
    ],
  },
];

const ALL_LEAVES: Leaf[] = NAV.flatMap((g) => g.leaves);

export function DesignSystemShowcase() {
  const [activeId, setActiveId] = useState<string>("color");
  const active = ALL_LEAVES.find((l) => l.id === activeId) ?? ALL_LEAVES[0];
  const activeGroup =
    NAV.find((g) => g.leaves.some((l) => l.id === active.id)) ?? NAV[0];

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* 좌측 카테고리 내비 (데스크탑) */}
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

      {/* 모바일: 2단 칩 내비 — 카테고리 선택 + 현재 카테고리 leaf만 표시 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10 border-b border-[var(--color-border-default)] bg-[var(--color-surface)] md:hidden">
          <div
            className="flex gap-1.5 overflow-x-auto px-3 pt-2"
            aria-label="디자인 시스템 카테고리"
          >
            {NAV.map((group) => {
              const isActiveCat = group.category === activeGroup.category;
              return (
                <button
                  key={group.category}
                  type="button"
                  onClick={() => setActiveId(group.leaves[0].id)}
                  aria-current={isActiveCat ? "true" : undefined}
                  className={
                    isActiveCat
                      ? "shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-mint-700)] px-3 py-1 text-xs font-semibold text-[var(--color-text-inverse)]"
                      : "shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)] px-3 py-1 text-xs text-[var(--color-text-muted)]"
                  }
                >
                  {group.category}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2">
            {activeGroup.leaves.map((leaf) => {
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
