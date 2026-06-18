"use client";

/**
 * Principles & Guardrails 카테고리 뷰 (SOO-69) — 우리가 의식적으로 정한 결정과
 * 회귀 금지선을 한 곳에 모은다. 새 결정은 만들지 않는다(렌더·인용만).
 *
 * 소스: design-review 스킬 §2~§3 (Duolingo 차용/변형/거절 매트릭스, 폐기 회귀,
 * Voice 톤) + 기존 LockedDecisions. 값(hex)은 tokens.css가 SSoT — 여기 복붙 금지.
 *
 * ⚠️ raw hex 금지 · `dark:` 금지. 색은 var() 토큰만.
 */

import * as React from "react";
import { LockedDecisions } from "./locked-decisions";
import {
  ShowcaseSection,
  ExampleCard,
  RuleTable,
  VerdictPill,
  DoDont,
} from "./showcase-kit";

/** §3 듀오링고 차용/변형/거절 매트릭스 — design-review 스킬이 SSoT(여기선 렌더만). */
const DUOLINGO_MATRIX: {
  pattern: string;
  verdict: "차용" | "변형" | "거절" | "부분 차용" | "차용(잠금)";
  note: string;
}[] = [
  { pattern: "마스코트 전 화면 노출", verdict: "차용", note: "안 했으면 ‘부족’ 판정" },
  {
    pattern: "메인 그린 + 노랑 액센트",
    verdict: "변형",
    note: "저채도 민트 + soft golden. 원색 그대로면 위반",
  },
  {
    pattern: "표제 / 본문 폰트 분리",
    verdict: "차용",
    note: "한글화 — Rockon(표제) + Pretendard(본문)",
  },
  {
    pattern: "Bouncy 애니메이션 전반",
    verdict: "부분 차용",
    note: "마스코트 등장만. 버튼/카드 과한 bounce ❌",
  },
  {
    pattern: "빨강 하트(생명 5개)",
    verdict: "변형",
    note: "기억HP(0–5) + 데사처드 위험도. 손실 자극 부드럽게",
  },
  { pattern: "passive-aggressive 카피", verdict: "거절", note: "했으면 위반" },
  {
    pattern: "streak loss 슬픈 마스코트",
    verdict: "변형",
    note: "순공이 sleep mood로 차분하게",
  },
  {
    pattern: "게임화 4종(XP/스트릭/하트/리그)",
    verdict: "부분 차용",
    note: "하트 → 기억HP 변형 필수",
  },
  {
    pattern: "잦은 reminder 푸시",
    verdict: "거절",
    note: "회독 일정 알림(1/3/7/14일)만",
  },
  {
    pattern: "Empty state 친근 일러스트",
    verdict: "차용",
    note: "순공이 mood 활용",
  },
  {
    pattern: "짧은 학습 세션(≤5분)",
    verdict: "차용(잠금)",
    note: "회독 1개 = 1~2분",
  },
  {
    pattern: "Streak Freeze 아이템샵",
    verdict: "거절",
    note: "인앱 상점 ❌ (MVP1)",
  },
];

/** §2-4 폐기항목 회귀 — PR 머지 전 grep 권장. 통과 기준 = 0건/단독. */
const REGRESSION_BANS: { check: string; pass: string }[] = [
  { check: "`dark:` CSS 클래스", pass: "0건 (lint:no-dark)" },
  { check: "다크 네이비 계열 (짙은 남색 1a1a2e · 16213e 류)", pass: "0건" },
  { check: "‘회독마왕’ / ‘RPG’ 키워드", pass: "0건" },
  { check: "토스풍 box-shadow 중첩", pass: "--shadow-card / --shadow-elevated 단독만" },
  { check: "미등록 gradient / 네온 / glow", pass: "매트릭스 등록분만 (lint:tokens)" },
];

const VOICE_DO = [
  "압박 없는 동반자 톤 — “순공이가 잠들고 있어요. 깨워줄까요?”",
  "성취를 함께 기뻐하기 — “회독 완료! 기억HP가 채워졌어요.”",
  "부드러운 재시작 — “괜찮아요, 내일 다시 알려줄게요.”",
];

const VOICE_DONT = [
  "passive-aggressive — “돌아와!”, “안 하면 망한다”",
  "죄책감 / 공포 — 성적·합격 보장, fear 카피",
  "잦은 푸시로 압박 — 회독 일정(1/3/7/14일) 외 reminder",
];

export function PrinciplesMatrix() {
  return (
    <ShowcaseSection
      eyebrow="Principles & Guardrails"
      title="Duolingo 차용 / 변형 / 거절 매트릭스"
      description="우리는 듀오링고의 각 요소를 의식적으로 차용·변형·거절로 결정했다. 검수의 잣대는 ‘더 듀오링고처럼’이 아니라 ‘이 결정을 지켰는가’ — 거절 패턴을 따라 했으면 위반이다(design-review §3)."
    >
      <RuleTable
        columns={["듀오링고 패턴", "결정", "검수 포인트"]}
        rows={DUOLINGO_MATRIX.map((r) => [
          <span key="p" className="font-semibold text-[var(--color-text-strong)]">
            {r.pattern}
          </span>,
          <VerdictPill key="v" kind={r.verdict} />,
          r.note,
        ])}
      />
    </ShowcaseSection>
  );
}

export function PrinciplesGuardrails() {
  return (
    <ShowcaseSection
      eyebrow="Principles & Guardrails"
      title="잠긴 결정 · 폐기 회귀 금지"
      description="조정 대상 아님 — 표시·인용만. 폐기 방향(다크 RPG/회독마왕/구 Ocean/토스풍 그림자)으로의 회귀 제안은 거절하고 Mike 확인."
    >
      <ExampleCard title="잠긴 결정 · 절대 금지" hint="ui-master §4.2 인용">
        <LockedDecisions />
      </ExampleCard>

      <ExampleCard title="폐기항목 회귀 체크" hint="PR 머지 전 grep · design-review §2-4">
        <RuleTable
          columns={["검사", "통과 기준"]}
          rows={REGRESSION_BANS.map((r) => [
            <span key="c" className="text-[var(--color-text-strong)]">
              {r.check}
            </span>,
            <span key="p" className="font-semibold text-[var(--color-mint-700)]">
              {r.pass}
            </span>,
          ])}
        />
      </ExampleCard>
    </ShowcaseSection>
  );
}

export function PrinciplesVoice() {
  return (
    <ShowcaseSection
      eyebrow="Principles & Guardrails"
      title="Voice 원칙 — 동반자 톤"
      description="압박·죄책감·공포 대신 함께 가는 동반자 톤. 소스는 기존 검수기준 + Duolingo 거절 매트릭스(새 결정 0건, design-review §2-5)."
    >
      <ExampleCard title="카피 톤 가드레일">
        <DoDont dos={VOICE_DO} donts={VOICE_DONT} />
      </ExampleCard>
    </ShowcaseSection>
  );
}
