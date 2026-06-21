"use client";

/**
 * Patterns · 도메인규칙 카테고리 뷰 (SOO-69).
 * - Patterns: 레이아웃 / 상호작용 패턴 (정적 예시).
 * - 도메인규칙 시각화: 기억HP 0–5 정수 게이지 · 위험도 데사처드 pill ·
 *   화면별 게임성 강도 캡 표. 값은 게임화 SSoT(잠긴 값) — 여기선 렌더만.
 * raw hex 0건 · `dark:` 0건. 색은 var() 토큰만.
 */

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ShowcaseSection, ExampleCard, RuleTable, DoDont } from "./showcase-kit";

export function PatternsLayout() {
  return (
    <ShowcaseSection
      eyebrow="Patterns"
      title="레이아웃"
      description="홈 stats 4박스, 카드 그리드 등 반복 레이아웃 골격. 게임성 강도는 화면별 캡을 따른다(홈 30%)."
    >
      <ExampleCard title="Stats 4박스" hint="홈 상단 위계">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { k: "스트릭", v: "7일" },
            { k: "기억HP", v: "4 / 5" },
            { k: "순공시간", v: "1h 20m" },
            { k: "등급", v: "순공러" },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-3 text-center shadow-[var(--shadow-card)]"
            >
              <p className="text-lg font-bold text-[var(--color-text-strong)]">
                {s.v}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)]">{s.k}</p>
            </div>
          ))}
        </div>
      </ExampleCard>
      <ExampleCard title="카드 그리드" hint="surface + 부드러운 그림자">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {["회독루틴", "오답회수", "망각방어"].map((t) => (
            <div
              key={t}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]"
            >
              <p className="text-sm font-bold text-[var(--color-text-strong)]">
                {t}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                예시 카드 콘텐츠
              </p>
            </div>
          ))}
        </div>
      </ExampleCard>
    </ShowcaseSection>
  );
}

export function PatternsInteraction() {
  return (
    <ShowcaseSection
      eyebrow="Patterns"
      title="상호작용"
      description="모션은 마스코트 등장 위주의 부분 차용. 버튼/카드 과한 bounce는 금지(매트릭스). 전환은 토큰 duration/ease 사용."
    >
      <ExampleCard title="hover / transition" hint="--duration-fast · --ease-out-soft">
        <button
          type="button"
          className="rounded-[var(--radius-md)] bg-[var(--color-mint-100)] px-4 py-2 text-sm font-semibold text-[var(--color-mint-900)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] hover:bg-[var(--color-mint-300)]"
        >
          마우스를 올려보세요
        </button>
      </ExampleCard>
    </ShowcaseSection>
  );
}

/**
 * 모션 언어 (SOO-96) — 토큰을 라이브로 읽어 보여주는 살아있는 문서.
 * 값(ms/cubic-bezier)은 tokens.css 가 SSoT 이므로 복붙하지 않고 getComputedStyle 로
 * 런타임에 읽는다 — tokens.css 가 바뀌면 이 표도 자동 반영(드리프트 0).
 */
const MOTION_TOKENS: { varName: string; use: string }[] = [
  { varName: "--ease-out-soft", use: "기본 ease — 부드럽게 감속(soft landing)" },
  { varName: "--duration-fast", use: "hover·탭 등 즉각 피드백" },
  { varName: "--duration-mid", use: "카드·시트 전환" },
  { varName: "--duration-slow", use: "마스코트 등장·강조 모먼트" },
];

function useComputedTokens(varNames: string[]): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    for (const name of varNames) {
      next[name] = style.getPropertyValue(name).trim();
    }
    setValues(next);
    // varNames 는 모듈 상수 — 재실행 불필요.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return values;
}

export function PatternsMotion() {
  const computed = useComputedTokens(MOTION_TOKENS.map((t) => t.varName));
  const [playing, setPlaying] = useState(false);
  const replayRef = useRef<number | null>(null);

  const replay = () => {
    setPlaying(false);
    if (replayRef.current) window.cancelAnimationFrame(replayRef.current);
    replayRef.current = window.requestAnimationFrame(() => setPlaying(true));
  };

  useEffect(() => {
    setPlaying(true);
    return () => {
      if (replayRef.current) window.cancelAnimationFrame(replayRef.current);
    };
  }, []);

  return (
    <ShowcaseSection
      eyebrow="Patterns · 모션 언어"
      title="모션 언어 (SOO-96)"
      description="모션은 '부분 차용' — 마스코트 등장 같은 환영 모먼트에만 활기를 쓰고, 버튼·카드의 과한 bounce 는 금지한다. 전환 시간·곡선은 토큰만 사용하며, 아래 값은 tokens.css 에서 런타임에 직접 읽는다(자동 반영)."
    >
      <ExampleCard title="모션 토큰" hint="값은 tokens.css 가 SSoT · 런타임 read">
        <RuleTable
          columns={["토큰", "현재 값(live)", "용도"]}
          rows={MOTION_TOKENS.map((t) => [
            <code
              key="v"
              className="font-mono text-[11px] font-semibold text-[var(--color-mint-700)]"
            >
              {t.varName}
            </code>,
            <code key="c" className="font-mono text-[11px] tabular-nums text-[var(--color-text-default)]">
              {computed[t.varName] || "…"}
            </code>,
            t.use,
          ])}
        />
      </ExampleCard>

      <ExampleCard title="마스코트 등장 — soft landing" hint="--duration-slow · --ease-out-soft">
        <div className="flex flex-col items-center gap-4 py-4">
          <div
            className="h-16 w-16 rounded-[var(--radius-lg)] bg-[var(--color-mint-500)]"
            style={
              playing
                ? {
                    animation:
                      "soongong-motion-rise var(--duration-slow) var(--ease-out-soft) both",
                  }
                : { opacity: 0 }
            }
          />
          <button
            type="button"
            onClick={replay}
            className="rounded-[var(--radius-md)] bg-[var(--color-mint-100)] px-4 py-2 text-sm font-semibold text-[var(--color-mint-900)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] hover:bg-[var(--color-mint-300)]"
          >
            다시 재생
          </button>
        </div>
        <style>{`@keyframes soongong-motion-rise {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }`}</style>
      </ExampleCard>

      <ExampleCard title="모션 가드레일" hint="매트릭스 — Bouncy 부분 차용">
        <DoDont
          dos={[
            "마스코트 등장·결과 축하에 spring/soft landing(강도 캡 내)",
            "전환은 --duration-* + --ease-out-soft 토큰만 사용",
            "감속(ease-out) 중심 — 자연스러운 도착감",
          ]}
          donts={[
            "버튼·카드 전반의 과한 bounce(매트릭스 위반)",
            "ms·cubic-bezier 값을 컴포넌트에 하드코딩(두 번째 SSoT)",
            "홈에서 네온·파티클 남발(게임성 강도 캡 초과)",
          ]}
        />
      </ExampleCard>
    </ShowcaseSection>
  );
}

/** 기억HP 0–5 정수 게이지 — 채워진 칸 수로만 표현(하트/백분율 ❌). */
function HpGauge({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="h-3 w-8 rounded-[var(--radius-pill)]"
          style={{
            background:
              i < value ? "var(--color-mint-500)" : "var(--color-bg-sunken)",
          }}
        />
      ))}
      <span className="ml-2 text-xs font-semibold tabular-nums text-[var(--color-text-default)]">
        {value} / 5
      </span>
    </div>
  );
}

export function DomainMemoryHp() {
  return (
    <ShowcaseSection
      eyebrow="도메인규칙"
      title="기억HP — 0–5 정수 게이지"
      description="기억HP는 0–5 정수로만 표현한다. 백분율·빨강 하트는 금지(게임화 잠긴 값 + Duolingo 하트 ‘변형’ 결정). 손실은 데사처드 톤으로 부드럽게."
    >
      <ExampleCard title="상태별 게이지" hint="채운 칸 수 = 정수값">
        <div className="space-y-3">
          {[5, 4, 3, 1, 0].map((v) => (
            <HpGauge key={v} value={v} />
          ))}
        </div>
      </ExampleCard>
    </ShowcaseSection>
  );
}

/** 위험도 데사처드 pill — 자극적 원색 금지, 소프트 톤만(low/mid/high). */
function RiskPill({
  varName,
  label,
}: {
  varName: string;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text-strong)]"
      style={{ background: `var(${varName})` }}
    >
      {label}
    </span>
  );
}

export function DomainRisk() {
  return (
    <ShowcaseSection
      eyebrow="도메인규칙"
      title="회독 위험도 — 데사처드 pill"
      description="망각 위험도는 부드러운 빨강/노랑/초록 톤(데사처드)으로만 표기한다. 자극적 원색·네온 금지. 값은 tokens.css의 --color-risk-* 가 SSoT."
    >
      <ExampleCard title="위험도 3단" hint="--color-risk-low / mid / high">
        <div className="flex flex-wrap items-center gap-2">
          <RiskPill varName="--color-risk-low" label="안전" />
          <RiskPill varName="--color-risk-mid" label="주의" />
          <RiskPill varName="--color-risk-high" label="위험" />
        </div>
      </ExampleCard>
    </ShowcaseSection>
  );
}

/** §2-3 화면별 게임성 강도 캡 — -20dB 원칙. 초과 시 위반. */
const INTENSITY_CAPS: { screen: string; cap: number; note: string }[] = [
  { screen: "홈", cap: 30, note: "네온/파티클 금지, stats + 배지만" },
  { screen: "회독 플레이", cap: 20, note: "진행도 + HP만" },
  { screen: "결과", cap: 50, note: "XP 카운트업 + spring 마스코트 허용" },
  { screen: "오답던전 / 망각방어", cap: 60, note: "강한 loss 신호는 데사처드로" },
  { screen: "순공리그", cap: 70, note: "경쟁 신호 (MVP 1.5차)" },
  { screen: "4점보스", cap: 80, note: "최고 강도 — 보스전 한정" },
];

/** 강도 막대 — 캡 비율을 mint 톤으로 시각화. */
function IntensityBar({ cap }: { cap: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 flex-1 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)]">
        <span
          className="block h-full rounded-[var(--radius-pill)] bg-[var(--color-mint-500)]"
          style={{ width: `${cap}%` }}
        />
      </span>
      <span className="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-[var(--color-text-muted)]">
        {cap}%
      </span>
    </div>
  );
}

export function DomainIntensityCaps() {
  return (
    <ShowcaseSection
      eyebrow="도메인규칙"
      title="화면별 게임성 강도 캡"
      description="Dark RPG 대비 -20dB. ‘홈을 게임처럼’ 만들면 위반 — 게임성은 결과·서브모드에서 올린다. 캡 초과는 design-review §2-3 위반(잠긴 값)."
    >
      <ExampleCard title="강도 상한" hint="초과 시 위반">
        <RuleTable
          columns={["화면", "강도 캡", "허용 범위"]}
          rows={INTENSITY_CAPS.map((c) => [
            <span key="s" className="font-semibold text-[var(--color-text-strong)]">
              {c.screen}
            </span>,
            <div key="b" className="min-w-[120px]">
              <IntensityBar cap={c.cap} />
            </div>,
            c.note,
          ])}
        />
      </ExampleCard>
    </ShowcaseSection>
  );
}
