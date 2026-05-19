# 순공대장 디자인 총괄 리포트 (Design Master)

> **작성일**: 2026-05-18
> **검증 대상**: feat/p0-day1 branch / P0 Day 1-2 산출물
> **목적**: P0 Day 7 게이트(≥70점) 미리 측정 + 디자인 일관성 종합
> **검증 도구**: design-system:design-review + arch-guard:arch-audit + vercel:react-best-practices

---

## 0. 한 줄 결론

design-review **86/100**, arch-audit **88/100**, react-best-practices Critical 1건 — P0 Day 7 게이트(≥70점) **통과 예측**. P5 게이트(≥80점)도 **통과 예측**. Critical 보정 2건(use client 누락, features→widgets 위반) + Warning 7건을 Day 3-7 내 처리하면 95점 수준 달성 가능.

---

## 1. 디자인 시스템 점수 (design-system:design-review)

| 패턴 | 점수 | 비고 |
|---|---|---|
| Border Radius | 8/10 | Button rounded-md (shadcn 기본값). 커스터마이징 시점에 보정 |
| 색상 토큰 | 7/10 | risk-badge fg 하드코딩 (#fff, #3a2a10) + text-white 2건. var(--color-) 사용 66회로 전반 양호 |
| Typography | 8.5/10 | Pretendard 정상 로딩. 페이지 제목 font-bold → font-extrabold 미전환 (Info 3건) |
| 컴포넌트 구조 | 9.5/10 | props 타입 커버리지 양호. inline 타입 혼용 (Info 1건) |
| 레이아웃 | 9.5/10 | lg:grid-cols 반응형 쌍 일관. p-6/p-4 혼용 (Info 1건) |
| 상호작용 | 8/10 | upload-trigger hover transition 누락 (Warning). Card hover 효과 없음 |
| 접근성 | 7.5/10 | 알림 버튼 aria-label ✅. nav aria-label 누락 + bottom-nav 활성 상태 미구현 |
| 다크모드 | 10/10 | light-only 의도된 설계 (CLAUDE.md §2 폐기 정책). 전 파일 `.dark:` 0건 — 완벽 준수 |
| **합계** | **86/100** | **P0 Day 7 게이트 ≥70 통과 ✅ / P5 게이트 ≥80 통과 ✅** |

### 1.1 강점

- **토큰 준수율 높음**: `var(--color-*)` 사용 66회. 하드코딩 hex는 risk-badge fg 3곳에만 집중.
- **반응형 처리 일관**: `hidden lg:flex` + `lg:hidden` 패턴이 sidebar/bottom-nav에서 정확히 쌍을 이룸.
- **light-only 철저**: `.dark:` 클래스 0건. 잠긴 결정사항 완벽 준수.
- **위험도 채도 2/3 OK**: risk-low(S=46%), risk-high(S=55%). 기준(≤60) 통과.
- **마스코트 접근성**: `role="img" + aria-label` 처리 완비.

### 1.2 보정 필요

| 우선순위 | 항목 | 파일 | 수정 |
|---|---|---|---|
| **Critical** | risk-badge fg 하드코딩 | `entities/quest/ui/risk-badge.tsx` | `var(--color-text-inverse)` / `var(--color-text-strong)` |
| **Warning** | text-white 하드코딩 | `upload-trigger.tsx`, `quest-card.tsx` | `text-[var(--color-text-inverse)]` |
| **Warning** | upload-trigger transition 누락 | `upload-trigger.tsx` | `transition-colors` 추가 |
| **Warning** | bottom-nav 활성 상태 없음 | `bottom-nav.tsx` | `usePathname()` + `aria-current="page"` |
| **Info** | risk-mid 채도 65% (기준 ≤60) | `tokens.css` | `#E8BC96` (S≈58%)로 낮춤 |
| **Info** | XP 채도 86% | `tokens.css` | UI master §1.2 "만족감" 축 의도적 예외로 유지 가능 |
| **Info** | nav aria-label 누락 | `sidebar.tsx`, `bottom-nav.tsx` | `aria-label="메인 내비게이션"` |

---

## 2. FSD 아키텍처 점수 (arch-guard:arch-audit)

| 패턴 | 위반 수 | 비고 |
|---|---|---|
| FSD 레이어 의존성 | Critical 1 / Info 4 | features→widgets Critical + deep import Info 4 |
| Server Actions + useMutation | 0 | P0 mock 단계, Server Action 없음 |
| Re-export (index.ts) | Warning 1 | entities 슬라이스 index.ts 없음 |
| Facade (파일 크기) | 0 | 최대 140줄. 전 파일 300줄 미만 |
| useEffectEvent | 0 | useEffect 0건. 해당 없음 |
| Zustand | 0 | P0 단계 미도입 |

**아키텍처 점수: 88/100** 🟡 양호

### 2.1 Critical 위반 상세

**`features/upload-source/ui/upload-trigger.tsx:4`** — features → widgets 역방향 import

```tsx
// 현재 (FSD 위반)
import { UploadSheet } from "@/widgets/upload-sheet/ui/upload-sheet";

// 권장 A: UploadTrigger + UploadSheet를 하나의 widget으로 통합
// widgets/upload/ui/upload-trigger.tsx (widget으로 격상)
// → features는 비즈니스 로직만, UI 조합은 widget이 담당

// 권장 B (단기 fix): UploadSheet를 features/upload-source/ 안으로 이동
```

> **⚠️ views rename 메모**: FSD `pages` → `views` rename은 Next.js App Router 충돌 회피용 **의도된 설계**. false positive 아님. 레이어 순서(app→views→widgets→features→entities→shared)는 정상 유지.

### 2.2 Warning 위반 상세

**`entities/quest/`, `entities/user-game-state/`** — index.ts 없음. 외부에서 내부 경로 직접 import 중.

```ts
// 현재 (deep import)
import { useTodayQuests } from "@/entities/quest/model/use-today-quests";
import { RiskBadge } from "@/entities/quest/ui/risk-badge";

// 권장
// entities/quest/index.ts 생성
export { RiskBadge } from "./ui/risk-badge";
export { useTodayQuests } from "./model/use-today-quests";

// 사용처
import { RiskBadge, useTodayQuests } from "@/entities/quest";
```

---

## 3. React 베스트 프랙티스 (vercel:react-best-practices)

### 3.1 Critical — `"use client"` 누락 (런타임 오류 가능성)

| 파일 | 문제 | 수정 |
|---|---|---|
| `widgets/stats-grid/ui/stats-grid.tsx` | `useGameState()` hook 호출하면서 `"use client"` 없음 | 상단에 `"use client"` 추가 |
| `widgets/quest-list/ui/quest-list.tsx` | `useTodayQuests()` hook 호출하면서 `"use client"` 없음 | 상단에 `"use client"` 추가 또는 RSC prop 패턴 전환 |

> `useGameState`와 `useTodayQuests`가 현재 mock 데이터를 순수 반환하는 함수라면 런타임 오류는 없지만, hook 형태(`use` 접두사)를 유지하는 한 명시적 `"use client"` 추가가 안전.

### 3.2 Warning (3건)

| 컴포넌트 | 이슈 | 권장 |
|---|---|---|
| `bottom-nav.tsx` | `usePathname()` 미사용 — 활성 링크 상태 없음 | `"use client"` + `usePathname()` + `aria-current="page"` |
| `quest-card.tsx` | `<Link>` 안에 `<Button>` 중첩 — interactive 중첩 | `<Link>`를 버튼처럼 직접 스타일링 (`asChild` 패턴 또는 Link 단독) |
| `sidebar.tsx`, `bottom-nav.tsx` | `<nav>` `aria-label` 누락 | `aria-label="메인 내비게이션"` 추가 |

### 3.3 Info (5건)

| 항목 | 상태 |
|---|---|
| 상수 컴포넌트 외부 hoist | 모두 올바름 ✅ (`ITEMS`, `SUBJECTS`, `NUMBER_GLYPH` 등) |
| inline component 정의 | 없음 ✅ |
| useEffect 0건 | 불필요한 부작용 없음 ✅ |
| Props 타입 정의 | 양호. interface 분리 일관성 Info 수준 |
| useCallback/useMemo | 현 규모에서 미필요. P5 실데이터 전환 시 재검토 |

---

## 4. 종합 권장 (우선순위)

### Critical (즉시 처리 — P0 Day 3 이전)

1. **`stats-grid.tsx`, `quest-list.tsx` — `"use client"` 추가**
   - `useGameState`, `useTodayQuests`가 hook 형태인 한 필수
   - 수정 1줄 × 2파일, 리스크 없음

2. **`upload-trigger.tsx` — features→widgets 위반 구조 보정**
   - 단기: `UploadSheet`를 `features/upload-source/ui/` 안으로 이동
   - 장기(P5): `UploadTrigger` + `UploadSheet`를 `widgets/upload/`로 통합

### Major (P0 Day 5-7 처리)

3. **`risk-badge.tsx` fg 색상 토큰화** — `#fff` → `var(--color-text-inverse)`, `#3a2a10` → `var(--color-text-strong)`
4. **`upload-trigger.tsx`, `quest-card.tsx` — `text-white` → `text-[var(--color-text-inverse)]`**
5. **entities index.ts 생성** — `entities/quest/index.ts`, `entities/user-game-state/index.ts`

### Minor (P5 진입 전 처리)

6. **`bottom-nav.tsx` 활성 상태** — `usePathname()` + `aria-current="page"`
7. **nav `aria-label`** — sidebar.tsx, bottom-nav.tsx
8. **`tokens.css` risk-mid 채도** — `#E6B788`(S=65%) → `#E8BC96`(S=58%) (기준 ≤60 맞춤)
9. **페이지 제목 font-bold → font-extrabold** — result, calendar, graph, admin, diary, wrong-notes 6개 페이지

---

## 5. P0 Day 7 게이트 예측

| 게이트 | 기준 | 현재 점수 | 예측 |
|---|---|---|---|
| design-review ≥70 | 70점 | **86/100** | **통과 ✅** |
| design-review ≥80 (P5 게이트) | 80점 | **86/100** | **통과 ✅** |
| arch-audit 건전성 | Critical 0건 권장 | Critical 1건 | Critical 1건 보정 후 통과 ✅ |
| react-best-practices | Critical 0건 권장 | Critical 1건 (`use client`) | Critical 보정 후 통과 ✅ |
| E2E 7개 시나리오 | 모두 통과 | P0 Day 7 작업 — 본 리포트 범위 외 | 측정 불가 |

> Critical 2건(use client 누락 + features→widgets)만 보정하면 Day 7 게이트 여유 통과.

---

## 6. 다음 단계

UI master spec §3.5 dispatch (5) design-review dry-run 완료.

**권장 진행순서**:

1. Critical 2건 즉시 보정 (Day 3 시작 전, 각 5분 이내 수정)
   - `stats-grid.tsx` + `quest-list.tsx` → `"use client"` 추가
   - `upload-trigger.tsx` → `UploadSheet` features 내부로 이동
2. Major 3건 Day 5-6 처리 (토큰화 + entities index.ts)
3. Minor는 P5 진입 전 일괄 처리
4. Spec §3.5 (6) **Mike 최종 OK** → 토큰 PR 머지 진행 권유

---

## 7. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| v1.0 | 2026-05-18 | 초안. 3 skill 합성. design-review 86/100, arch-audit 88/100, react-best-practices Critical 1건. |
