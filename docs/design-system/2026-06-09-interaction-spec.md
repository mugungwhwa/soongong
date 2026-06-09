# 순공대장 MVP1 — 인터랙션·표시 규칙 스펙 v1.0

> **출처**: 코드 실측(2026-06-09) + SOO-15 mockup + SOO-16 MathRenderer 구현 기준.  
> **범위**: MVP1 전 화면 인터랙션 + 수식 표시 규칙 + 톤·모션 가이드.  
> **실제 구현은 별도** — 본 문서는 스펙 잠금 전용.  
> **Mike용 1줄 요약**: "각 화면이 어떻게 보이고 눌리는지를 한 파일에 잠근다 — 이후 구현 때 이 파일이 기준."

---

## 0. 화면 인벤토리

| 화면 | 경로 | 상태 | 담당 View |
|---|---|---|---|
| 오늘(홈) | `/today` | ✅ 구현 | `TodayPage` |
| 문제 풀기 | `/play/[questId]` | ✅ 구현 | `PlayPage` |
| 오답회수 | `/recovery/[objectId]` | ✅ 구현 | `RecoveryPage` |
| 결과 | `/result` | ✅ 구현 | `ResultPage` |
| 오답노트 | `/wrong-notes` | 🚧 stub | — |
| 회독 캘린더 | `/calendar` | 🚧 stub | — |
| 그래프 | `/graph` | 🚧 stub | — |
| 순공일지 | `/diary` | 🚧 stub | — |
| AI 검수(Admin) | `/admin` | ✅ 구현 | `AdminPage` |
| 온보딩 | `/onboarding` | ✅ 구현 | 3-step wizard |
| 로그인 | `/login` | ✅ 구현 | `LoginPage` |

---

## 1. 네비게이션 구조

### 1-1. 모바일 (< lg / ≤767px) — BottomNav

| 탭 | 아이콘 | 경로 |
|---|---|---|
| 오늘 | 🏠 | `/today` |
| 캘린더 | 📅 | `/calendar` |
| 오답 | 📝 | `/wrong-notes` |
| 일지 | 📔 | `/diary` |

- 위치: `fixed bottom-0`, z-50, bg-elevated, border-top.
- Active 탭: 컬러 토큰 `--color-ocean-700` 텍스트 (구현 전 mint-700 유지).
- 카메라 FAB: 중앙 돌출 — **MVP1.5 이후**. 지금은 4탭 균등 배치.

### 1-2. 데스크톱 (≥ lg / ≥1280px) — Sidebar

- 너비 220px 고정. 아이콘(15px) + 라벨 항상 노출.
- Active: `bg-mint-100 text-mint-900 font-bold`. Hover: `bg-mint-50 text-mint-700` 150ms.
- 하단 Admin 섹션 분리, logout 버튼 포함.
- 순공리그 항목: MVP1차에는 🔒 잠금 배지만 노출, 클릭 불가.

---

## 2. 화면별 인터랙션 스펙

### 2-1. 오늘(홈) — `/today`

#### 핵심 구조
```
GameBar (o900, 36px 고정)  ← MVP1.5 이후 추가 예정
마스코트 배너 + 알림 + UploadTrigger
StatsGrid (스트릭·XP·회독수·정확도)
오늘의 회독 캠프 (QuestList)
ReviewMap
─── (데스크톱 우측 aside) ───
SubjectProgress
ForgettingTop3
```

#### 핵심 액션

| 액션 | 트리거 | 결과 |
|---|---|---|
| 퀘스트 풀기 | QuestCard "풀기" 버튼 탭 | `/play/[questId]` |
| 자료 업로드 | UploadTrigger 버튼 탭 | 업로드 Sheet 열림 |
| 알림 확인 | 🔔 버튼 탭 | (MVP1 미구현 — 버튼만 존재) |

#### 첫 진입 (isFirstEntry=true)
- URL: `/today?first=true`
- `celebrate` 마스코트 배너 노출: "회독 퀘스트가 준비됐어요! 🎉"
- 서브텍스트 변경: "첫 회독 퀘스트를 시작해봐요 👇"

#### 빈 상태
- 퀘스트 없음: "오늘은 퀘스트가 없어요. 자료를 올려봐요!" + UploadTrigger 강조
- ForgettingTop3 데이터 없음: 위젯 숨김 (stub)

#### 로딩 상태
- 각 위젯 개별 스켈레톤. 전체 블로킹 로딩 없음 (점진적 노출).

#### 에러 상태
- Supabase 호출 실패 시 각 위젯에 "데이터를 불러올 수 없어요" + 재시도 버튼.

---

### 2-2. 문제 풀기 — `/play/[questId]`

#### 상태 흐름
```
playing ──[정답 제출]──► submitted-correct ──► /result
         ──[오답 제출]──► submitted-wrong  ──► /recovery/[objectId]
                                          └──► 다시 풀기 (reset → playing)
퀘스트 없음 → 에러 화면 → /today
```

#### playing 상태 UI

| 영역 | 내용 | 규칙 |
|---|---|---|
| 헤더 | `subject · unit` + `topic` 제목 | 텍스트만, 아이콘 없음 |
| 문제 카드 | `MathRenderer` (rawTextSnippet) | bg-sunken 카드 |
| 캔버스 | `PadCanvas` (tldraw) | 자유 필기 레이어 |
| 답안 입력 | `AnswerForm` | 객관식/단답/서술 타입별 |
| 힌트 | latex 문제일 때만 노출 | "힌트: 점화식을 한 단계씩 풀어 보세요." |

#### submitted-correct 상태 UI

- 마스코트 `celebrate` (xl, 100px)
- `정답! +{rewardXp} XP` (mint-700)
- 버튼: [홈으로 → `/today`] [결과 보기 → `/result`]

#### submitted-wrong 상태 UI

- 마스코트 `comfort` (xl, 100px)
- "아쉬워요. 오답회수로 회복할까요?"
- 서브: "변형 문제(V1-V5)로 다시 도전하면 +30 XP를 받아요."
- 버튼: [다시 풀기 → reset] [오답회수 가기 → `/recovery/[objectId]`]

#### 에러 상태 (퀘스트 없음)
- "퀘스트를 찾을 수 없습니다" + [홈으로] 버튼

---

### 2-3. 오답회수 — `/recovery/[objectId]`

#### 핵심 구조
```
헤더: 마스코트(comfort/md) + "오답회수 모드" + objectId
변형 티어 탭: V1 V2 V3 V4 V5 (Badge 버튼)
활성 변형 카드: description + MathRenderer(prompt) + [풀기 완료, 나가기]
```

#### 핵심 액션

| 액션 | 트리거 | 결과 |
|---|---|---|
| 변형 전환 | 티어 Badge 탭 | 카드 내용 교체 (즉시, 애니메이션 없음) |
| 풀기 완료 | "풀기 완료 (+30 XP)" 버튼 | `recordGameProgress` → `/result` |
| 나가기 | "나가기" 버튼 | `/today` |

- Active 티어 배지: `bg-mint-500 text-inverse`. 비활성: 기본 Badge.
- 로딩: 없음 (mock 데이터, 즉시 렌더).

---

### 2-4. 결과 — `/result`

#### 핵심 구조
```
ResultRewards (earnedXp=60)
[홈으로] 버튼 → /today
```

- 레이아웃: `max-w-xl`, 단일 컬럼.
- ResultRewards 내부: XP 보상 표시 + 마스코트(celebrate) — widget 스펙 별도.
- 뒤로가기 허용 안 함 — 결과는 단방향 종착점.

---

### 2-5. 오답노트 — `/wrong-notes` (stub → MVP1 목표 스펙)

> 현재: stub 페이지. MVP1 구현 목표 인터랙션 스펙 (SOO-15 mockup 기준).

#### 핵심 구조
```
헤더: "오답노트" + 필터 아이콘(⚙️)
과목 필터 칩: [전체] [수학] [영어] [국어] [과학] [사회]  (수평 스크롤)
정렬 바: "N개" 카운트 + [최신순 ▾] 드롭다운
오답 카드 목록
```

#### 핵심 액션

| 액션 | 트리거 | 결과 |
|---|---|---|
| 과목 필터 | 칩 탭 | 활성 칩 강조 + 목록 필터링 (단일 선택) |
| 정렬 변경 | "최신순 ▾" 탭 | 드롭다운 (최신순/오답률순/과목순) |
| 다시 풀기 | 카드 "다시 풀기" 버튼 | `/play/[questId]` |

#### 빈 상태 (필터 결과 없음)
- 마스코트(휴식, 80px, opacity 0.8) + "아직 오답이 없어요" + "퀘스트를 풀면 오답노트가 쌓여요"

#### 전환 애니메이션
- 칩 전환: `transition: all 160ms`.
- 카드 목록: 필터 변경 시 `opacity` fade (120ms).

---

### 2-6. 회독 캘린더 — `/calendar` (stub → MVP1 목표 스펙)

> 현재: stub. MVP1.5 타임라인 뷰. MVP1 목표: 월간 달력 + 날짜별 퀘스트 패널.

#### 핵심 구조
```
월 헤더: ← 이전월 / 2026년 6월 / 다음월 →
주간 헤더: 일 월 화 수 목 금 토
날짜 그리드 (7열 × N행)
─ 날짜 탭 → 하단 퀘스트 패널 슬라이드업
퀘스트 패널: 선택 날짜 퀘스트 목록 + [풀기] 버튼
```

#### 핵심 액션

| 액션 | 트리거 | 결과 |
|---|---|---|
| 날짜 선택 | 날짜 탭 | 하단 패널에 해당 날짜 퀘스트 노출 |
| 월 이동 | ← / → 버튼 | 달력 교체 (즉시) |
| 퀘스트 풀기 | 패널 내 [풀기] | `/play/[questId]` |

#### 빈 날 규칙
- 빈 날(past empty): `cursor: default`, hover 없음. 마스코트(휴식) 없음 — 날짜 셀 비어있게.
- 미래 날: 미정 (회독 예약은 MVP1.5).

---

### 2-7. 그래프 — `/graph` (stub → MVP1.5)

> MVP1에서는 "준비 중" 메시지만. MVP1.5 목표: 주간/월간 XP · 정답률 · 망각방어 통계 차트.

- Stub 텍스트: "준비 중 — 주간/월간 XP / 정답률 / 망각방어 통계 차트."
- 아이콘 없이 텍스트만 노출. 마스코트 없음.

---

### 2-8. 순공일지 — `/diary` (stub → MVP1.5)

> MVP1에서는 "준비 중" 메시지만. MVP1.5 목표: 오늘 학습 + 순공이 한 줄 코멘트.

- Stub 텍스트: "준비 중 — 오늘 학습한 내용 + 순공이의 한 줄 코멘트 기록."

---

### 2-9. AI 분석 검수 (Admin) — `/admin`

#### 핵심 구조
```
헤더: "AI 분석 검수" + "신뢰도 낮은 분석 결과를 사람이 보정"
AdminReviewList (위젯)
```

#### 핵심 액션
- 검수 항목 승인/거절/수정 — AdminReviewList 위젯 내부 스펙.
- 일반 사용자 접근 차단 — auth gate에서 admin 역할 확인 필요 (MVP1 현재 미구현, 링크만 존재).

---

### 2-10. 온보딩 — `/onboarding`

#### 3단계 마법사 흐름
```
Step 1: 닉네임 입력 → [다음]
Step 2: 수험 연도 선택 → [다음]
Step 3: 과목 선택 (복수) → [시작하기]
         ↓
/today?first=true
```

#### 규칙
- 단계 표시: 상단 진행 바 (1/3, 2/3, 3/3).
- [이전] 버튼: Step 2, 3에서만 노출.
- 뒤로가기 (브라우저): Step 1에서 → `/login` (onboarding 완료 후 재진입 차단 필요 — MVP1 미구현).
- 완료 직후: `first=true` param → TodayPage welcome 배너 트리거.

---

### 2-11. 로그인 — `/login`

- Supabase Magic Link (OTP) — 이메일 입력 → 발송 → 링크 클릭 → `/auth/callback` → `/onboarding`.
- 재로그인(온보딩 완료 사용자): `/auth/callback` → `/today`.
- 로딩: 이메일 발송 중 버튼 비활성화 + "메일을 보내는 중..." 텍스트.
- 에러: 잘못된 이메일 형식 → 인라인 에러 (빨간 텍스트, 아이콘 없음).

---

## 3. 수식 표시 규칙

> 출처: `apps/web/src/shared/ui/math-renderer.tsx` + SOO-16 계약 (`formula_format` 필드).

### 3-1. `formula_format` 필드 기준

| 값 | 의미 | 렌더 방식 |
|---|---|---|
| `"plaintext"` (기본) | 수식 없는 평문 | raw `<span>` 그대로 출력 |
| `"latex"` | LaTeX 수식 포함 | KaTeX 파서 적용 |

### 3-2. 인라인 수식 (Inline)

- **구분자**: `$...$` (단일 달러)
- **렌더**: KaTeX `displayMode:false`
- **사용처**: 문제 stem 중간에 섞인 수식, 보기 텍스트
- **예시**: `등차수열에서 $a_{n+1} = a_n + d$일 때`

### 3-3. 블록 수식 (Block)

- **구분자**: `$$...$$` (이중 달러)
- **렌더**: KaTeX `displayMode:true`, `className="block text-center my-2"`
- **사용처**: 독립 수식 줄 (정의·점화식 전개 등)
- **예시**:
  ```
  $$S_n = \frac{n(a_1 + a_n)}{2}$$
  ```

### 3-4. 화면별 수식 표시 기준

| 화면 | 위치 | format 기준 | 비고 |
|---|---|---|---|
| Play | 문제 카드 (`rawTextSnippet`) | `analysis.formula_format` | 없으면 plaintext |
| Play | 힌트 텍스트 | latex일 때만 노출 | 고정 문구 |
| Recovery | 변형 문제 (`active.prompt`) | `active.formula_format` | MOCK_VARIANTS 기준 |
| 오답노트 | 오답 카드 미리보기 | plaintext 축약 | 상세 보기에서 latex |
| Admin | 분석 결과 검수 | 원본 format 그대로 | 편집 가능 |

### 3-5. 길이 초과 처리

- **인라인**: `overflow-x: auto` + `white-space: nowrap` (수식 잘림 방지)
- **블록**: 수식 자체가 뷰포트 초과 시 → 부모에 `overflow-x: auto`
- **카드 미리보기 (오답노트)**: 40자 초과 시 `...` 말줄임. 수식 토큰 보존 우선 (공백에서 자름).

### 3-6. 에러 처리

- KaTeX `throwOnError: false` — 파싱 실패 시 원본 LaTeX 텍스트 그대로 노출
- 신뢰 모드 `trust: false` — XSS 차단

---

## 4. 톤·모션 가이드

> 게임화 강도: **라이트 단일 (Light Study Garden)**. CLAUDE.md §2 잠긴 결정사항 기준. fear 카피 절대 금지.

### 4-1. 마스코트 감정 토큰

| 상태(mood) | 대표 화면 | 문구 톤 |
|---|---|---|
| `cheer` (격려) | 홈 배너 | "오늘 N개 회독으로 망각을 막아요!" |
| `celebrate` (축하) | 정답 결과 / 레벨업 | "완벽해요! +20 XP" / "순공러 달성!" |
| `comfort` (위로) | 오답 결과 / 오답회수 | "이번엔 아쉬웠어요. 오답노트에 담았어요" |
| `study` (집중) | 플레이 중 / 오답노트 | — (문구 없음, 시각 장식) |
| `rest` (휴식) | 빈 상태 / 캘린더 빈 날 | "오늘 퀘스트 없어요. 새로 추가해볼까요?" |
| `warn` (경고) | 스트릭 위기 | "순공이가 기다리고 있어요… 오늘 자정까지!" |

**fear 카피 금지 예시**: "안 하면 점수 떨어집니다" → ❌  
**대체 패턴**: "오늘 하면 기억이 2배 오래 남아요" → ✅

### 4-2. 전환 타이밍

| 전환 종류 | 지속 시간 | 이징 |
|---|---|---|
| 버튼 hover | 150ms | ease |
| 필터 칩 활성화 | 160ms | ease |
| 카드 hover (오답노트) | 120ms | ease |
| 정답/오답 결과 화면 전환 | 즉시 (Next.js 라우팅) | — |
| 티어 변형 카드 교체 | 즉시 | — |
| 토스트 알림 | 슬라이드인 200ms, 3초 후 슬라이드아웃 | ease-out / ease-in |

### 4-3. 금지 패턴

- ❌ 전체 화면 블로킹 로딩 스피너 (각 위젯 개별 스켈레톤으로 대체)
- ❌ 답안 제출 후 진동/섬광 등 강렬 피드백 (subtle 색 변화만)
- ❌ 정답률 하락 수치 강조 (기억HP 상승 강조로 대체)
- ❌ 자동 팝업/모달 (사용자 액션 없이 열리는 것)
- ❌ 스트릭 소멸 카운트다운 타이머 노출 (있다면 "D-1" 수준만)

### 4-4. 버튼 위계

| 위계 | 스타일 | 사용처 |
|---|---|---|
| Primary | `bg-mint-500 text-inverse hover:bg-mint-700` | 핵심 CTA (풀기, 결과 보기, 오답회수 가기) |
| Secondary | `variant="outline"` | 보조 이동 (홈으로, 나가기) |
| Destructive | 없음 (MVP1) | — |

---

## 5. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| v1.0 | 2026-06-09 | 최초 작성. 코드 실측 + SOO-15 mockup + SOO-16 MathRenderer 기준. MVP1 전 화면 인터랙션 + 수식 표시 규칙 + 톤·모션 가이드. |
