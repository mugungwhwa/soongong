# 순공대장 — 다음 세션 진입점 (RESUME)

> **이 문서를 먼저 읽으세요.** 5분 안에 현재 상태 + 다음 액션이 파악되도록 잠금.
> 작성일: 2026-05-14 / **최종 갱신: 2026-06-25 (SOO-121/124/126/128 시리즈 반영 + 프로토타입 완성 + repo 최신화 작업 SOO-131)**

---

## 1. 현재 위치 (한 줄)

순공대장 MVP 1차의 **P0~P8 전부 main 통합 완료 + SOO-128 시리즈 프로토타입 완성**. Multica 에이전트 조직으로 이슈 단위 개선 + repo GitHub 제출 준비(SOO-131) 단계.

**2026-06-25 현재 상태:**
- **P1~P8 코드 + 화면 구현 완료** — Supabase 인증·DB·Edge Functions·홈/회독/오답/게임/관리자 UI 전부 main. 더 이상 "코드 없는 문서" 상태 아님.
- **UI 디자인 정합 완료** — SOO-121로 앱 셸·today를 SOO-97 목업 감각으로 재정합 (심플·명확·새 로고). SOO-124로 카메라 메인 hero (순공이+카메라 배치). SOO-126으로 사이드바·대시보드 폭 이슈 해소.
- **SOO-128 프로토타입 시리즈 완성** — 랜딩 v4(P1, PR #133) + 순공냅스+좌측 네비(P2, PR #134) + 메인·회독·오답 통합 셸(P3, PR #137). `/docs/prototypes/SOO-128*/` 에 저장.
- **스타일가이드 프로덕션 공개** — SOO-106으로 통합 Platform 개발 가이드 + 모션 언어 자산화. `/styleguide` 라우트 프로덕션 공개(noindex 유지).
- **디자인 시스템** — v2 Teal/Mint(`#A8DCCB`/`#7BC4AE`/`#4CAF88`) 잠금, design-system-lock v2.1. 구 Ocean·app_UI.png/web_ui.png 폐기 완료.
- **Multica 자동 머지 ON** — 2026-06-20 Mike 무중단 결정. 코드래빗 승인 + 필수 체크 green + Tech Lead 리뷰 충족 시 자동 머지.

> ⚠️ **주의**: 본 §3은 마일스톤 요약이라 개별 커밋 해시는 생략. 정확한 최신 커밋은 항상 `git log --oneline -10` 로 확인.

---

## 2. 핵심 컨텍스트 (잊었을 때 회상용)

| 항목 | 값 |
|---|---|
| 프로젝트 | 순공대장 — 수능생 듀오링고형 AI **회독 리텐션 엔진** |
| 트랙 | SparkClaw 1인 창업 |
| 한 줄 차별 | 콴다는 학생의 '막힘'을 풀고, 순공대장은 학생의 '까먹음'을 푼다 |
| 마스코트 | **"순공이" (가안, 듀공 모티프)** — Midjourney/GPT-4o + Canva 직접 작업 |
| UI 라벨 | 사용자 노출 = **"회독퀘스트"** / 백서 = "회독" |
| 톤 | **Light Study Garden — Light 단일 톤** (구 다크 RPG 톤 · 구 Ocean 컨셉 폐기됨) |
| 디자인 SSoT | `/styleguide` + `docs/design-system/2026-06-09-design-system-lock.md` (v2.1) + `tokens.css`. **구 시안 `app_UI.png` / `web_ui.png`는 폐기 — SSoT 아님** (실앱/styleguide 우선) |
| 컬러 | 크림 기반 + **v2 Teal/Mint `#A8DCCB`/`#7BC4AE`/`#4CAF88`** + 위험도(소프트) — 구 오션(`#2AB8D0`/`#1A8FAD`/`#0E5C82`)·민트 `#7CC97C` 폐기 (SOO-260616-01) |
| 사업 정체성 | **엔진 회사** (콘텐츠 회사 X) |
| 데이터 아키텍처 | Postgres = truth (온톨로지 트리) + pgvector = 검색 (장기 SSoT) / MVP 1차는 FTS 우선 (§10) |
| 비즈니스 모델 | 듀오링고형 5티어 하이브리드 (Free/Super/Max/가족/B2B2C + 시즌 IAP) |
| 스택 | Next.js 15 + FSD 2.1 + Tailwind + shadcn + Supabase + Anthropic API |
| 운영 플랫폼 | Multica 에이전트 (Orchestration Lead 라우팅, mugungwhwa 개인 계정) |
| 기간 | 8주 (W1-W8) MVP 1차 |

---

## 3. 코드 트랙 진척 (마일스톤 요약, `mugungwhwa/soongong` main)

> 5/19까지: 기획/플랜 문서 11 commits. 이후 P0~P8 코드가 트랙별로 main에 통합됨. (개별 해시는 `git log`로)

| 트랙 | 내용 | 상태 |
|---|---|---|
| **P0 와꾸** | Day1-7 데모 스켈레톤 + main docs + 게임화 SSoT v1.0 | ✅ main |
| **P1 Foundation** | Supabase SSR 인증 + users 테이블 + 디자인 토큰 게이트(`lint:tokens`) | ✅ main |
| **P2 Source Intake** | DB 마이그레이션 3종 + Edge Functions(compliance-gate/cleanup-raw) + source 슬라이스 + upload 4-옵션 시트 + compliance eval 게이트 | ✅ main |
| **P4 Review Scheduling** | review_quests 테이블 + RLS + 망각위험 함수 + schedule-next-review/daily-quest-builder Edge Functions + quest entity | ✅ main |
| **P5 Home Quest UI** | 홈 위젯 실데이터 계약 연결 (SOO-6) | ✅ main |
| **P6 Play/Recovery** | 회독 플레이 실데이터 배선 + 풀이 캔버스 + 오답회수 (SOO-7, PR #14) | ✅ main |
| **P7 Game System** | XP/스트릭/기억HP/뱃지/등급/결과보상 | ✅ main |
| **P8 Admin** | audit_logs/error_reports + 관리자 라우트 보호 + 검수 리스트·오류 신고 UI | ✅ main |
| **SOO-10** | ai.ts mock 계약 + shared 타입 contracts 슬라이스 | ✅ main |
| **SOO-16** | KaTeX 수식 렌더링 + formula_format 계약 + Ocean tokens.css 적용 (PR #22) | ✅ main |
| **SOO-17** | 디자인 시스템 잠금 v1.0 + 인터랙션 스펙 (PR #20, #21) | ✅ main |
| **SOO-19/23** | 듀오링고풍 비주얼 방향 목업 / 개인 학습 현황판 기획서·목업 | ✅ main |
| **SOO-26** | 모바일 카메라 직행 `capture="environment"` (PR #23) | ✅ main |
| **SOO-104** | 오답·복습 화면 SOO-97 시안 실앱 구현 + 회독 자가 회상 화면 + 3단계 grade wiring (PR #119, #122) | ✅ main |
| **SOO-106** | 스타일가이드 통합 가이드라인 (Platform 개발 가이드 + 모션 언어) + 프로덕션 공개 (PR #124, #125) | ✅ main |
| **SOO-114** | 그래프·순공일지 실앱 구현 — 시안→서비스 (PR #117) | ✅ main |
| **SOO-115** | 회독 자가평가 2→3단계 확장 — 또렷/가물가물/막막 (PR #118) | ✅ main |
| **SOO-119** | P3 E2E 스모크 — 실제 문제 PNG로 변형 생성·파이프라인 검증 (PR #123) | ✅ main |
| **SOO-121** | 앱 셸·today를 SOO-97 목업 감각으로 정합 (심플·명확·새 로고) (PR #126) | ✅ main |
| **SOO-124** | 카메라 메인 hero — 순공이+카메라 자산 배치 (앱 하단중앙/웹 상시) (PR #128) | ✅ main |
| **SOO-126** | 사이드바 로고 확대 + 웹 메인/대시보드 폭 모바일폭 갇힘 해소 (PR #130) | ✅ main |
| **SOO-128** | 랜딩 v4 실앱 반영(P1) + 순공냅스+좌측 네비(P2) + 메인/회독/오답 통합 셸(P3) 프로토타입 (PR #133, #134, #137) | ✅ main |

**P3 (AI 파이프라인/OCR)** — sub-plan 잠금됨(`p3-ai-pipeline.md`, `p3-curriculum-rag.md`). SOO-119 E2E 스모크 통과. 장기 아키텍처는 §10 참조 (Postgres FTS 우선, pgvector 후속).

---

## 4. 핵심 문서 (자주 열어볼 것)

```
2026-05-19-순공대장_전략_정리.md (root)                 ← 사업/엔진/포지셔닝 상위 SSoT (v1.1)
docs/
├── RESUME.md                                          ← 지금 이 파일 (첫 진입점)
├── design-system/2026-06-09-design-system-lock.md     ← v2 Teal/Mint 팔레트·로고 A·레이아웃 v3 잠금 v2.1
├── design-system/2026-06-09-interaction-spec.md        ← 전 화면 인터랙션 + 수식 표시 규칙 v1.0
├── design-tokens.md                                    ← 디자인 토큰 SSoT (lint:tokens 근거)
├── superpowers/plans/2026-05-14-soongong-mvp1-{master,p1..p8}.md  ← 9개 plan
├── superpowers/plans/2026-05-18-soongong-mvp1-p0-demo-skeleton.md ← 와꾸 7일 트랙
├── superpowers/plans/2026-05-18-soongong-mvp1-p3-curriculum-rag.md ← P3 RAG (FTS 우선)
├── setup/2026-05-14-environment-decisions.md           ← Mike 환경 결정
├── visual-assets/2026-05-14-soongong-asset-inventory.md ← 시각 자산 가이드
├── visual-assets/mascot-v0.1/                           ← Mike 마스코트 작업본
├── prototypes/SOO-128*/                                ← 최신 프로토타입 (랜딩·순공냅스·메인/회독/오답)
├── sparkclaw/decks/                                    ← 사업소개서 PDF (Deck A·B)
├── mockups/soo-23-dashboard-spec.md                    ← 개인 학습 현황판 기획서
└── agent-strategy/
    ├── 2026-05-14-agent-tracks.md                      ← 듀얼 Agent + 하네스
    └── 2026-06-08-multica-squad-structure.md           ← Multica 스쿼드 구조 v6
```

기획 SSoT: `01_제품_UX_게임화/순공대장_UI_설계.md` (v2.4) / 게임화 SSoT: `01_제품_UX_게임화/게임성_기획_구조.md` (v1.0)

---

## 5. 남은 액션 (우선순위)

### 5.1 제품/코드 트랙

| 우선순위 | 작업 | 비고 |
|---|---|---|
| 🔥 1 | **SOO-128 프로토타입 → 실앱 배선** | 랜딩 v4·순공냅스·메인/회독/오답 화면 실앱 연결 |
| 🔥 2 | **SparkClaw 제출 준비** | Deck A·B PDF 완성. 게임·회독 플레이 실스크린샷 placeholder 채우기 (Mike 직접) |
| ⭐ 3 | **학원 베타** (학생 5~10명) | 회독 메커니즘 현장 검증 + 베타 데이터 hero slide 확보 |
| 4 | **P3 OCR 정밀도 보강** | SOO-119 E2E 통과 기준 이상으로 정확도 ≥90% 게이트 확인 |

### 5.2 사업 트랙 — 다음 60일 (전략정리 §10)

| 우선순위 | 작업 | 비고 |
|---|---|---|
| 🔥 1 | **본인 학원 베타** (2주) — 학생 5~10명, 완전 무료 | 회독 메커니즘 검증 |
| 🔥 2 | **베타 데이터 hero slide 1장** | SparkClaw deck용 |
| 🔥 3 | **부모 5명 인터뷰** — 결제 선호 모델 | 가격 모델 확정 입력값 |
| ⭐ 4 | **온톨로지 v0.1** — 수학 수열 단원 1개 끝까지 | 다른 단원 reference |
| 5 | **SparkClaw 모집 일정 추적** | 부트캠프 진입 |

### 5.3 Mike 결단 항목 (전략정리 §8)

- **A 트랙(VC)** vs **B 트랙(Cash-flow)** 선택
- 본업 + compass + 순공대장 중 정리할 1개 결정 (다음 6개월 내)

---

## 6. 다음 세션 첫 명령 (운영 패턴)

### A. 진행 현황 점검

```
> git log --oneline -10 으로 최근 머지 확인 + 열린 PR 목록(gh pr list) 확인.
> Multica SOO 이슈 현황(in_progress / todo) 확인 후 다음 액션 추천.
```

### B. 신규 이슈 실행

```
> [SOO-XX] 이슈를 담당 리드 에이전트에 위임. architect → executor → reviewer 3-stage.
> DoD(lint:tokens / design-review ≥ 70 / arch-audit) 자가검증 후 PR. 자동 머지 ON(무중단, 2026-06-20 Mike 결정 — 코드래빗 승인 + 필수 체크 green + Tech Lead 리뷰 충족 시, SOO-111).
```

### C. Sub-plan 보강

```
> 마스터 플랜 + Mike 변경 지시 반영해서 [P#] sub-plan 업데이트.
```

---

## 7. 위험 게이트 (잊지 말 것)

| 게이트 | 기준 | 미달 시 |
|---|---|---|
| P3 OCR 정확도 | ≥ 90% (수학 점화식 10장) | P4 진입 금지 + manual 폴백 활성 |
| P5 design-review | ≥ 70점 (8대 패턴) | UI 보강 |
| P6 E2E 7개 시나리오 | 모두 통과 | qa-tester 재실행 |
| tldraw 라이선스 | 상용 시 trial → commercial | Konva로 교체 (1-2일 spike) |
| 디자인 토큰 lint | `pnpm lint:tokens` 통과 | 등록 외 hex 차단 |

---

## 8. 빠른 git 작업 (Multica 워크스페이스 기준)

```bash
# 워크스페이스 내 체크아웃 (워크트리 + 전용 브랜치 자동 생성)
multica repo checkout https://github.com/mugungwhwa/soongong.git

git status
git log --oneline -10

# Commit 시 일회용 author (절대 git config 수정 금지)
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" commit -m "..."

# Push — mugungwhwa 개인 계정으로 (gh CLI active가 회사여도 영향 없음)
git push
```

### 8.1 Pre-commit hook (clone 후 1회 활성화)

```bash
bash scripts/setup-hooks.sh        # core.hooksPath = scripts/hooks 등록
git config core.hooksPath          # 검증
```

검사: 폐기 결정 회귀 키워드 / 회사 계정 commit 차단 / `.env` commit 차단.
우회: `SKIP_PRECOMMIT=1 git commit ...` (의도된 회귀 변경 only)

---

## 9. 휴식 후 재개 체크리스트

- [ ] `git log --oneline -10` 으로 최근 머지 확인
- [ ] 본 RESUME.md 읽기 (5분)
- [ ] 열린 PR 목록 확인 (`gh pr list`) — 머지 대기 / Draft 파킹 구분
- [ ] Multica SOO 이슈 현황 확인 (in_progress 무엇이 도는 중인지)
- [ ] 다음 액션 결정 (§5 우선순위 또는 §6 패턴)

---

**한 줄 요약**: P0~P8 코드 main 통합 + SOO-128 프로토타입 시리즈(랜딩/순공냅스/메인·회독·오답) 완성. SparkClaw Deck A·B PDF 완료. repo GitHub 제출 준비(SOO-131) 완료. 지금은 Multica 에이전트로 이슈 단위 기능 다듬기 + SparkClaw 제출 + 학원 베타 검증 단계.

---

## 10. P3 데이터 아키텍처 점검 결과 (2026-05-19, 유효)

전략정리 §3.9 "Postgres truth + pgvector 검색 하이브리드"가 P3 sub-plan에 반영됐는지 점검:

| 파일 | pgvector 명시? | 상태 |
|---|---|---|
| `master.md` | "Supabase 스택에 pgvector 포함" 1줄만 | 추상적 |
| `p3-ai-pipeline.md` | 키워드 0건 | **누락** |
| `p3-curriculum-rag.md` | **"pgvector 폐기, Postgres FTS + JSON 트리"로 잠금** (line 8). pgvector는 Top-1 < 50% 폴백 시점에만 | **전략정리와 직접 충돌처럼 보이나 layer가 다름** |

**해석**: 전략정리 §3.9는 **장기 SSoT 아키텍처**, p3-curriculum-rag.md는 **MVP 1차 단계적 구현**(FTS 우선, 정확도 미달 시 pgvector 진화). 모순 아님 — layer 차이. 단 p3-curriculum-rag.md에 "장기는 §3.9 하이브리드로 수렴" 한 줄 명시 필요.

**Mike 결단 필요** (미해결, §5.1 ⭐3로 이월):
- (a) p3-curriculum-rag.md에 정합 한 줄 추가만 (10분) ← **추천**
- (b) MVP 1차부터 pgvector 도입으로 plan 재작성 (1-2일)
- (c) 보류, 베타 검증 후 결정
