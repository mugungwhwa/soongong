# 순공대장 — SparkClaw 제출 통합 자료

> **이 문서는 SparkClaw 서류 제출용 1-stop 자료다.** 사업소개서 본문(`00_프로젝트_사업_전략/SparkClaw_사업소개서.md`) + Agent 트랙 분리(`docs/agent-strategy/...`) + 시각 자산 가이드를 **심사관 관점**으로 재구성. PDF/PPT 변환은 §11 참조.
> 시안 SSoT: `app_UI.png` / `web_ui.png` (제출 시 첨부)

---

## 1. Executive Summary (1-page)

> **순공대장은 1인 창업자가 50+ Development Agent와 16개 Product Agent를 듀얼 운용해 8주 안에 동작시키는 AI-native 수능 회독 앱입니다.**
>
> 문제를 풀어주는 AI가 아니라, 학생이 다시 풀게 만드는 AI.

| 지표 | 값 |
|---|---|
| **한 줄 정의** | 수능생 듀오링고형 AI 회독 앱 |
| **핵심 차별점** | "다시 풀게 만드는 AI" — 해설 ✗ / 회수 ✓ |
| **시장** | 사교육비 **27.5조** / 고등학생 **7.8조** / 수능 응시자 **55만명** |
| **BM** | B2C 구독 9,900–19,900원/월 + B2B2C 독학재수 |
| **개발 기간** | 8주 MVP 1차 (W1-W8) |
| **개발 비용 (MVP 1차)** | $60–160 (SparkClaw 선정 시 인프라 혜택으로 **$0**) |
| **Product Agents** | 16개 백서 → **MVP 1차에 9개 구현** |
| **Development Agents** | 50+ subagent / skill (Claude Code 운용 팀) |
| **인간** | **1명** (Mike) |
| **메타 차별점** | "**AI Agent가 AI Agent를 만든다**" |

---

## 2. Problem

한국 수능생은 이미 많은 시간을 공부에 쓴다. 문제는 **공부를 안 하는 것**이 아니라, 공부한 것이 장기기억으로 남지 않는다는 점이다.

- 인강을 보고, 문제를 풀고, 오답을 표시하지만 대부분 여기서 멈춘다
- 언제 다시 풀어야 하는지 모른다
- 오답을 체계적으로 회수하지 못한다
- 공부시간은 쌓이지만 기억은 빠르게 사라진다

**해결할 문제 = 강의 부족 ✗ / 복습 실행 부족 ✓**

학술 근거 — 에빙하우스 망각곡선(Murre & Dros, 2015), 분산학습 효과(Cepeda et al., 2006), 인출 연습(Karpicke & Roediger, 2008 *Science*), 섞어풀기(Rohrer et al., 2014).

---

## 3. Solution — Source-to-Quest Engine

핵심 파이프라인:

```
문제사진 / 인강기록 / 캡처 + 메모
   ↓ [Source Intake]
Compliance Gate (저작권/PII)
   ↓
OCR & Parsing (Vision LLM)
   ↓
Subject Routing (수학/국어/영어/탐구)
   ↓
Learning Object Builder (단원/유형/난이도/오답원인 태깅)
   ↓
Review Scheduling (1/3/7/14일 망각위험 기반)
   ↓
Quest Conversion
   ↓
학생: 오늘의 회독퀘스트 3개
   ↓
오답회수 모드 (V0-V5 베리에이션)
   ↓
XP / 스트릭 / 기억 HP / 순공리그
```

핵심 UX: **오늘의 회독퀘스트** — 대시보드가 아니라 매일 3개를 바로 시작하게 만드는 화면.

---

## 4. Agent 듀얼 트랙 (SparkClaw 어필 핵심)

순공대장 창업자는 **1인이지만 운용 팀은 듀얼 Agent 트랙**으로 구성.

### 4.1 Product Agents (제품 내부, 사용자에게 작동)

백서 16개 Agent (3-레이어 구조):

**Layer 1 — 전체 파이프라인 16개** (SparkClaw §5 SSoT):
`Input Router / OCR & Capture Parsing / Lecture Capture / Question Analysis / Question DNA / Type RAG / Variation Policy / Difficulty / Question Generation / Solver / Evaluation / Review Scheduling / Quest / Game / Compliance / Admin Review`

**Layer 2 — Source-to-Quest 입구 6개**: `Source Intake → Compliance Gate → OCR & Parsing → Learning Object Builder → RAG Router → Quest Conversion`

**Layer 3 — 베리에이션 출구 8개** (MVP 1.5+): `문항 분석 → DNA 추출 → 정책 → 변형 → 오답 선지 → 난이도 → 정합성 평가 → 출제`

**MVP 1차 구현 9개** (W1-W8):
- Source Intake / Compliance Gate / OCR & Capture Parsing (Vision Sonnet 4.6)
- Subject Routing (Haiku 4.5)
- Learning Object Builder / Wrong Reason Tagger
- RAG Router (Student Memory 단순화)
- Review Scheduling / Quest Conversion / Game

### 4.2 Development Agents (Mike + Claude Code 협업, 50+)

| 카테고리 | 도구 |
|---|---|
| 전략 설계 | `oh-my-claudecode:architect`, `feature-dev:code-architect`, `vercel:ai-architect` |
| 구현 | `oh-my-claudecode:executor`, `autopilot`, `ultrawork` |
| 디자인 | `oh-my-claudecode:designer`, `design-system`, `design-review` |
| 코드 리뷰 | `code-reviewer`, `critic` (Opus), `pr-review-toolkit:*` |
| 보안 | `security-reviewer`, `security-check` skill |
| QA / 검증 | `qa-tester`, `verifier`, `superpowers:verification-before-completion` |
| TDD | `superpowers:test-driven-development` |
| 디버깅 | `superpowers:systematic-debugging`, `oh-my-claudecode:debugger` |
| 리팩토링 | `refactor-tools:refactor-pipeline`, `code-simplifier` |
| 아키텍처 검증 | `arch-guard:arch-audit/check/fix/pre-commit`, `fsd-migrate` |
| 계획·실행 | `superpowers:writing-plans / executing-plans / subagent-driven-development` |
| 메모리·컨텍스트 | `claude-mem`, `context7` MCP, `notepad`, `state` |
| 코드 탐색 | `oh-my-claudecode:explore`, AST/LSP MCP |
| Vercel | `vercel:nextjs / ai-sdk / functions / cache-components / routing-middleware` |

총 **50+ subagent / skill** — 1인 창업자가 운용하는 가상 팀.

### 4.3 시너지

```
Mike (1인 창업자)
   ↓ 결정
Development Agents (50+)
   ↓ 설계 / 구현 / 리뷰 / 테스트
Product Agents (16개)
   ↓ 학생에게 작동
사용자 (수험생)
```

**"AI Agent가 AI Agent를 만든다"** — SparkClaw가 정확히 보는 메타-레벨.

---

## 5. 8주 로드맵

| 주 | Phase | 출력물 | 핵심 agent |
|---|---|---|---|
| W1 | **P1 Foundation** | Next.js+FSD+Supabase+디자인 토큰 | architect → executor → design-review |
| W1-2 | **P2 Source Intake** | 업로드+Compliance Gate | architect → executor → security |
| W2-3 | **P3 AI Pipeline ⚠️** | 라우팅+OCR+학습객체+오답태깅 | vercel:ai-architect → executor → qa-tester |
| W3 | **GATE** | OCR 정확도 ≥ 90% | qa-tester (eval harness) |
| W4 | **P4 Scheduling** | 1/3/7/14일 cron | code-architect → executor |
| W4-5 | **P5 Home/Quest UI** | 홈+퀘스트 카드 | designer → executor → design-review |
| W5-6 | **P6 Play+Recovery+Canvas** | 회독 플레이+오답회수+풀이 | designer → qa-tester (E2E) |
| W6-7 | **P7 Game System** | XP/스트릭/HP/뱃지 10종 | executor |
| W7-8 | **P8 Admin** | 검수 화면 (P3 병렬 가능) | executor + security |

각 phase는 `docs/superpowers/plans/2026-05-14-soongong-mvp1-p1..p8.md`에 **실제 코드 수준 sub-plan**으로 잠겨있음. 총 **~6,500줄 plan**.

---

## 6. 시장성 + Business Model

### 6.1 시장

| 구분 | 기준 |
|---|---|
| TAM | 국내 초·중·고 사교육비 **27.5조원** (2025) |
| SAM | 고등학생 사교육비 **7.8조원** + 수능/N수 학습시장 |
| 초기 SOM | 수능 응시자 **55만명** 중 인강·오답관리 니즈 1-5% |

보수적 계산: 2% × 9,900원 → 연 매출 약 **13억원**. 10% 확장 시 약 **65억원**.

### 6.2 요금제

| Plan | 기능 |
|---|---|
| **Free** | 문제사진 제한, 오늘의 회독 일부, 스트릭 |
| **Plus** | 무제한 회독 생성, 오답던전, 망각방어전, 과목별 약점 |
| **Pro** | AI 유사문항, 고급 리포트, 4점보스, 학부모 공유 |
| **B2B/B2B2C** | 독학재수학원·관리형 스터디센터용 대시보드 |

**초기 과금 포인트**: "AI가 문제를 풀어준다" ✗ / **"내가 올린 문제와 인강 기록을 계속 회독시켜준다"** ✓

---

## 7. 법무 / 보안 포지션 (신뢰 포인트)

| 정책 | 적용 |
|---|---|
| Raw / Derived 분리 | 원본 문제사진·인강 캡처는 7-30일 자동 삭제, 파생 학습 객체만 장기 저장 |
| Compliance Gate | 업로드마다 저작권/PII 자동 분류 (pass/redact/derived_only/reject/admin_review) |
| Supabase RLS | 학생 본인 데이터만 접근, 모든 admin 액션 audit_logs 기록 |
| AI 생성물 고지 | "AI 분석 결과이며 오류 가능성 있음" 표시 + 오류 신고 버튼 |
| 미성년자 보호 | 만 14세 미만 보호자 동의 게이트 (개인정보보호법 준수) |
| 외부 위탁 고지 | OCR/LLM 위탁 명시, 국외 이전 안내 |

---

## 8. 위험 + 완화

| 위험 | 완화 |
|---|---|
| **P3 OCR 정확도 미달** | manual 폴백 (학생 직접 텍스트 입력) 옵션 P2 단계에서 미리 제공. Mathpix 활성 토글. |
| Anthropic API rate limit | exponential backoff + queue |
| Mathpix 비용 폭증 | `ENABLE_MATHPIX=false` 즉시 토글 |
| tldraw 라이선스 | Konva 폴백 (1-2일 spike) |
| 이미지 5MB 초과 | client-side resize (max 1920px long edge) |
| PII 노출 | Compliance Gate에서 차단 — AI Pipeline 도달 전 처리 |

---

## 9. 데모 흐름 (시안 기반)

`app_UI.png` 모바일 + `web_ui.png` 대시보드에서 다음 흐름 시연:

1. **온보딩** → 학년 선택 → "📷 문제사진 1장 올리기"
2. **업로드 시트** → 문제사진 / 인강 시청 / 캡처+메모 / 직접 입력 4-옵션
3. **AI 분석 결과 카드** → "수학·수열·점화식 · L3 · 인덱스 혼동" → 학생 "맞아요"
4. **홈** → 통계 4-카드(🔥7일·❤️5/5·⏱32분·1240XP) + 마스코트 인사 + 오늘의 회독퀘스트 3개
5. **회독 플레이** → 풀이 캔버스(tldraw) + 정답 제출
6. **결과 보상** → +40 XP 카운트업 + confetti + 마스코트 축하
7. **오답회수** (오답 시) → 3단계 V1-V5 변형 → 회수 성공
8. **순공리그** (MVP 1.5+) → 주간 점수 + 승급

---

## 10. 1000자 제출문 (사업소개서 발췌)

> 순공대장은 수능생을 위한 듀오링고형 AI 회독 앱입니다. 한국 수능생은 인강과 문제풀이에 많은 시간을 쓰지만, 실제 문제는 공부한 내용을 다시 꺼내지 못하고 오답을 회수하지 못한다는 점입니다. 순공대장은 학생이 문제사진, 인강기록, 캡처, 메모를 올리면 AI Agent가 과목·단원·유형·오답원인·난이도를 분석하고, 1일/3일/7일/14일 복습 퀘스트로 전환합니다. 학생은 마스코트 캐릭터 '순공이'(가안, 듀공 형태)가 안내하는 오늘의 회독퀘스트, 오답던전, 망각방어전을 클리어하며 XP, 스트릭, 기억 HP, 순공리그를 통해 매일 복습 루틴을 유지합니다.
>
> 이 제품의 핵심은 문제풀이 AI가 아니라, 학생이 실제 공부한 흔적을 장기기억으로 전환하는 Source-to-Quest Engine입니다. 내부는 OCR, 문항분석, 수능 유형 RAG, 학생 기억 RAG, 난이도 조절, 회독 스케줄링, 게임 리텐션 Agent로 구성됩니다. 원본 문제와 인강 캡처는 최소 저장하고, 과목·단원·유형·오답원인·복습시점 등 파생 학습 데이터 중심으로 누적해 저작권과 개인정보 리스크를 줄입니다.
>
> 순공대장 창업자는 1인이지만 운용 팀은 듀얼 Agent 트랙으로 구성됩니다. Product Agents 16개와 Development Agents 50+를 동시에 운용해 8주 안에 16-Agent 학습 엔진을 동작시키는 "AI Agent가 AI Agent를 만든다" 구조입니다.
>
> 국내 초·중·고 사교육비는 2025년 27.5조 원, 고등학생 사교육비는 7.8조 원 규모이며, 2026학년도 수능 지원자는 55만 명 이상입니다. 순공대장은 이 중 인강 중심 독학재수생과 오답관리가 약한 수능생을 초기 타깃으로 월 구독형 B2C 모델을 검증하고, 이후 독학재수학원·스터디센터용 B2B2C 관리 대시보드로 확장합니다.

---

## 11. PDF / PPT 변환 가이드

### 본 문서를 PDF로

```bash
# pandoc 설치 (Mac)
brew install pandoc

# PDF 생성
cd docs/sparkclaw
pandoc 2026-05-14-sparkclaw-submission.md \
  -o submission.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="Pretendard" \
  -V geometry:margin=1in
```

### Marp 슬라이드 deck

```bash
# Marp CLI
npm install -g @marp-team/marp-cli

# slide-deck-draft.md → PDF
marp docs/sparkclaw/slide-deck-draft.md --pdf

# 또는 PPTX
marp docs/sparkclaw/slide-deck-draft.md --pptx
```

VS Code Marp 익스텐션 사용 시 실시간 프리뷰 가능.

---

## 12. 부록 — 핵심 문서 링크

| 자료 | 경로 |
|---|---|
| 마스터 플랜 | `docs/superpowers/plans/2026-05-14-soongong-mvp1-master.md` |
| Agent 듀얼 트랙 | `docs/agent-strategy/2026-05-14-agent-tracks.md` |
| 시각 자산 inventory | `docs/visual-assets/2026-05-14-soongong-asset-inventory.md` |
| 환경 결정 | `docs/setup/2026-05-14-environment-decisions.md` |
| UI 설계 v2.3 | `01_제품_UX_게임화/순공대장_UI_설계.md` |
| 원본 사업소개서 | `00_프로젝트_사업_전략/SparkClaw_사업소개서.md` |
| 시안 이미지 | `app_UI.png` / `web_ui.png` |
| GitHub | `https://github.com/mugungwhwa/soongong` |

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-14** | **초안. SparkClaw 제출 통합 자료 — 1-page summary + 듀얼 Agent 어필 + 8주 로드맵 + 시장성 + 위험 + 데모 흐름 + 1000자 제출문 + PDF/Marp 변환 가이드 + 부록.** |
