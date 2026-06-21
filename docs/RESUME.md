# 순공대장 — 다음 세션 진입점 (RESUME)

> **이 문서를 먼저 읽으세요.** 5분 안에 현재 상태 + 다음 액션이 파악되도록 잠금.
> 작성일: 2026-05-14 / **최종 갱신: 2026-06-21 (코드 트랙 P0~P8 main 통합 + 디자인 v2 Teal/Mint 적용 + 자동 머지 ON + Multica 운영 반영)**

---

## 1. 현재 위치 (한 줄)

순공대장 MVP 1차의 **문서 트랙 100% 완료 + 코드 트랙이 P0~P8 전부 main에 통합되어 가동 중**. 이제 Multica 에이전트 플랫폼 위에서 이슈 단위(SOO-XX)로 기능을 다듬는 단계.

**2026-06-10 현재 상태 (5/19 이후 큰 변화):**
- **코드 트랙 점화** — P0 와꾸 스켈레톤 → P1~P8 sub-plan이 전부 실제 코드로 main 머지됨 (Supabase 인증·DB·Edge Functions·홈/플레이/게임/관리자 UI). 더 이상 "문서만 있는" 상태가 아님.
- **디자인 시스템 잠금 + 적용** — SOO-17로 팔레트·로고 A·레이아웃 v3 스펙 잠금 → tokens.css 실적용. **(2026-06-16 SOO-260616-01로 팔레트를 구 Ocean → 현행 v2 Teal/Mint(`#A8DCCB`/`#7BC4AE`/`#4CAF88`)로 교체. lock 문서는 v2.1.)**
- **모바일 카메라 직행** — SOO-26(PR #23) "문제사진" 버튼이 모바일에서 후면 카메라 바로 호출(`capture="environment"`).
- **Multica 운영 체계** — Orchestration Lead 중심 스쿼드 구조 v6 잠금(`2026-06-08-multica-squad-structure.md`). 에이전트가 이슈를 받아 PR 생성, Mike 승인 후 머지하는 루프 가동.

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

**P3 (AI 파이프라인/OCR)** — 핵심 모트. sub-plan 잠금됨(`p3-ai-pipeline.md`, `p3-curriculum-rag.md`). OCR 스파이크 PR #5는 **Draft로 파킹 중** (현재 트랙 아님). §10 데이터 아키텍처 정합 메모 참조.

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
| 🔥 1 | **SOO-26 ⓑ — 카메라 FAB → 업로드 시트 전역 배선** | Track C UI Lead 진행 중. lint:tokens + design-review ≥ 70 + 전체 플로우 검증 후 PR |
| 🔥 2 | **SOO-24 — 로그인 게이트 수정** | 비로그인 `/today` 접근 시 200 반환 버그 (미들웨어 보강) |
| ⭐ 3 | **P3 데이터 아키텍처 정합 한 줄** (§10 (a)안) | p3-curriculum-rag.md에 "장기는 §3.9 하이브리드 수렴" 명시 (10분) |
| 4 | **P3 OCR 스파이크 재개 시점 판단** (PR #5 Draft) | 카메라 트랙 안정화 후 P3 정식 착수 |

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

**한 줄 요약**: 문서 + 코드(P0~P8) 모두 main 통합 완료, v2 Teal/Mint 디자인 적용·모바일 카메라까지 라이브. 지금은 Multica에서 이슈 단위(SOO-26 ⓑ, SOO-24 등) 다듬기 + 학원 베타 검증 단계.

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
