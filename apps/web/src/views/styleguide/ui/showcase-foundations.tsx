/**
 * Foundations 카테고리 뷰 — 색상·타이포그래피·radius/spacing·Light-only 정책.
 * 모두 정적 read-only 참조(값은 tokens.css SSoT). raw hex 0건 · `dark:` 0건.
 *
 * "다크모드"는 잠긴 결정(라이트 단일, lint:no-dark)과 충돌하므로 토글 대신
 * "왜 Light-only인가" 설명 카드로 대체한다(SOO-65, Mike 확인).
 */

import * as React from "react";
import { Sun } from "lucide-react";
import { ShowcaseSection, ExampleCard, Swatch } from "./showcase-kit";

const BRAND_COLORS: { varName: string; label: string }[] = [
  { varName: "--color-mint-50", label: "Mint 50" },
  { varName: "--color-mint-100", label: "Mint 100" },
  { varName: "--color-mint-300", label: "Mint 300" },
  { varName: "--color-mint-500", label: "Mint 500" },
  { varName: "--color-mint-700", label: "Mint 700" },
  { varName: "--color-mint-900", label: "Mint 900" },
  { varName: "--color-primary-cta", label: "Primary CTA" },
  { varName: "--color-xp", label: "XP" },
];

const STATUS_COLORS: { varName: string; label: string }[] = [
  { varName: "--color-risk-low", label: "위험도 낮음" },
  { varName: "--color-risk-mid", label: "위험도 중간" },
  { varName: "--color-risk-high", label: "위험도 높음" },
  { varName: "--color-info", label: "Info" },
  { varName: "--color-warning", label: "Warning" },
  { varName: "--color-danger", label: "Danger" },
];

const SURFACE_COLORS: { varName: string; label: string }[] = [
  { varName: "--color-background", label: "배경(캔버스)" },
  { varName: "--color-surface", label: "Surface(카드)" },
  { varName: "--color-bg-sunken", label: "Sunken" },
  { varName: "--color-border-default", label: "Border 기본" },
  { varName: "--color-text-strong", label: "Text Strong" },
  { varName: "--color-text-muted", label: "Text Muted" },
];

const RADII: { varName: string; label: string }[] = [
  { varName: "--radius-sm", label: "sm" },
  { varName: "--radius-md", label: "md" },
  { varName: "--radius-lg", label: "lg" },
  { varName: "--radius-xl", label: "xl" },
  { varName: "--radius-pill", label: "pill" },
];

const SPACES = ["--space-2", "--space-3", "--space-4", "--space-6", "--space-8"];

export function FoundationsColor() {
  return (
    <ShowcaseSection
      eyebrow="Foundations"
      title="색상 토큰"
      description="v2 Teal/Mint 팔레트 + 데사처드 상태색. 모든 값은 tokens.css가 SSoT이며 여기선 변수명만 표기한다(hex 미표기)."
    >
      <ExampleCard title="Brand · Mint" hint="저채도 민트 + soft golden">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BRAND_COLORS.map((c) => (
            <Swatch key={c.varName} {...c} />
          ))}
        </div>
      </ExampleCard>
      <ExampleCard title="Status · 위험도/상태" hint="자극 원색 금지 · 데사처드 톤">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {STATUS_COLORS.map((c) => (
            <Swatch key={c.varName} {...c} />
          ))}
        </div>
      </ExampleCard>
      <ExampleCard title="Surface · Text">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SURFACE_COLORS.map((c) => (
            <Swatch key={c.varName} {...c} />
          ))}
        </div>
      </ExampleCard>
    </ShowcaseSection>
  );
}

export function FoundationsTypography() {
  return (
    <ShowcaseSection
      eyebrow="Foundations"
      title="타이포그래피"
      description="표제/본문 분리(듀오링고 차용) — 표제 = display 토큰, 본문 = Pretendard. 위계는 굵기·크기로만."
    >
      <ExampleCard title="Weight" hint="--font-body · Pretendard">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
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
      </ExampleCard>
      <ExampleCard title="Scale">
        <div className="space-y-1.5">
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
      </ExampleCard>
    </ShowcaseSection>
  );
}

export function FoundationsRadiusSpacing() {
  return (
    <ShowcaseSection
      eyebrow="Foundations"
      title="Radius · Spacing"
      description="카드/버튼의 둥근 정도와 간격 스케일. 부드러운 16~20px 라운드가 Light Study Garden 톤의 핵심."
    >
      <ExampleCard title="Radius">
        <div className="flex flex-wrap items-end gap-4">
          {RADII.map((r) => (
            <div key={r.varName} className="flex flex-col items-center gap-1.5">
              <span
                className="h-16 w-16 border border-[var(--color-border-strong)] bg-[var(--color-mint-100)]"
                style={{ borderRadius: `var(${r.varName})` }}
              />
              <code className="font-mono text-[10px] text-[var(--color-text-muted)]">
                {r.label}
              </code>
            </div>
          ))}
        </div>
      </ExampleCard>
      <ExampleCard title="Spacing">
        <div className="space-y-2">
          {SPACES.map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span
                className="h-3 rounded-[var(--radius-sm)] bg-[var(--color-mint-500)]"
                style={{ width: `var(${s})` }}
              />
              <code className="font-mono text-[10px] text-[var(--color-text-muted)]">
                {s}
              </code>
            </div>
          ))}
        </div>
      </ExampleCard>
    </ShowcaseSection>
  );
}

export function FoundationsLightOnly() {
  return (
    <ShowcaseSection
      eyebrow="Foundations"
      title="Light-only 정책"
      description="순공대장에는 다크모드 토글이 없다. 이는 미구현이 아니라 의식적으로 잠긴 결정이다."
    >
      <ExampleCard title="왜 Light-only인가" hint="잠긴 결정 · 회귀 금지">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-mint-50)] text-[var(--color-mint-700)]">
            <Sun className="h-5 w-5" />
          </span>
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--color-text-default)]">
            <li>
              <strong className="text-[var(--color-text-strong)]">
                Light Study Garden
              </strong>{" "}
              톤 — “매일 들어오고 싶은 공부 정원”. 크림/화이트 배경이 정체성이다.
            </li>
            <li>
              폐기된 <strong>Dark Study RPG / 다크 네이비</strong> 방향과 충돌 —
              다크모드 도입은 그 회귀에 해당한다(프로젝트 CLAUDE.md §8).
            </li>
            <li>
              <code className="rounded-[var(--radius-sm)] bg-[var(--color-bg-sunken)] px-1 py-0.5 font-mono text-[11px]">
                pnpm lint:no-dark
              </code>{" "}
              게이트가 <code className="font-mono text-[11px]">dark:</code> 클래스를
              0건으로 강제한다.
            </li>
          </ul>
        </div>
        <p className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-sunken)] px-3 py-2 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          다크모드가 정말 필요하다면 디자인 정책 변경 → 별도 티켓으로만 다룬다.
          이 쇼케이스는 변경하지 않는다.
        </p>
      </ExampleCard>
    </ShowcaseSection>
  );
}
