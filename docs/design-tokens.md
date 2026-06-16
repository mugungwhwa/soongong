# 순공대장 디자인 토큰 SSoT

본 문서는 순공대장 디자인 토큰의 단일 진실 공급원(SSoT)이다.

**코드 SoT**: `apps/web/src/shared/styles/tokens.css` (CSS `:root --*` 변수)
**stack**: Tailwind v4 (CSS-first) — `apps/web/postcss.config.mjs`의 `@tailwindcss/postcss` 단일 플러그인. v3식 `tailwind.config.ts` 파일은 **사용하지 않음**.
**메타 SSoT**: 본 문서 + `01_제품_UX_게임화/순공대장_UI_설계.md` §3
**lint enforcement**: `pnpm lint:tokens` (`apps/web/scripts/check-tokens.ts`) — 등록 외 hex 차단.

---

## 1. 톤 잠금 (Light Study Garden)

순공대장 UI는 **Light Study Garden** 단일 톤. 다크모드 도입 / 어두운 RPG 톤 회귀 금지 (구체 폐기 목록은 CLAUDE.md §8에 잠금 — 본 문서는 참조).
- 베이스: 크림 계열 (`--color-bg` 등 — 코드 SoT `tokens.css` 기준)
- 강조: **Teal/Mint `#7BC4AE`** (메인 브랜드 기본색, `design-system-lock.md` v2.0 v2 팔레트) — `--color-xp`는 soft golden `#F2C94C`로 차별
- 위험도: 채도 ≤60 soft 톤 (UI 설계.md §3)

> **색 팔레트 = v2 Teal/Mint** (2026-06-16 SOO-260616-01 잠금, Mike 명시 승인). 구 Ocean(`#2AB8D0`/`#1A8FAD`/`#0E5C82`, 2026-06-09 v1.0)은 폐기. CSS 변수명은 호환 위해 `--color-mint-*` 유지하되 **값은 v2**(`300`=`#A8DCCB` / `500`=`#7BC4AE` primary / `700`=`#4CAF88` primary-strong / `900`=`#2E7D5B`). 앵커 SSoT = 시안 UI EXAMPLE v1.0. 전체 스케일은 `docs/design-system/2026-06-09-design-system-lock.md` §1 (v2.0).
>
> **primary CTA 최종색**: 후보 A `#5E9C7B` / 후보 B `#4CAF88` 병기, **Mike 확인 대기** (tokens.css `--color-cta` 주석 참조).

---

## 2. 토큰 카테고리

`tokens.css`에 정의된 카테고리 전체:

| 카테고리 | 변수 prefix | 비고 |
|---|---|---|
| Surface | `--color-bg`, `--color-bg-elevated`, `--color-bg-sunken` | Light Study Garden 베이스 |
| Brand (v2 Teal/Mint) | `--color-mint-{50,100,300,500,700,900}` | 변수명은 호환 위해 `mint` 유지, **값 = v2 팔레트** (`300`=`#A8DCCB` / `500`=`#7BC4AE` primary / `700`=`#4CAF88` primary-strong). lock v2.0 |
| Risk (망각위험) | `--color-risk-{low,mid,high}` | 회독 위험도, soft (채도 ≤60). **팔레트 무관 고정** (lock §1-2) |
| State | `--color-{danger,warning,info,neutral}` + `*-bg` | v2 앵커: danger `#FFB4B4` / warning `#FFEBA3` / info `#6BA6FF` / neutral·disabled `#8E8E93` |
| Reward / XP | `--color-xp`, `--color-xp-soft` | Duolingo `#ffc800`과 차별 (gold 유지) |
| Text | `--color-text-{strong,default,muted,disabled,inverse,on-warm}` | 4단(primary/secondary/tertiary/disabled) + inverse/on-warm |
| Border | `--color-border-{default,strong}` | 2단계 |
| Gradient | `--gradient-quest-map` | 등록 gradient만 사용 (lint 통과 대상) |
| Radius | `--radius-{sm,md,lg,xl,pill}` | 8/12/16/24/9999px |
| Spacing | `--space-{1..12}` | 4px base, scale 1=4 / 2=8 / 4=16 / 6=24 / 12=48 |
| Shadow | `--shadow-{card,elevated}` | v2 green alpha 기반 (rgba(46,125,91,…)) |
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
| **v1.1** | **2026-06-16** | **팔레트 Ocean → v2 Teal/Mint 교체 (SOO-260616-01, Mike 명시 승인). §1 강조색·blockquote, §2 Brand·Risk·State·Text·Shadow 행 갱신. State 토큰(danger/warning/info/neutral) 신규. text 4단 + disabled. primary CTA 2후보 병기·Mike 대기. 구 Ocean hex 전량 폐기.** |
