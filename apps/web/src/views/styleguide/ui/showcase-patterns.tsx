/**
 * Patterns + Content/Voice 카테고리 뷰.
 * - Patterns: 레이아웃 / 상호작용 패턴 (정적 예시).
 * - Content/Voice: 자산이 약한 영역 — 카피 톤 do/don't만 표기 + placeholder.
 * raw hex 0건 · `dark:` 0건.
 */

import * as React from "react";
import { Check, X } from "lucide-react";
import { ShowcaseSection, ExampleCard, PlaceholderNote } from "./showcase-kit";

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
      <ExampleCard title="기억HP 게이지" hint="0–5 정수 · 하트/백분율 ❌">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-3 w-8 rounded-[var(--radius-pill)]"
              style={{
                background:
                  i < 4 ? "var(--color-mint-500)" : "var(--color-bg-sunken)",
              }}
            />
          ))}
          <span className="ml-2 text-xs font-semibold text-[var(--color-text-default)]">
            4 / 5
          </span>
        </div>
      </ExampleCard>
      <ExampleCard title="hover/transition" hint="--duration-fast · --ease-out-soft">
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

const VOICE_DO = [
  "압박 없는 동반자 톤 — “순공이가 잠들고 있어요. 깨워줄까요?”",
  "성취를 함께 기뻐하기 — “회독 완료! 기억HP가 채워졌어요.”",
  "부드러운 재시작 — “괜찮아요, 내일 다시 알려줄게요.”",
];

const VOICE_DONT = [
  "passive-aggressive — “돌아와!”, “안 하면 망한다”",
  "죄책감/공포 — 성적·합격 보장, fear 카피",
  "잦은 푸시로 압박 — 회독 일정(1/3/7/14일) 외 reminder",
];

export function ContentVoice() {
  return (
    <ShowcaseSection
      eyebrow="Content & Voice"
      title="보이스 · 톤"
      description="현재 자산이 약한 영역 — 보강은 별도 티켓. 지금은 카피 톤의 do/don't 가드레일만 제시한다(design-review §2-5)."
    >
      <ExampleCard title="카피 톤 가드레일">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-mint-700)]">
              <Check className="h-3.5 w-3.5" /> 동반자 톤 (do)
            </h4>
            <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--color-text-default)]">
              {VOICE_DO.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-danger)]">
              <X className="h-3.5 w-3.5" /> 금지 (don't)
            </h4>
            <ul className="space-y-1.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
              {VOICE_DONT.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>
        </div>
      </ExampleCard>
      <PlaceholderNote title="콘텐츠 자산 보강 예정">
        empty-state 일러스트 카피, 온보딩 문구, 알림 템플릿 등은 아직 정리 전입니다.
        별도 티켓에서 채웁니다.
      </PlaceholderNote>
    </ShowcaseSection>
  );
}
