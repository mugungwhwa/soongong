# 글로벌 텍스트 표준 — 줄바꿈 + i18n 기반 (SOO-158)

> 배분: 플랫폼·인프라 리드(표준/CSS·i18n 기반, 본 문서) + UI·디자인 리드(화면별 카피 적용).
> 연계: SOO-144(#160, 홈 `/today` 한글 줄바꿈 선처리) · `docs/design-system/2026-06-09-design-system-lock.md`(팔레트·레이아웃 SSoT) · `transcendent-translation` skill(초월번역 원칙 원본).

## 1. 진단 (변경 전)

- `word-break`/`keep-all`/`text-wrap`(`balance`/`pretty`)/`overflow-wrap` 처리가 저장소 전체에 `apps/web/src/views/brand-hero/ui/brand-hero-page.tsx` 1건(`break-keep` 개별 클래스)뿐 — 표준 없이 컴포넌트 단위 애드혹.
- i18n 라이브러리(next-intl 등) 미도입. 문자열 전부 하드코딩 한국어. `html lang="ko"` 고정(`apps/web/src/app/layout.tsx`).
- 결과: 모바일 좁은 폭에서 한글이 어절 중간(음절 단위)에서 끊기는 현상 다발 — Mike 리포트 원인.

## 2. 표준 — 텍스트 줄바꿈 (구현 완료)

`apps/web/src/app/globals.css`에 전역 base 규칙으로 추가했다 (컴포넌트마다 클래스를 붙일 필요 없음):

```css
:lang(ko),
:lang(ja),
:lang(zh) {
  word-break: keep-all;      /* CJK는 어절 경계에서만 줄바꿈 */
  overflow-wrap: break-word;
}

:lang(en) {
  overflow-wrap: anywhere;   /* 라틴 긴 토큰은 컨테이너 넘침 방지 */
  hyphens: auto;
}

h1, h2, h3, h4, h5, h6 { text-wrap: balance; }  /* 제목 — 마지막 줄 단어 하나만 남는 현상 방지 */
p { text-wrap: pretty; }                          /* 본문 — 마지막 줄 orphan 방지 */
```

**왜 `:lang()` 셀렉터인가**: `<html lang="ko">`(현재 전 페이지 고정값)를 기준으로 상속되므로, i18n 라우팅이 들어와 `lang`이 페이지별로 바뀌어도 CSS 수정 없이 자동으로 언어별 규칙이 적용된다. 클래스 기반(`break-keep` 등)은 컴포넌트마다 잊어버리기 쉬워 이번 버그의 원인이 됐다.

**컴포넌트 단위 파인튜닝**은 Tailwind 내장 유틸(`break-keep`, `text-balance`, `text-pretty`, `break-words`)을 그대로 쓰면 된다 — 전역 규칙과 값이 동일하므로 override가 아니라 명시적 표기 용도로만 사용할 것. h1~h6/p 태그가 아닌 요소(예: `<div>` 타이틀, 카드 내 span)에 balance/pretty가 필요하면 `text-balance`/`text-pretty` 클래스를 개별로 붙인다 — 화면 적용은 UI·디자인 리드 담당 범위(분담표 참조).

## 3. i18n 기반 도입 — 검토 결과 (미착수, 권고안)

**현재 미도입 상태를 유지하고 이번 티켓에서는 착수하지 않는다.** 이유:

- 문자열이 전 화면에 하드코딩되어 있어 실제 마이그레이션은 전체 컴포넌트 트리를 순회하는 별도 규모의 작업(다건 PR)이 필요 — 본 티켓(CSS 표준 + 검토)의 스코프를 초과.
- §6(전략정리) "버티컬·글로벌 순서" — 글로벌 진출은 일본(3-5년) 이후, 첫 18개월은 한국 집중이 잠긴 결정. 지금 시점에 다국어 런타임을 깔 사업적 필요가 없음.

**권고**: 실제 착수 시점(글로벌 확장 준비 단계)에는 **next-intl**을 채택한다.
- Next.js 15 App Router 네이티브 지원(공식 채택 사례 다수), `next-i18next`(Pages Router 시절 설계) 대비 App Router App Directory와 정합적.
- 마이그레이션 순서(향후 별도 티켓): (1) `messages/ko.json` 생성 후 기존 하드코딩 문자열을 키로 추출 → (2) `next-intl` provider를 `layout.tsx`에 장착, `html lang`을 동적으로 바인딩 → (3) 화면별로 `useTranslations()` 전환, 이 시점에 위 §2 CSS 표준이 자동으로 언어별 규칙을 넘겨받음(추가 CSS 작업 불필요) → (4) `en.json` 등 신규 로케일 추가.
- 지금 해둘 준비: 문자열을 하드코딩할 때도 UI 문구를 컴포넌트 밖 상수(예: 화면별 `copy.ts`)로 분리해두면 훗날 키 추출 비용이 줄어든다 — 강제 규칙은 아니고 권장.

## 4. 초월번역(의도보존 번역) 원칙 — 문자열 사전 설계 기준

원본은 `transcendent-translation` skill(4 Pillars: Intent over Literal / Layer-Aware L0-L1-L2 / Layout-Stable / Domain-Consistent)이 SSoT다. 본 문서는 값을 복붙하지 않고 순공대장 맥락에서 **언제 참조해야 하는지만** 못박는다:

- next-intl 도입 후 `messages/*.json`에 새 키를 추가할 때는 항상 skill의 "Workflow When Adding a New i18n String" 7단계를 따른다.
- 순공대장 레이어 매핑: **L0**=브랜드 히어로/랜딩(`views/brand-hero`), **L1**=인앱 화면 전체(오늘/저니/결과/오답노트 등 회독퀘스트 UI), **L2**=현재 해당 없음(수능 백서·방법론 문서가 생기면 적용).
- 용어 글로서리는 이미 본 CLAUDE.md §2 잠긴 결정사항이 사실상의 glossary 역할을 한다 (예: "회독퀘스트"/"순공냅스"/"기억HP" 등 고정 명칭) — 새 다국어 키를 만들 때 이 표를 먼저 확인해 동일 개념에 다른 번역이 붙지 않게 한다.

## 5. DoD 체크리스트

- [x] 모바일 한글 어절 단위 줄바꿈 — `:lang(ko)` 전역 규칙으로 전 화면 자동 적용 확인.
- [x] 표준 문서화 (design-system 반영) — 본 문서.
- [ ] `pnpm lint:arch` green (PR 시점 CI/로컬 확인).
- [ ] Tech Lead 구조 리뷰 (PR 코멘트).
