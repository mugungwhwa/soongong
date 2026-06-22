# 순공대장 디자인 토큰 SSoT

> **시각적 출발점**: 모든 디자인·브랜드 가이드라인의 근간은 `/styleguide` (공개 live guide · noindex unlisted, SOO-106). 접근 → [docs/ops/styleguide-review-access.md](ops/styleguide-review-access.md)

본 문서는 순공대장 디자인 토큰의 단일 진실 공급원(SSoT)이다.

**코드 SoT**: `apps/web/src/shared/styles/tokens.css` (CSS `:root --*` 변수)
**stack**: Tailwind v4 (CSS-first) — `apps/web/postcss.config.mjs`의 `@tailwindcss/postcss` 단일 플러그인. v3식 `tailwind.config.ts` 파일은 **사용하지 않음**.
**메타 SSoT**: 본 문서 + `01_제품_UX_게임화/순공대장_UI_설계.md` §3
**lint enforcement**: `pnpm lint:tokens` (`apps/web/scripts/check-tokens.ts`) — 등록 외 hex 차단.

---

## 1. 톤 잠금 (Light Study Garden)

순공대장 UI는 **Light Study Garden** 단일 톤. 다크모드 도입 / 어두운 RPG 톤 회귀 금지 (구체 폐기 목록은 CLAUDE.md §8에 잠금 — 본 문서는 참조).
- 베이스: 크림 계열 `#F8FBF7` (`--color-bg` — 코드 SoT `tokens.css` 기준)
- 강조: **teal `#7BC4AE`** (메인 브랜드 기본색, 시안 UI v2 앵커) — `--color-xp`는 soft golden `#F2C94C`로 차별
- 위험도: soft 톤 (mid=warning `#FFEBA3` / high=danger `#FFB4B4`)

> **색 팔레트 = 시안 UI v2 (teal/green)** (2026-06-16 SOO-45). 앵커 SSoT: `#A8DCCB` / `#7BC4AE` / `#4CAF88` / `#FFEBA3` / `#FFB4B4` / `#6BA6FF` / `#8E8E93`. CSS 변수명은 호환 위해 `--color-mint-*` 유지하되 **값은 teal**(`300`=`#A8DCCB` / `500`=`#7BC4AE` primary / `700`=`#4CAF88`).
>
> ⚠️ **전환 이력**: 직전 잠금 Ocean(`#2AB8D0`, SOO-17) → 본 v2 teal 전환(SOO-260616-01). CLAUDE.md §2/§8 · `design-system-lock.md` v2.0 동반 갱신 **완료**. **primary CTA fill = `#4CAF88` 확정**(2026-06-16 Mike, 후보 B; 후보 A `#5E9C7B` 미채택). text 4단은 중성 그레이(`#2E2E2E`/`#6E6E6E`/`#9B9B9B`/`#BBBBBB`)로 확정.

---

## 2. 토큰 카테고리

`tokens.css`에 정의된 카테고리 전체:

| 카테고리 | 변수 prefix | 비고 |
|---|---|---|
| Primary CTA | `--color-primary-cta`, `--color-primary-bg` | **확정** CTA fill `#4CAF88` (2026-06-16 Mike, 후보 B; A `#5E9C7B` 미채택) / 연한 배경 `#EAF4EE`(파생) |
| Surface | `--color-bg`(`#F8FBF7`), `--color-bg-elevated`(`#FFFFFF`), `--color-bg-sunken`(`#EFF5F1` bg-soft) | 크림 베이스 + teal 재조율 |
| Brand (teal v2) | `--color-mint-{50,100,300,500,700,900}` | 변수명 호환 위해 `mint` 유지, **값 = teal 앵커** (`300`=`#A8DCCB` / `500`=`#7BC4AE` primary / `700`=`#4CAF88`). 50/100/900=파생 |
| Risk | `--color-risk-{low,mid,high}` | 회독 위험도. low=`#BFE3C9`(파생) / mid=`#FFEBA3`(warning앵커) / high=`#FFB4B4`(danger앵커) |
| Semantic state | `--color-{info,danger,warning,neutral}` | info `#6BA6FF` / danger `#FFB4B4` / warning `#FFEBA3` / neutral·disabled `#8E8E93` |
| State bg | `--color-{risk-bg,warning-bg,info-bg}` | danger `#FFEFEF` / warning `#FFF8E0` / info `#EAF2FF` (파생 틴트) |
| Reward / XP | `--color-xp`, `--color-xp-soft` | Duolingo `#ffc800`과 차별, gold 유지 |
| Text | `--color-text-{strong,default,muted,disabled,inverse,on-warm}` | 4단 중성 그레이 `#2E2E2E`/`#6E6E6E`/`#9B9B9B`/`#BBBBBB` + inverse/on-warm |
| Border | `--color-border-{default,strong}` | teal 재조율 (`#E3EDE7` border-soft / `#9CCBB7`) |
| Gradient | `--gradient-quest-map` | teal 재조율, 등록 gradient만 사용 (lint 통과 대상) |
| Radius | `--radius-{sm,md,lg,xl,pill}` | 8/12/16/24/9999px |
| Spacing | `--space-{1..12}` | 4px base, scale 1=4 / 2=8 / 4=16 / 6=24 / 12=48 |
| Shadow | `--shadow-{card,elevated}` | v2 teal alpha 기반 (rgba(46,125,91,…), `#2E7D5B`) — 구 오션톤(rgba(14,92,130,…)) 폐기 |
| Motion | `--ease-out-soft`, `--duration-{fast,mid,slow}` | 160/240/380ms |
| Typography | `--font-{display,body}` | Pretendard 단일 (v1.3.9 webfont) |

---

## 3. 토큰 추가 규칙

새 토큰(색상/spacing/radius/shadow/motion) 추가 시 **반드시 두 곳에 등재**:

1. `apps/web/src/shared/styles/tokens.css` — `:root` 안에 `--<category>-<name>` 형식 추가
2. 본 문서 §2 표에 카테고리 행 갱신 (또는 신규 카테고리 추가)

추가 후 `pnpm lint:tokens` 통과 확인. 등록되지 않은 hex 리터럴이 코드에 등장하면 lint fail.

**금지된 토큰 추가 사례** (CLAUDE.md §8 / UI 설계.md §3 회귀 금지):
- 어두운 네이비 계열 (`#0F1419`, `#1A2332` 류) — 어두운 베이스 회귀 금지
- Duolingo 형광 노랑 (`#ffc800` 정확치 또는 채도 ≥90 노랑)
- 채도 ≥70 위험 적색 (현재 `--color-risk-high: #E29B9B`은 채도 ≤60 잠금)

---

## 4. 사용 규칙

- Tailwind v4 utility는 토큰을 자동으로 인식 (e.g. `bg-[var(--color-mint-500)]` 또는 v4 theme 매핑된 단축 클래스).
- 직접 hex 사용 금지 — `lint:tokens`가 차단.
- gradient는 `--gradient-*` 변수 또는 명시적으로 등록된 것만 (인라인 `linear-gradient()` 직접 사용 시 lint fail).
- `surface-play` 같은 화면별 강제 클래스는 컴포넌트 레벨에서 추가 가능 (UI 설계.md §8 E 참조).

---

## 5. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-19** | **초안. P0 와꾸 단계가 깔아놓은 `tokens.css` 기준 SSoT 메타 문서. P1 sub-plan Task 1 Step 3 산물.** |
| **v1.1** | **2026-06-16** | **SOO-45: 시안 UI v2(teal/green) 팔레트 교체. 앵커 7종(`#A8DCCB`/`#7BC4AE`/`#4CAF88`/`#FFEBA3`/`#FFB4B4`/`#6BA6FF`/`#8E8E93`)으로 mint 스케일·risk·semantic state·border·gradient·shadow 재매핑. 신규 카테고리: Primary CTA(`#___` placeholder, Mike 확정 대기), Semantic state(info/danger/warning/neutral), text-disabled 추가. Ocean(SOO-17)→teal 전환 — CLAUDE.md §2/§8·design-system-lock v1.0 동반 갱신 필요(Mike 확인 대기). `pnpm lint:tokens` 통과(30 토큰), `pnpm build` 통과.** |
| **v1.2** | **2026-06-16** | **SOO-45: Mike 확정 맵 반영. primary CTA fill = `#5E9C7B` 확정(placeholder 대체), `--color-primary-bg`(`#EAF4EE`) 신규. bg-soft `#EFF5F1`·border-soft `#E3EDE7`·state bg(danger `#FFEFEF`/warning `#FFF8E0`/info `#EAF2FF`) 확정값 반영. text 4단을 중성 그레이(`#2E2E2E`/`#6E6E6E`/`#9B9B9B`/`#BBBBBB`)로 확정. `pnpm lint:tokens` 통과(32 토큰), `pnpm build` 통과.** |
