# 순공대장 디자인 시스템 잠금 v2.1

> **⚠️ 팔레트 v2.0 (2026-06-16, SOO-260616-01)**: 색 팔레트를 구 Ocean → **v2 Teal/Mint**로 교체(Mike 명시 승인, 토큰 본체는 #58로 선반영). 아래 §1 의 스케일·hex는 모두 v2 값이며, 구 Ocean(`#2AB8D0`/`#1A8FAD`/`#0E5C82`)은 폐기. 섹션 라벨에 남은 "Ocean/o50~o900"은 히스토리 표기 — **변수 슬롯명이며 값은 v2**. 앵커 SSoT = 시안 UI EXAMPLE v1.0(`#A8DCCB`/`#7BC4AE`/`#4CAF88`/`#FFEBA3`/`#FFB4B4`/`#6BA6FF`/`#8E8E93`). primary CTA = `#4CAF88`(후보 B 확정).
> **SSoT 출처**: SOO-19 v3 커밋 `110076f` (2026-06-09 확정, 팔레트만 v2.0에서 교체).  
> **Mike 방향 확정값**: 색 = v2 Teal/Mint (구 바다(Ocean) 폐기), 로고 = A안, 레이아웃 = v3.  
> tokens.css 실적용은 SOO-16/15 이후 구현 단계로 파킹 — **본 문서는 스펙 잠금 전용**.

---

## 1. v2 Teal/Mint 팔레트 (구 Ocean 폐기)

### 1-1. 전체 스케일

| 토큰명 | Hex | CSS 변수 | 용도 |
|---|---|---|---|
| o50 | `#EAF6F1` | `--m50` | 호버 배경 / 태그·배지 배경 |
| o100 | `#D2EBE2` | `--m100` | Active 배경 (연한 강조) / 게임바 fill 배경 |
| o300 | `#A8DCCB` | `--m300` | XP 게이지 fill / 보조 아이콘 / 보조 강조 |
| o500 | `#7BC4AE` | `--m500` | 메인 브랜드 기본색 (스킬바 fill 등) |
| o700 | `#4CAF88` | `--m700` | 메인 버튼 / Active 아이콘 · 텍스트 / Active 상태 |
| o900 | `#2E7D5B` | `--m900` | 강한 강조 / GameBar 배경 / 로고 기본색 / CTA 버튼 |

**배경 계열 (크림 기반 유지)**

| 토큰명 | Hex | CSS 변수 | 용도 |
|---|---|---|---|
| bg | `#F6FBF8` | `--bg` | 페이지 배경 |
| bg-el | `#FFFFFF` | `--bg-el` | 카드 / 컴포넌트 표면 |
| bg-sun | `#E4F2EC` | `--bg-sun` | **비텍스트 accent 전용** — 진행바 트랙 / 아이콘 칩 / journey 데코·그라데이션. ※ 인용·지문·원칙 등 **텍스트 블록은 흰색(surface) 기본** (오션 틴트 0, SOO-43 / Mike "블록은 흰색으로"). 텍스트 블록 구분은 hairline border 로. |

**텍스트 계열**

| 토큰명 | Hex | CSS 변수 | 용도 |
|---|---|---|---|
| ts | `#0C2535` | `--ts` | 주요 텍스트 (타이틀) |
| td | `#1C3848` | `--td` | 본문 텍스트 |
| tm | `#4A7585` | `--tm` | 보조 텍스트 / placeholder |

**보더 계열**

| 토큰명 | Hex | CSS 변수 | 용도 |
|---|---|---|---|
| bd | `#CDE7DD` | `--bd` | 기본 보더 |
| bs | `#9FD3C0` | `--bs` | 강조 보더 |

**그라데이션 (body 배경)**

| 역할 | 시작(gs) | 종료(ge) |
|---|---|---|
| 페이지 바깥 그라데이션 | `#4CAF88` (o700) | `#2E7D5B` (o900) |

### 1-2. 위험도 색상 — 오션 예외 (기능 전용)

위험도 색은 팔레트가 바뀌어도 **고정** (오션 팔레트에도 동일 적용).

| 수준 | Hex | CSS 변수 | 사용처 |
|---|---|---|---|
| 저위험(Low) | `#A0BFDC` | `--rl` | 저위험 배지 배경 |
| 중위험(Mid) | `#E6B788` | `--rm` | 중위험 배지 배경 |
| 고위험(High) | `#E29B9B` | `--rh` | 고위험 배지 배경 / 경고 카드 테두리 |

> 위험도 색은 게임 신호(XP/스트릭/레벨)에 사용 금지. 오답률·기억HP 저하·스트릭 위기 **알림 전용**.

---

## 2. 로고 A 스펙

### 2-1. 확정 방향

- **선택**: A안 — 통통 아웃라인 커스텀 벡터.
- **기반**: SVG `<text>` + stroke 렌더링. 폰트 파일 서버 임베드 없음.
- **최종 제작**: Illustrator에서 시스템 폰트 텍스트를 **아웃라인화(Create Outlines)** 후 SVG path로 저장.

### 2-2. SVG 렌더링 스펙 (목업 기준 — Illustrator 아웃라인 전까지 폴백)

```svg
<svg viewBox="0 0 270 42" style="width:100%;max-width:270px;overflow:visible;">
  <text
    x="4" y="34"
    font-family="'Arial Black','Helvetica Neue',Arial,sans-serif"
    font-size="34"
    font-weight="900"
    letter-spacing="4"
    fill="[color]"
    stroke="[color]"
    stroke-width="2.5"
    stroke-linejoin="round"
    stroke-linecap="round"
    paint-order="stroke fill">SOONGONG</text>
</svg>
```

### 2-3. 라이트 / 다크 변형

| 배경 | fill · stroke | 서브라벨 "순공대장" |
|---|---|---|
| 라이트 (bg-el) | `#2E7D5B` (o900) | `#4A7585` (tm), font-size:9px |
| 다크 (o900 배경) | `#FFFFFF` | `rgba(255,255,255,.6)`, font-size:9px |

### 2-4. 사이즈 변형

| 클래스 | font-size | letter-spacing | 사용처 |
|---|---|---|---|
| `.wordmark-sm` | 11px | 3px | 사이드바 축소형 |
| `.wordmark` (기본) | 17px | 4px | 사이드바 기본 / 헤더 |
| `.wordmark-lg` | 22px | 5px | 랜딩 / 로딩 화면 |

### 2-5. 라이선스 제약

- **RockoUltraFLF 임베드 절대 금지** — "No License Available" (fontsgeek), 1992 Software Complement 저작권.
- A안은 시스템 폰트(Arial Black 계열) + SVG stroke로 구현 → 라이선스 문제 없음.
- B안 후보 3종(Lilita One / Fredoka / Bowlby One)은 Google Fonts SIL OFL — 상업 사용 가능. Mike 최종 선택 전까지 A안 유지.

---

## 3. 레이아웃 규칙

### 3-1. 웹 대시보드 (≥1280px 기준)

```
┌─────────────────────────────────────────────────┐
│  브라우저 크롬                                     │
├───────────┬─────────────────────────────────────┤
│  사이드바  │  메인 그리드                          │
│  220px     │  유동 (max-width: 1440px)            │
│  (고정)    │  padding: 0 24px                     │
│            │  카드 gap: 12px · 카드 padding: 16px  │
│  아이콘    │                                       │
│  + 라벨    │  2열 → 3열 자동 전환                  │
│            │                                       │
│  하단      │  토스트: 우측 하단 fixed · z-50        │
│  프로필    │                                       │
└───────────┴─────────────────────────────────────┘
```

- 사이드바 너비: **220px 고정** (≥1280px)
- Active nav 항목: `background:#D2EBE2(o100); color:#2E7D5B(o900); font-weight:700`
- Hover nav 항목: `background:#EAF6F1(o50); color:#4CAF88(o700)` 150ms ease
- 퀘스트 row 호버: `border-color:#A8DCCB(o300); background:#EAF6F1(o50)`
- 버튼 호버: `filter:brightness(0.93)`
- 포커스 outline 제거 금지 (a11y)

### 3-2. 앱 (모바일 ≤767px 기준)

```
┌────────────┐
│  상태바     │
├────────────┤
│  GameBar   │  ← o900 배경 · 36px 고정
│  스트릭·XP  │
│  게이지·HP  │
├────────────┤
│  마스코트   │  ← flex 배너 · md(52px)
│  배너       │
├────────────┤
│  콘텐츠     │  ← 단일 컬럼
│  스크롤     │
├────────────┤
│  하단 탭바  │  ← 64px + iOS safe-area
│  ○ ○ ⊕ ○ ○│  ← 5탭 · 중앙 카메라 FAB 돌출
└────────────┘
```

- 하단 탭 5개: 홈 / 캘린더 / [카메라 FAB] / 오답노트 / 그래프
- 카메라 FAB: o900 배경, 중앙 돌출, 모바일 전용

---

## 4. 반응형 브레이크포인트

| 폼팩터 | 범위 | 내비게이션 | 콘텐츠 컬럼 | 카메라 FAB | 사이드바 |
|---|---|---|---|---|---|
| **모바일** | ≤ 767px | 하단 탭바 5탭 | 1열 | ✓ 중앙 돌출 | 없음 |
| **태블릿** | 768–1279px | 좌측 아이콘 사이드바 | 2열 | ✗ | 52px (아이콘만) |
| **데스크톱** | ≥ 1280px | 좌측 풀 레이블 사이드바 | 2~3열 | ✗ | 220px (아이콘+라벨) |

### 고정(Fixed) 요소

| 요소 | 값 |
|---|---|
| 사이드바 너비 | 220px / 52px / 없음 (폼팩터별) |
| 일반 카드 border-radius | 16px (모든 폼팩터) — **단, stats 4박스(Stat 타일)는 예외**: 아래 Stat 타일 규격(`--stat-card-radius`)을 따른다 |
| 버튼 최소 hit area | 44×44px |
| GameBar 높이 | 36px |
| 하단 탭바 높이 | 64px + iOS safe-area |
| **Stat 타일 규격 (stats 4박스)** | **값은 `tokens.css --stat-card-{min-h,pad,radius,gap}` 가 SSoT (여기에 px 복붙 금지). 공용 `shared/ui/stat-card` StatCard 로만 렌더 — 홈·내기록 등높이 통제(SOO-143).** |

> **stats 4박스(스트릭·기억HP·순공시간·XP) 디자인리뷰 항목 (§2-2 시각위계 보강, SOO-143):** 4개 타일은 **등높이**여야 한다. 기억HP 0–5 점(●●●●●) 행이 한 카드만 키를 늘리면 **위반**. 치수를 화면에 직접 박지 말고 공용 StatCard + `--stat-card-*` 토큰만 쓴다(한 곳 통제 → 전 화면 반영). 라이브 규격: `/styleguide` → Components → "Stat 카드 (규격)".

### 유동(Fluid) 요소

| 요소 | 동작 |
|---|---|
| 콘텐츠 컬럼 | 1 → 2 → 3열 리플로우 |
| 카드 너비 | 컬럼 100% fill |
| 사이드바 라벨 | 768px 미만 숨김 |
| 마스코트 배너 | flex-wrap 줄바꿈 허용 |
| 통계 바 | flex-wrap 2줄 허용 (태블릿) |

---

## 5. 밀도 · 플랫아이콘 · 마스코트 Placeholder 규칙

### 5-1. 정보 밀도

- **앱(모바일)**: 컴팩트 밀도. 퀘스트 카드 padding `p-2.5`(10px), gap `gap-2`(8px).
- **웹(데스크톱)**: 표준 밀도. 카드 padding 16px, gap 12px.
- 게임 상태(스트릭·XP·HP)는 **모든 폼팩터에서 상시 노출** (GameBar 고정).

### 5-2. 플랫아이콘 규칙

- stroke-width: **1.5px** (기본). 강조 check만 2px.
- 색: 컨텍스트에 따라 o700(active) / tm(inactive).
- 앱 내비게이션: 20×20px. 사이드바: 15px. 카드 내: 14px.
- stroke-linecap: round. stroke-linejoin: round.
- fill: none (선형 아이콘 전용).

### 5-3. 마스코트 ("순공이") Placeholder 규칙

마스코트 정본은 **`public/brand/`** 단일 SSoT다 (SOO-82, 2026-06-19 Mike 결정). 인앱 마스코트 컴포넌트(`shared/ui/mascot.tsx`)는 `public/brand/soongong-main.png`를 참조한다. Mike 최종 캐릭터 시트 교체 시 **같은 파일명(`soongong-main.png`)으로 덮어쓰면 전체 자동 적용**.

- main(순공이) = `public/brand/soongong-main.png`
- sub = `public/brand/sub-boy.png` / `public/brand/sub-girl.png`

> ⚠️ 구 `public/mascot/` 폴더(`main.png`/`main-alpha.png`/`repeat_normal.png`/`repeat_normal-alpha.png`)는 brand 정본과 drift된 stale 중복본이라 SOO-82에서 **삭제**됨. 마스코트 자산을 `brand/` 밖에 다시 두지 말 것(두 번째 SSoT 회귀 금지).

**크기 슬롯**

| 클래스 | 크기 | 사용처 |
|---|---|---|
| `.mxs` | 24×24px | 플레이 중 문제 카드 오른쪽 하단 / 푸시 알림 |
| `.msm` | 36×36px | 헤더 인라인 / 사이드바 프로필 옆 |
| `.mmd` | 52×52px | 홈 마스코트 배너 (기본 등장 크기) |
| `.mlg` | 72×72px | 섹션 헤더 강조 |
| `.mxl` | 100×100px | 오답 결과 오버레이 / 캘린더 빈 날 |
| `.mxxl` | 130×130px | 정답 결과 오버레이 / 레벨업 전체 화면 |

**감정 상태 슬롯**

| 상태 | 파일 | 주요 화면 |
|---|---|---|
| 격려 | `soongong-main.png` | 홈 배너 — "오늘 N개 회독으로 망각 막아요!" |
| 축하 | `soongong-main.png` + star overlay | 정답 결과 (xxl) / 레벨업 |
| 집중 | `soongong-main.png` | 플레이 중 (xs) / 오답노트 (sm) |
| 경고 | `soongong-main.png` + 필터 + ! 배지 | 오답 결과 (xl) / 스트릭 위기 |
| 휴식 | `soongong-main.png` opacity .7 | 캘린더 빈 날 (xl) / 빈 상태 |

> 감정 상태는 단일 정본 `soongong-main.png` + 오버레이/필터/opacity로 연출한다(별도 mood 자산은 아직 없음 — 향후 mood 시트 도입 시 brand/ 안에서 확장).

---

## 6. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| v1.0 | 2026-06-09 | 최초 잠금. SOO-19 v3(`110076f`) 기준. Ocean 팔레트 / 로고 A / 레이아웃 v3 / 반응형 / 마스코트 placeholder 규칙 캡처. |
| v2.0 | 2026-06-16 | **팔레트 교체: Ocean → v2 Teal/Mint** (SOO-260616-01, Mike 명시 승인). §1 전체 스케일·서피스·보더·그라데이션 hex를 v2 앵커(`#A8DCCB`/`#7BC4AE`/`#4CAF88` + 파생)로 1:1 치환. 위험도(§1-2)는 팔레트 무관 고정 유지. primary CTA `#4CAF88`(후보 B). 토큰 본체는 #58 선반영, 본 갱신은 SSoT 정합(가드레일) 후속. 로고/레이아웃/마스코트 규칙은 v1.0 그대로. |
| v2.1 | 2026-06-19 | **§5-3 마스코트 SSoT 일원화** (SOO-82, Mike 결정). 마스코트 정본 경로를 `public/mascot/` → **`public/brand/`** 단일 SSoT로 통일. 구 `public/mascot/` 폴더(stale 중복 4종)는 삭제, 인앱 컴포넌트·목업 참조를 `brand/soongong-main.png`로 교체. 감정 상태 슬롯 표를 단일 정본 + 오버레이/필터 연출로 갱신(삭제된 `repeat_normal*` 참조 제거). 근본 원인 = 두 번째 SSoT drift(인앱이 stale `mascot/main.png` 렌더). |
