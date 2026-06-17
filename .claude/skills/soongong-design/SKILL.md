---
name: soongong-design
description: Use when working on 순공대장 UI — building or editing a screen/component, touching design tokens, color, theming, the /styleguide surface, brand or mascot assets, or any styling in apps/web. Loads the locked design rules and where each value/spec actually lives. Triggers on tokens.css, hardcoded hex, dark mode, 듀공/마스코트, 회독마왕/Ocean regression.
---

# 순공대장 디자인 가이드 (규칙 + SSoT 위치)

## 핵심 원칙

이 skill은 **행동 규칙과 길잡이**다. **값 사전이 아니다.**

색·토큰·치수의 단일 출처(SSoT)는 `apps/web/src/shared/styles/tokens.css` 하나뿐이다. 값을 이 문서(또는 다른 문서/컴포넌트)에 복사하면 **두 번째 SSoT**가 생기고, 토큰을 바꿀 때 drift가 난다 — 우리가 Ocean→v2 전환에서 실제로 겪은 사고. 그래서 여기엔 hex 한 글자도 없다. 값이 필요하면 항상 tokens.css를 import/참조하라.

## SSoT 위치 (값·스펙은 여기서 읽는다)

| 무엇 | 어디 |
|---|---|
| **색·radius·간격 값** (유일한 SSoT) | `apps/web/src/shared/styles/tokens.css` |
| **토큰 추가/사용 규칙** | `docs/design-tokens.md` |
| **디자인 시스템 스펙 v2.0** (팔레트·로고·레이아웃·반응형·마스코트·플랫아이콘) | `docs/design-system/2026-06-09-design-system-lock.md` |
| **화면별 인터랙션·표시 규칙** | `docs/design-system/2026-06-09-interaction-spec.md` |
| **시각 surface** (토큰/컴포넌트 눈으로 확인) | `/styleguide` 라우트 — `apps/web/src/views/styleguide/` |
| **`/styleguide` 고정 리뷰 URL·접근** | `docs/ops/styleguide-review-access.md` |
| **잠긴 결정 / 폐기 정책** | `CLAUDE.md` §2(잠긴 결정), §8(회귀 금지) |

값이나 스펙을 옮겨 적고 싶으면 멈춰라. 옮기지 말고 위 경로를 가리켜라.

## 변하지 않는 규칙

1. **Light-only.** 다크모드 변형 0. 라이트 단일 톤(Light Study Garden). 다크 추가 제안은 거절하고 Mike 확인. (게이트: `pnpm lint:no-dark`)
2. **하드코딩 hex 금지.** 모든 색은 tokens.css의 CSS 변수/시맨틱 토큰으로만 참조. 컴포넌트·문서·스킬에 raw hex 리터럴 금지. (게이트: `pnpm lint:tokens` — 등록 외 hex 차단)
3. **두 번째 SSoT 금지.** 토큰 값·디자인 스펙을 다른 파일에 복붙하지 마라. import 또는 경로 참조만. styleguide 에디터의 seed 값도 tokens.css에서 import한다 (직접 박지 않는다).
4. **자산 2트랙.** 플랫(in-app UI) / 3D(마케팅) 자산을 분리 관리한다. 트랙을 섞지 마라.
5. **마스코트 락.** 마스코트는 듀공 모티프 "순공이" 하나로 고정. 다른 마스코트·식물 모티프(씨앗/새싹/꽃 등급 등) 도입 금지.
6. **폐기 방향 회귀 금지.** 회독마왕 / 다크 네이비 / Dark Study RPG / 구 Ocean 팔레트 / 토스 단일 reference로의 회귀 제안은 거절하고 Mike 확인. (목록·근거: `CLAUDE.md` §8)
7. **`/styleguide` = 출발점·근간.** `/styleguide`는 모든 디자인·브랜드 가이드라인을 눈으로 확인하는 정본 surface이자 출발점이다. 새 화면/컴포넌트는 여기서 토큰·컴포넌트 패턴을 먼저 확인하고 시작한다. 고정 리뷰 URL·접근 방법은 `docs/ops/styleguide-review-access.md`를 경로 참조(URL을 다른 파일에 복붙하지 말 것).

## 작업 전 / 후

- **전**: tokens.css와 `/styleguide`에서 쓸 토큰을 먼저 확인. 필요한 값이 없으면 새 hex를 박지 말고 `docs/design-tokens.md`의 토큰 추가 규칙을 따라 tokens.css에 등록.
- **후 (PR 올리기 전)**: 로컬에서 `pnpm lint:tokens` + `pnpm lint:no-dark`를 직접 실행해 통과시킨다. 실패하면 고쳐서 다시 올린다. 이 둘은 `CLAUDE.md` §4 위험 게이트·머지 게이트가 요구하는 **로컬·리뷰 단계 검사**이며, 현재 `.github/workflows`에 자동 CI나 브랜치 보호로 강제되지는 않는다 — 그러니 에이전트가 손수 돌려야 한다.

## Red Flags — 멈추고 다시 보라

- 컴포넌트/문서에 `#`으로 시작하는 색을 직접 적고 있다 → tokens.css 변수로.
- 다크모드/네이비 변형을 추가하고 있다 → light-only 위반.
- tokens.css 값이나 lock 문서 스펙을 다른 파일로 복사하고 있다 → 두 번째 SSoT.
- 마스코트를 듀공이 아닌 것으로 바꾸거나 식물 등급을 도입하고 있다 → 잠긴 결정 위반.
- "구 Ocean이 더 나으니 되돌리자" → §8 폐기 정책 위반, Mike 확인 필요.
