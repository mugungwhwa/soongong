"use client";

/**
 * Platform · 개발 가이드 카테고리 뷰 (SOO-106).
 * /styleguide 를 "통합 UI·디자인 + 플랫폼 개발 가이드라인 라이브 사이트"로 확장하는
 * 자산화 트랙. 디자인 4그룹 옆에 플랫폼(개발) 핸드북 한 그룹을 더한다.
 *
 * 원칙 — 이 뷰는 새 결정을 만들지 않는다. 스택/레이어/배포/머지게이트/서비스화 원칙은
 * 모두 기존 SSoT(CLAUDE.md · 전략정리.md · .dependency-cruiser.cjs · manifest.ts 등)가
 * 진실이며, 여기서는 그 경로를 가리키고 한눈에 보여줄 뿐이다. 값·규칙 정의를 옮겨 적으면
 * 두 번째 SSoT가 되므로 금지(soongong-design 스킬). 각 카드 하단에 출처 경로를 명시한다.
 *
 * ⚠️ raw hex 금지(lint:tokens) · `dark:` 금지(lint:no-dark). 색은 var() 토큰만.
 */

import * as React from "react";
import { ShowcaseSection, ExampleCard, RuleTable, DoDont } from "./showcase-kit";

/** 카드 하단 출처 경로 표기 — "이 내용의 진실은 저기 있다"를 항상 명시. */
function SourceNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] px-3 py-2 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
      <strong className="text-[var(--color-text-default)]">출처(SSoT):</strong>{" "}
      {children}
    </p>
  );
}

function Path({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[var(--radius-sm)] bg-[var(--color-bg-sunken)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-default)]">
      {children}
    </code>
  );
}

/* ── 1. 스택 & FSD 레이어 ─────────────────────────────────── */

const STACK: { layer: string; tech: string; note: string }[] = [
  { layer: "프레임워크", tech: "Next.js 15 (App Router)", note: "RSC + 서버 액션, /app 라우팅" },
  { layer: "아키텍처", tech: "FSD 2.1", note: "feature-sliced design, 단방향 의존성" },
  { layer: "스타일", tech: "Tailwind + tokens.css", note: "색·치수는 CSS 변수 토큰만(SSoT)" },
  { layer: "컴포넌트", tech: "shadcn/ui", note: "shared/ui 에 래핑, 토큰 구동" },
  { layer: "백엔드", tech: "Supabase", note: "Postgres(truth) + pgvector(검색)" },
  { layer: "AI", tech: "Anthropic", note: "회독 변환 파이프라인(P2/P3 게이트)" },
];

/** FSD 레이어 의존 방향 — 위→아래만 허용. 규칙 정의는 .dependency-cruiser.cjs 가 SSoT. */
const FSD_LAYERS = ["app", "views", "widgets", "features", "entities", "shared"];

const FSD_RULES: { name: string; means: string }[] = [
  { name: "fsd-no-views-to-app", means: "views 는 app 을 import 하지 않는다" },
  { name: "fsd-no-widgets-upward", means: "widgets → 상위(app/views) 금지" },
  { name: "fsd-no-features-upward", means: "features → 상위 금지" },
  { name: "fsd-no-entities-upward", means: "entities → 상위 금지" },
  { name: "fsd-no-shared-upward", means: "shared 는 어떤 상위도 import 금지(최하단)" },
  { name: "fsd-no-cross-slice", means: "같은 레이어 내 슬라이스 간 직접 import 금지" },
  { name: "no-circular", means: "순환 의존 금지" },
];

export function PlatformStack() {
  return (
    <ShowcaseSection
      eyebrow="Platform · 개발 가이드"
      title="스택 & FSD 레이어"
      description="순공대장 웹은 Next.js 15 + FSD 2.1 위에서 돈다. 레이어 의존은 위→아래 단방향만 허용하며, 규칙은 dependency-cruiser 가 코드로 강제한다(게이트: pnpm lint:arch)."
    >
      <ExampleCard title="기술 스택" hint="CLAUDE.md §2 잠긴 결정">
        <RuleTable
          columns={["레이어", "기술", "비고"]}
          rows={STACK.map((s) => [
            <span key="l" className="font-semibold text-[var(--color-text-strong)]">
              {s.layer}
            </span>,
            <span key="t" className="font-semibold text-[var(--color-mint-700)]">
              {s.tech}
            </span>,
            s.note,
          ])}
        />
        <SourceNote>
          <Path>CLAUDE.md §2</Path> (스택 행) · 데이터 아키텍처는{" "}
          <Path>2026-05-19-순공대장_전략_정리.md §3.9</Path>
        </SourceNote>
      </ExampleCard>

      <ExampleCard title="FSD 레이어 의존 방향" hint="위 → 아래 단방향만">
        <div className="flex flex-wrap items-center gap-1.5">
          {FSD_LAYERS.map((l, i) => (
            <React.Fragment key={l}>
              <code className="rounded-[var(--radius-pill)] bg-[var(--color-mint-50)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--color-mint-900)]">
                {l}
              </code>
              {i < FSD_LAYERS.length - 1 ? (
                <span className="select-none text-[var(--color-text-muted)]">→</span>
              ) : null}
            </React.Fragment>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)]">
          상위는 하위를 import 할 수 있고, 하위는 상위를 import 할 수 없다. 같은
          레이어의 다른 슬라이스 간 직접 import 도 금지(public API 경유).
        </p>
        <SourceNote>
          규칙 정의는 <Path>apps/web/.dependency-cruiser.cjs</Path> 가 SSoT · 게이트{" "}
          <Path>pnpm lint:arch</Path>
        </SourceNote>
      </ExampleCard>

      <ExampleCard title="강제되는 의존성 규칙" hint="depcruise — 위반 시 머지 차단">
        <RuleTable
          columns={["규칙", "의미"]}
          rows={FSD_RULES.map((r) => [
            <code key="n" className="font-mono text-[11px] font-semibold text-[var(--color-text-strong)]">
              {r.name}
            </code>,
            r.means,
          ])}
        />
        <SourceNote>
          <Path>apps/web/.dependency-cruiser.cjs</Path> (규칙 이름·정의 모두 여기)
        </SourceNote>
      </ExampleCard>
    </ShowcaseSection>
  );
}

/* ── 2. 배포 · 환경 · PWA · 2026 전략 ─────────────────────── */

const PLATFORM_PHASES: { phase: string; what: string }[] = [
  { phase: "1단계 · 웹", what: "Next.js 웹앱으로 출시 — 검증·반복 속도 우선" },
  { phase: "2단계 · PWA", what: "설치형 PWA(매니페스트·서비스워커·푸시) 로 리텐션 강화" },
  { phase: "3단계 · 네이티브", what: "PMF 검증 후 네이티브(앱스토어) 확장" },
];

export function PlatformDelivery() {
  return (
    <ShowcaseSection
      eyebrow="Platform · 개발 가이드"
      title="배포 · 환경 · PWA · 2026 전략"
      description="배포는 Vercel(프리뷰/프로덕션). PWA 표면(매니페스트·서비스워커·푸시)은 이미 코드에 있다. 플랫폼 진화는 웹 → PWA → 네이티브 순서로 잠겨 있다."
    >
      <ExampleCard title="플랫폼 진화 순서" hint="2026 전략 — 웹 → PWA → 네이티브">
        <div className="space-y-2">
          {PLATFORM_PHASES.map((p) => (
            <div
              key={p.phase}
              className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-3 sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-mint-100)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-mint-900)]">
                {p.phase}
              </span>
              <span className="text-xs leading-relaxed text-[var(--color-text-default)]">
                {p.what}
              </span>
            </div>
          ))}
        </div>
        <SourceNote>
          <Path>2026-05-19-순공대장_전략_정리.md §4.3·§6</Path> (첫 18개월 한국 집중)
        </SourceNote>
      </ExampleCard>

      <ExampleCard title="PWA · 환경 표면" hint="이미 코드에 존재">
        <RuleTable
          columns={["표면", "위치"]}
          rows={[
            ["웹 매니페스트", <Path key="1">apps/web/src/app/manifest.ts</Path>],
            ["서비스 워커", <Path key="2">apps/web/public/sw.js</Path>],
            ["PWA 부트스트랩", <Path key="3">apps/web/src/shared/ui/PwaInit.tsx</Path>],
            ["환경 변수 결정", <Path key="4">docs/setup/2026-05-14-environment-decisions.md</Path>],
          ]}
        />
        <SourceNote>
          푸시는 회독 일정(1/3/7/14일) 알림만 — 잦은 reminder 푸시는 거절 결정(매트릭스).
        </SourceNote>
      </ExampleCard>
    </ShowcaseSection>
  );
}

/* ── 3. 머지 게이트 · 브랜치 · 코드래빗 ─────────────────────── */

const MERGE_GATE: { rule: string; detail: string }[] = [
  { rule: "PR-only", detail: "main 직접 푸시 금지. 모든 변경은 PR 경유" },
  { rule: "브랜치 규약", detail: "기능/수정 코드는 agent/<role>/<id> 브랜치 출신만 머지" },
  { rule: "코드래빗 approve", detail: "필수 게이트. 커밋·PR 본문의 '리뷰 통과' 서술은 무효" },
  { rule: "Tech Lead 구조 리뷰", detail: "코드 PR은 아키텍처 정합성 리뷰를 PR 코멘트로" },
  { rule: "자동 머지 ON", detail: "위 게이트 모두 충족 시 자동 머지(2026-06-20). force/admin 우회 금지" },
];

export function PlatformMergeGate() {
  return (
    <ShowcaseSection
      eyebrow="Platform · 개발 가이드"
      title="머지 게이트 · 브랜치 · 코드래빗"
      description="main 머지는 PR로만, 게이트를 모두 통과한 PR만 자동 머지된다. 우회·강제 머지는 금지(차터 룰7). 디자인 트랙도 동일 게이트를 따른다."
    >
      <ExampleCard title="머지 게이트 5조" hint="CLAUDE.md 머지 게이트">
        <RuleTable
          columns={["규칙", "내용"]}
          rows={MERGE_GATE.map((m) => [
            <span key="r" className="font-semibold text-[var(--color-text-strong)]">
              {m.rule}
            </span>,
            m.detail,
          ])}
        />
        <SourceNote>
          <Path>CLAUDE.md</Path> (머지 게이트 · 코드래빗 운영 패턴) — stale-base 함정·
          @coderabbitai approve 조건 포함
        </SourceNote>
      </ExampleCard>

      <ExampleCard title="브랜치 · 커밋 가드" hint="identity 분리">
        <DoDont
          dos={[
            <>
              feature/fix 는 <Path>agent/&lt;role&gt;/&lt;id&gt;</Path> 브랜치에서 작업
            </>,
            <>
              커밋은 일회용 <Path>-c user.name/-c user.email</Path> 로 개인 identity 강제
            </>,
            <>
              push 는 SSH alias <Path>git@github.com-mugung:…</Path> 로만(개인 계정)
            </>,
          ]}
          donts={[
            <>
              <Path>git config user.*</Path> 수정 (절대 금지)
            </>,
            "회사 계정(treenod-mike)으로 본 repo push",
            "force/admin 머지 · 실패 체크 우회",
          ]}
        />
        <SourceNote>
          <Path>CLAUDE.md §3 Git/Commit · Multica 자율 실행</Path>
        </SourceNote>
      </ExampleCard>
    </ShowcaseSection>
  );
}

/* ── 4. 서비스화 원칙 & 상시 원칙 ─────────────────────────── */

const STANDING: { t: string; d: string; src: string }[] = [
  {
    t: "엔진 회사 정체성",
    d: "콘텐츠 회사가 아니라 회독 리텐션 엔진. 콘텐츠는 사용자 자료 + 평가원 학습목표.",
    src: "전략정리 §3.1 · CLAUDE.md §2",
  },
  {
    t: "브랜드·스타일 keep + UI greenfield",
    d: "브랜드·톤·토큰은 잠금 유지. 그 위의 화면/UI 는 SSoT 안에서 자유롭게 새로 짠다.",
    src: "CLAUDE.md §2 · /styleguide",
  },
  {
    t: "서비스화 가능",
    d: "각 기능은 재사용·확장 가능한 서비스 단위로. 버티컬 확장(수능→공시→자격증) 대비.",
    src: "전략정리 §4.3",
  },
  {
    t: "토큰·아키텍처 lint 게이트",
    d: "색은 토큰만, 다크 금지, 레이어 의존 단방향 — 코드로 강제(드리프트 차단).",
    src: "CLAUDE.md §4 위험 게이트",
  },
];

const LINT_GATES: { cmd: string; checks: string }[] = [
  { cmd: "pnpm lint:tokens", checks: "등록 외 raw hex 차단 (색 SSoT = tokens.css)" },
  { cmd: "pnpm lint:no-dark", checks: "`dark:` 클래스 0건 (Light-only 정책)" },
  { cmd: "pnpm lint:arch", checks: "FSD 레이어 의존성 위반 차단" },
  { cmd: "pnpm lint:sub-scope", checks: "sub-boy/girl 인앱 사용 차단(마케팅 전용)" },
];

export function PlatformPrinciples() {
  return (
    <ShowcaseSection
      eyebrow="Platform · 개발 가이드"
      title="서비스화 원칙 & 상시 원칙"
      description="앞으로 확정되는 모든 개발·디자인 결정이 누적되는 자리(상시 자산화). 새 결정은 별도 티켓으로 이 가이드에 연결한다 — 이 카드들은 현행 잠긴 원칙의 인용이다."
    >
      <ExampleCard title="상시 원칙" hint="결정 발생 시 누적 업데이트">
        <div className="grid gap-3 sm:grid-cols-2">
          {STANDING.map((s) => (
            <div
              key={s.t}
              className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-3"
            >
              <p className="text-sm font-bold text-[var(--color-text-strong)]">
                {s.t}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-default)]">
                {s.d}
              </p>
              <code className="mt-2 block font-mono text-[10px] text-[var(--color-text-muted)]">
                {s.src}
              </code>
            </div>
          ))}
        </div>
      </ExampleCard>

      <ExampleCard title="드리프트 차단 게이트" hint="PR 머지 전 로컬 실행">
        <RuleTable
          columns={["명령", "검사"]}
          rows={LINT_GATES.map((g) => [
            <code key="c" className="font-mono text-[11px] font-semibold text-[var(--color-mint-700)]">
              {g.cmd}
            </code>,
            g.checks,
          ])}
        />
        <SourceNote>
          <Path>CLAUDE.md §4 위험 게이트</Path> · 폐기 방향 회귀 금지 목록은{" "}
          <Path>CLAUDE.md §8</Path>
        </SourceNote>
      </ExampleCard>
    </ShowcaseSection>
  );
}
