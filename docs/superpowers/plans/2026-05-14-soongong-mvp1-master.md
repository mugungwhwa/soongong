# 순공대장 MVP 1차 — Master Implementation Plan

> **For agentic workers:** 본 문서는 **마스터 플랜**(roadmap)이다. Task-level 실행은 각 서브 프로젝트(P1~P8)의 sub-plan 문서에서 정의된다. 본 문서는 (1) 8개 서브 프로젝트 outline (2) DB 스키마 (3) Agent 배치 매트릭스 (4) 의존성 그래프 (5) 실패 시나리오 + 체크포인트를 잠근다. Sub-plan 작성 시에는 `superpowers:writing-plans` skill을 사용하고, 실행은 `superpowers:subagent-driven-development`로 진행한다.

**Goal:** 순공대장 MVP 1차 — "문제사진/인강기록/캡처+메모 업로드 → AI 분석 → 오늘의 회독퀘스트 3개 → 회독 플레이 + 오답회수 모드 → XP/스트릭 게임 시스템" 루프를 **8주 내 동작하는 라이트 톤 웹 제품**으로 구현.

**Architecture:**
- **Web-first MVP** (앱(Expo)은 MVP 2차로 분리)
- Next.js 15 App Router + FSD 2.1 + Tailwind v4 + shadcn/ui (라이트 톤, `app_UI.png` / `web_ui.png` 시안 SSoT)
- Supabase (Postgres + RLS + Storage + Edge Functions + pgvector + Cron)
- AI: Anthropic Claude API (Haiku 4.5 / Sonnet 4.6 폴백) + Vision LLM + Mathpix OCR (옵션)
- 데이터 원칙: **Raw 최소 저장 + Derived 학습 객체 누적** (원본 자동 삭제 cron)
- 마스코트: **순공이(가안, 듀공 형태)** — 일러스트는 외주 별도 트랙

**Tech Stack:**
- Frontend: Next.js 15, React 19, TypeScript 5.x, Tailwind v4, shadcn/ui, FSD 2.1, TanStack Query, Zustand
- Backend: Supabase (Postgres / Storage / RLS / Edge Functions / pgvector / Cron)
- AI: Anthropic Claude API + Vision (사진 분석) + Mathpix(수식 OCR, 옵션)
- Pad Solving: tldraw 또는 Konva (웹 MVP)
- Hosting: Vercel (web)
- Storage Policy: 원본 자동 삭제 cron (7-30일 후, `source_compliance_checks.action` 기반)

**SSoT 참조:**
- 디자인: `01_제품_UX_게임화/순공대장_UI_설계.md` v2.2 + `app_UI.png` / `web_ui.png`
- 핵심 메커니즘: `순공대장_개발지침_핵심요약.md`
- AI Agent 설계: `02_AI_Agent_학습엔진/*.md`
- 데이터/보안: `03_데이터_RAG_보안_법무/유저_데이터_관리_보안.md`

---

## Sub-Projects 개요

각 서브 프로젝트는 **독립된 sub-plan 문서**로 작성된다. 본 마스터 플랜은 outline만 정의. 의존성 순서로 나열.

### P1 — Foundation (예상 2-3일)

**Goal**: 프로젝트 골격 + Supabase 셋업 + Auth + **디자인 토큰 잠금**

**핵심 산출물:**
- `apps/web/` Next.js 15 scaffolding (FSD 2.1 폴더 구조)
- `tailwind.config.ts` + `src/shared/styles/tokens.css` (UI 설계 §3, §10, §11 토큰 SSoT)
- shadcn/ui 9개 컴포넌트 커스터마이즈 (Button/Card/Badge/Dialog/Sheet/Toast/Tabs/Tooltip/Skeleton)
- Supabase 프로젝트 + Auth (이메일/소셜) + `users` 테이블 + 기본 RLS

**왜 먼저?** 디자인 토큰이 코드로 잠겨야 P5/P6 designer agent가 임의 결정 없이 화면을 그릴 수 있다.

**Agents**: 설계 `oh-my-claudecode:architect` → `feature-dev:code-architect` / 구현 `oh-my-claudecode:executor` / 리뷰 `design-system` skill + `design-review` skill

---

### P2 — Source Intake (예상 3-4일)

**Goal**: 문제사진 / 인강기록 / 캡처+메모 업로드 + **Compliance Gate** + Storage 정책

**핵심 산출물:**
- 테이블: `external_sources`, `source_compliance_checks`
- Supabase Storage bucket + signed URL + 사용자별 path
- Compliance Gate Edge Function (저작권/PII 분류, `allow_user_view`/`allow_ai_generation`/`allow_rag_indexing` 결정)
- 원본 자동 삭제 cron (storage_policy 기반)
- 업로드 UI: 3-옵션 시트 (문제사진 / 인강 시청 기록 / 캡처+메모)

**왜 분리?** Compliance Gate를 AI Pipeline(P3) 안에 두면 저작권 판단이 분석 로직과 섞여서 디버깅 어려움. Gate를 P2에서 단방향 파이프라인으로 잠가둠.

**Agents**: 설계 `feature-dev:code-architect` / 구현 `executor` / 리뷰 `security-check` skill + `security-reviewer` (병렬) + `design-review`

---

### P3 — AI Analysis Pipeline ⚠️ 가장 위험 (예상 5-7일)

**Goal**: Subject Routing → OCR/Parsing → Learning Object Builder → 오답 원인 태깅

**핵심 산출물:**
- 테이블: `subject_routing_results`, `parsed_learning_objects`, `student_memory_items` 초기 row 생성
- Edge Functions: Subject Routing Agent / OCR Parsing / Learning Object Builder / Wrong Reason Tagging
- AI 분석 결과 UI 카드 (학생이 "맞아요/수정하기" 가능)

**진입 게이트**: 수학 수열 점화식 문제 10장으로 정확도 ≥ 70% 안 나오면 **P4 진입 금지**. 폴백: 학생이 직접 텍스트 입력하는 manual 모드로 일주일 회피 + Mathpix vs Vision LLM A/B 측정.

**Agents**: 설계 `vercel:ai-architect` (AI SDK / Anthropic API 패턴) / 구현 `executor` + ai-architect / 리뷰 `qa-tester` (정확도 측정 harness) + `code-reviewer`

---

### P4 — Review Scheduling (예상 2-3일)

**Goal**: 1/3/7/14일 회독 예약 + 오늘의 회독퀘스트 3개 생성 cron

**핵심 산출물:**
- 테이블: `review_quests`
- 망각위험 계산 함수 (룰 기반, `student_memory_items` 5개 변수 사용)
- 매일 00:00 KST cron: 학생별 오늘의 회독퀘스트 3개 선정 + 발급
- 풀이 결과 webhook: 정답/오답에 따라 next_review_at 재계산

**Agents**: 설계 `feature-dev:code-architect` / 구현 `executor` / 리뷰 `code-reviewer`

---

### P5 — Home / 회독퀘스트 UI (예상 4-5일)

**Goal**: 오늘의 회독퀘스트길 + 퀘스트 카드 + 통계 카드 + 순공이 인사 + 웹 사이드바

**핵심 산출물:**
- 페이지: `src/pages/today/` (모바일 우선) + 웹 대시보드 레이아웃
- 위젯: 통계 4-카드 (스트릭/HP/순공/XP) / 퀘스트 카드 / 회독 타임라인 / 순공이 인사
- 라이트 시트 모달 (업로드)
- 위험도 배지 (소프트 톤)

**Agents**: 설계 `oh-my-claudecode:designer` + `design-system` skill / 구현 `executor` / 리뷰 `design-review` skill (8대 패턴 점수제) + `vercel:react-best-practices`

---

### P6 — 회독 플레이 + 오답회수 + 풀이 캔버스 (예상 5-7일)

**Goal**: 회독 플레이 화면 + 정답/오답 분기 + 오답회수 모드 (V0-V5) + 풀이 캔버스

**핵심 산출물:**
- `src/pages/play/[questId]/`
- `src/features/wrong-recovery/` (오답 진단 카드 → 회수 CTA → V1-V5 변형 호출)
- `src/widgets/pad-canvas/` (tldraw 또는 Konva + stroke JSON 저장)
- 결과 화면 (XP 카운트업 + 순공이 반응 + 가벼운 confetti)

**Agents**: 설계 `designer` + `frontend-design` 패턴 / 구현 `executor` / 리뷰 `qa-tester` (브라우저 E2E 1회 완주) + `design-review`

---

### P7 — 게임 시스템 (예상 3-4일)

**Goal**: XP / 스트릭 / 기억 HP / 뱃지 10개

**핵심 산출물:**
- 테이블: `user_game_state`, `badges`
- XP 누적 룰 (회독 완료 +20, 오답회수 +30, 망각방어 +40, 힌트없이 정답 +10, 7일 전 재정답 +20, 14일 망각방어 +50)
- 스트릭 / 기억 HP 일일 cron 업데이트
- 뱃지 10종 (게임성_기획_구조.md §5-1)
- 결과 화면 보상 애니메이션 (Framer Motion)

**Agents**: 설계 `code-architect` / 구현 `executor` / 리뷰 `code-reviewer`

---

### P8 — Admin 검수 (예상 2일)

**Goal**: AI 분석 결과 검수 화면 + 오류 신고 처리

**핵심 산출물:**
- 페이지: `src/pages/admin/`
- 역할 기반 라우트 보호 (admin / reviewer)
- AI 분석 결과 검수 리스트 (승인/수정/폐기)
- 테이블: `audit_logs` (모든 admin 액션 기록)

**의존성**: P3 끝나면 시작 가능. P5/P6/P7와 병렬 가능.

**Agents**: 설계 `code-architect` / 구현 `executor` / 리뷰 `security-check` skill + `code-reviewer`

---

## DB 스키마 (9개 테이블)

| # | 테이블 | 도입 P | 핵심 컬럼 |
|---|---|---|---|
| 1 | `users` | P1 | id, role, birth_year, is_under_14, guardian_verified, deleted_at |
| 2 | `external_sources` | P2 | source_id, user_id, source_type, raw_url, storage_policy, license_status, source_hash |
| 3 | `source_compliance_checks` | P2 | check_id, source_id, copyright_risk, contains_paid_lecture, contains_personal_info, allow_user_view, allow_ai_generation, allow_rag_indexing, action |
| 4 | `subject_routing_results` | P3 | routing_id, source_id, detected_subject, subject_confidence, unit_candidates, recommended_agents, needs_user_confirmation |
| 5 | `parsed_learning_objects` | P3 | object_id, source_id, user_id, subject, unit, topic, question_type, difficulty_level, detected_wrong_reason, confidence_score |
| 6 | `student_memory_items` | P3 | memory_id, user_id, concept_key, mastery_score, recent_accuracy_5, hint_rate_5, confidence_avg, wrong_reason, next_review_at, forgetting_risk |
| 7 | `review_quests` | P4 | quest_id, user_id, object_id, due_date, quest_format, status, result, reward_xp |
| 8 | `user_game_state` | P7 | user_id, streak_days, memory_hp, total_xp, rank, last_active_at |
| 9 | `audit_logs` | P8 | log_id, actor_id, actor_role, action, target_table, target_id, ip_address, created_at |

**RLS 원칙:**
- 학생은 본인 행만 read/write
- 보호자(`guardian`)는 연결된 학생의 요약만 read
- 검수자/관리자는 검수 대상 + audit 자동 기록
- AI Agent는 service role로 처리 목적별 제한된 테이블만 접근

---

## Agent 배치 매트릭스

| Phase | 설계 (Architect) | 구현 (Executor) | 리뷰 / QA |
|---|---|---|---|
| **P1 Foundation** | `oh-my-claudecode:architect` → `feature-dev:code-architect` | `oh-my-claudecode:executor` | `design-system` skill + `design-review` skill |
| **P2 Source Intake** | `feature-dev:code-architect` | `executor` | `security-check` skill + `security-reviewer` (병렬) + `design-review` |
| **P3 AI Pipeline** ⚠️ | `vercel:ai-architect` | `executor` + ai-architect | `qa-tester` (정확도 harness) + `code-reviewer` |
| **P4 Scheduling** | `feature-dev:code-architect` | `executor` | `code-reviewer` |
| **P5 Home/Quest UI** | `oh-my-claudecode:designer` + `design-system` | `executor` | `design-review` (8대 패턴 점수제) + `vercel:react-best-practices` |
| **P6 Play/Recovery/Canvas** | `designer` | `executor` | `qa-tester` (브라우저 E2E) + `design-review` |
| **P7 Game System** | `feature-dev:code-architect` | `executor` | `code-reviewer` |
| **P8 Admin** | `code-architect` | `executor` | `security-check` skill + `code-reviewer` |

**공통:** 각 P 종료 시 `superpowers:requesting-code-review` skill로 종합 리뷰 + `superpowers:verification-before-completion` 적용.

**Sub-plan 작성 단계:** 각 P의 sub-plan은 `superpowers:writing-plans` skill로 작성.
**Sub-plan 실행 단계:** `superpowers:subagent-driven-development` (task별 fresh subagent + 두 단계 리뷰).

---

## 의존성 그래프

```
        ┌──────────────────────┐
        │   P1 Foundation      │
        │   (Supabase + 토큰)   │
        └─────────┬────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │   P2 Source Intake   │
        │   (업로드 + Gate)     │
        └─────────┬────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │   P3 AI Pipeline ⚠️   │ ← Gate: 정확도 ≥ 70%
        │   (Routing/OCR/태깅)  │
        └────┬─────────┬───────┘
             │         │
             ▼         ▼
   ┌──────────────┐  ┌──────────────┐
   │ P4 Scheduling│  │ P8 Admin     │
   │ (1/3/7/14 + │  │ (검수 화면)   │
   │   Cron)     │  └──────────────┘
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ P5 Home/Quest│
   │     UI       │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ P6 Play +    │
   │ Recovery +   │
   │ Canvas       │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ P7 Game      │
   │ System       │
   └──────────────┘
```

**병렬 가능:**
- P8 Admin은 P3 끝나면 P4-P7과 병렬 가능 (다른 트랙)
- 일러스트 외주는 P1과 동시 시작 → P5 전에 완료

---

## 실패 시나리오 + 체크포인트

### 가장 위험: P3 OCR 품질
한국 수능 문제(한글 + 수식 + 그림 + 도표 혼합) OCR이 못 따라가면 전체 파이프라인 무너짐.

**롤백 옵션:**
- 학생이 직접 텍스트 입력하는 manual 모드를 P2 단계에서 미리 옵션으로 빌드
- Mathpix(수식) vs Vision LLM(일반 OCR) A/B 1주 측정 후 결정

**진입 차단 게이트:**
- P3 종료 시점 수학 수열 점화식 10장 정확도 측정. 70% 미만이면 P4 진입 금지 + 재계획

### 두 번째 위험: P6 풀이 캔버스 라이브러리 선택
tldraw는 상용 라이선스 비용 가능, Konva는 직접 구현 비용 큼. P5 끝나기 전에 1일 spike로 비교 결정.

### 체크포인트 (각 P 종료 시 보고)

| P 종료 시 | 측정/보고 항목 |
|---|---|
| P1 | tailwind config + tokens.css diff + shadcn 9개 컴포넌트 데모 |
| P2 | 업로드 시나리오 1회 (Storage path / RLS / Compliance Gate 결과) |
| **P3** | **정확도 % + $/문제 비용 + p95 응답시간** |
| P4 | 학생 시드 1명 → 오늘의 회독퀘스트 3개 생성 확인 |
| P5 | 홈 화면 시안 vs 구현 픽셀 비교 (design-review 점수제) |
| **P6** | **브라우저에서 회독 1회 완주 시연** (캔버스 풀이 → 정답 제출 → 결과) |
| P7 | XP/스트릭/기억 HP 모든 룰 단위 테스트 통과 |
| P8 | 관리자 검수 1건 → audit_logs 기록 확인 |

### 토큰/시간 예산 초과 정책

각 P 예상치의 **1.5배** 초과 시 즉시 중단 + Mike에게 보고 + 재계획.

---

## 일러스트 외주 (비기능 트랙)

순공이(가안, 듀공 형태) 캐릭터 일러스트는 별도 외주 트랙:

| 시점 | 산출물 |
|---|---|
| P1 진행 중 | 외주 발주 (브리프 + 가이드라인 + UI 설계.md §6 참조) |
| P3 종료 시점 | 1차 시안 받음 |
| P5 진입 전 | 최종안 확정 + asset (SVG/PNG/Lottie) 전달 |
| P6 진입 전 | 표정 variants (응원/생각/축하) 추가 |

**중간 placeholder:** 추상 도형 또는 시안 이미지의 작업용 임시안. UI 설계.md §6 명시한 "가안" 상태 유지.

---

## 다음 단계

본 마스터 플랜이 OK되면 **P1 sub-plan부터 작성**. 단 Mike의 추가 지시 — **"개발에 필요한 환경은 이후에 하자"**:

| 트랙 | 진행 시점 |
|---|---|
| **문서 트랙** (sub-plan 작성) | **지금부터** — P1 → P2 → P3 순차로 sub-plan 문서만 작성 |
| **환경 트랙** (실제 Supabase / Vercel / GitHub Actions / Anthropic API 키 셋업) | **별도 시점, Mike 명시 OK 후** |
| 일러스트 외주 | P1 진행 중 발주 (환경 트랙과 무관) |

### 환경 트랙 진행 전 필요한 결정 (Mike 확인 사항)

| 결정 항목 | 선택지 | 비고 |
|---|---|---|
| Vercel 계정 | mugungwhwa (개인) vs treenod (회사) | 개인 SaaS면 mugungwhwa 권장 |
| Supabase 조직 | 개인 vs 회사 | 위와 동일 트랙 |
| Anthropic API 키 | 개인 vs SparkClaw 인프라 혜택 | SparkClaw는 OpenAI/Anthropic/GCP/Azure 혜택 제공 (SparkClaw 사업소개서.md §10) |
| OCR 외부 서비스 | Mathpix($, 수식 강함) vs Vision LLM only | P3 spike 후 결정 |
| AI 모델 1차 | Claude Haiku 4.5 (빠름/저렴) vs Sonnet 4.6 (품질) | 비용/품질 trade-off, P3에서 측정 후 결정 |

### Sub-plan 작성 순서 (추천)

1. **P1 sub-plan** — 디자인 토큰 + scaffolding이 가장 핵심, 다른 모든 P의 기반
2. **P2 sub-plan** — Compliance Gate는 법무 리스크 높음, 일찍 잠그기
3. **P3 sub-plan** — 가장 위험, 마스터 플랜 끝나면 우선 작성
4. P4-P8 sub-plan은 P3 완료 후 재검토하고 작성 (P3 결과에 따라 스코프 조정 가능)

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-14** | **초안. 8개 서브 프로젝트 outline + DB 스키마 9종 + Agent 배치 + 의존성 그래프 + 실패 시나리오 + 환경 트랙 분리.** |

---

> **이 마스터 플랜은 코드를 안 쓴다.** 코드는 sub-plan에 들어간다. 본 문서는 "어디로 갈지, 어떤 순서로 갈지, 누가 운전할지"의 지도만 잠근다.
> 환경 트랙은 별도. 문서 트랙부터 차근차근.
