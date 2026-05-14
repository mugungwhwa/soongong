# 순공대장 Agent Strategy — 듀얼 트랙

> **핵심 원칙**: 순공대장은 두 개의 독립된 Agent 트랙으로 운용된다. **Product Agents**(제품 안, 사용자에게 작동)와 **Development Agents**(개발 운용, Mike + Claude Code 팀). 이 분리가 SparkClaw 차별점의 정확한 표현이다.
> SSoT: SparkClaw 사업소개서.md §5 (16개 Agent 백서), 외부_데이터_유입_엔진.md §6 (Source-to-Quest 6개), 문제_생성_Agent.md §9 (베리에이션 파이프라인 8개)

---

## 1. 개요 — 왜 듀얼 트랙인가

SparkClaw가 서류 스크리닝에서 보는 건 두 가지를 **동시에** 만족하는 창업자:

1. **AI Agent가 제품의 핵심 기능**인가? → Product Agents
2. **창업자가 AI를 팀원처럼 운용**하는가? → Development Agents

순공대장은 둘 다 갖춰져 있다. 다만 명시적으로 분리해 문서화하지 않았을 뿐. 본 문서는 그 분리를 잠근다.

```
                  ┌──────────────────────────┐
                  │   Mike (1인 창업자)        │
                  └────────────┬─────────────┘
                               │
                ┌──────────────┴───────────────┐
                │                              │
        ┌───────▼─────────┐          ┌─────────▼────────┐
        │ Development     │   설계/   │ Product          │
        │ Agents (30+)    │   구현/   │ Agents (16개)     │
        │ Claude Code 팀  │   리뷰    │ 학습 분석 엔진     │
        └─────────────────┘          └────────┬─────────┘
                                              │
                                     ┌────────▼─────────┐
                                     │ 사용자 (수험생)    │
                                     └──────────────────┘
```

**Agent가 Agent를 만든다.** 이게 메타-레벨 차별점.

---

## 2. Product Agents (제품 안, 사용자에게 작동)

### 2.1 Layer 1 — 전체 백서 16개 Agent (SparkClaw §5 SSoT)

| # | Agent | 역할 |
|---|---|---|
| 1 | **Input Router** | 입력 소스 타입 분류 (문제사진/인강기록/캡처/메모) |
| 2 | **OCR & Capture Parsing** | 이미지/캡처를 문제 본문·선지·조건·그림으로 분해 |
| 3 | **Lecture Capture** | 인강명/단원/타임스탬프/학생메모 처리 |
| 4 | **Question Analysis** | 문제 구조 분석 |
| 5 | **Question DNA** | 개념/풀이전략/조건/오답원인 분해 |
| 6 | **Type RAG (Retrieval)** | 수능 유형 카드 검색 |
| 7 | **Variation Policy** | 학생 숙련도 기반 V0-V5 변형 단계 선택 |
| 8 | **Difficulty** | L1-L5 난이도 판정 |
| 9 | **Question Generation** | 변형 문제 생성 (숫자/조건/요구값/표현) |
| 10 | **Solver** | 생성 문제 검증 (정답 유일성) |
| 11 | **Evaluation** | 수능형 품질 평가 |
| 12 | **Review Scheduling** | 1/3/7/14일 회독 간격 + 망각위험 계산 |
| 13 | **Quest** | 오늘의 회독퀘스트/오답던전/망각방어전/4점보스 배치 |
| 14 | **Game** | XP/스트릭/HP/뱃지/리그 룰 적용 |
| 15 | **Compliance** | 저작권/PII 게이트 |
| 16 | **Admin Review** | 검수자 워크플로우 |

### 2.2 Layer 2 — Source-to-Quest Engine 6개 (입구 파이프라인)

외부_데이터_유입_엔진.md §6 명시. 입력 → 학습 객체 → 퀘스트 변환의 단방향 파이프라인.

```
Source Intake → Compliance Gate → OCR & Parsing → Learning Object Builder → RAG Router → Quest Conversion
```

| Agent | I/O |
|---|---|
| Source Intake | external_sources insert, source_type 분류 |
| Compliance Gate | source_compliance_checks 결정 (allow_*/action) |
| OCR & Parsing | Vision LLM + Mathpix 폴백, 구조화 JSON |
| Learning Object Builder | 과목/단원/유형/난이도/오답원인 태깅 → `parsed_learning_objects` |
| RAG Router | Curriculum / Type Pattern / Student Memory 분배 |
| Quest Conversion | `review_quests` 발급 + reward 계산 |

### 2.3 Layer 3 — 베리에이션 파이프라인 8개 (MVP 2차)

문제_생성_Agent.md §9 명시. 학생이 틀린 후 V1-V5 변형 문제를 생성하는 출구 파이프라인.

```
문항 분석 → 문항 DNA 추출 → 베리에이션 정책 → 문항 변형 → 오답 선지 → 난이도 → 정합성 평가 → 출제
```

MVP 1.5/2차에 단계적 활성화. MVP 1차에서는 Source-to-Quest의 Quest Conversion이 사전 정의된 V0(원문 회독)만 발급.

### 2.4 MVP 단계별 구현 매트릭스

총 16개 중 단계별 구현:

| Agent | MVP 1차 (W1-8) | MVP 1.5차 | MVP 2차 |
|---|:-:|:-:|:-:|
| Input Router | ✅ | | |
| Compliance Gate | ✅ | | |
| OCR & Capture Parsing | ✅ | | |
| Lecture Capture | (간이) | ✅ | |
| Subject Routing (Input Router 흡수) | ✅ | | |
| Learning Object Builder | ✅ | | |
| Wrong Reason Tagger (Question Analysis 일부) | ✅ | | |
| RAG Router (Student Memory만) | ✅ (단순화) | | |
| Question DNA | | ✅ | |
| Type RAG (Retrieval) | | ✅ | |
| Variation Policy | | ✅ | |
| Question Generation | | ✅ | |
| Difficulty | | ✅ | |
| Solver | | | ✅ |
| Evaluation | | | ✅ |
| Review Scheduling | ✅ | | |
| Quest Conversion (Quest 일부) | ✅ | | |
| Quest (전체) | (V0 원문) | ✅ | |
| Game | ✅ | | |
| Admin Review | ✅ (수동 UI) | | (자동화) |
| **합계** | **9개** | **+5개** | **+2개** |

**MVP 1차 = 16개 중 9개 구현.** SparkClaw 어필: "백서 16개 → MVP 1차에 9개 → 단계적 확장으로 8주 내 동작 검증".

---

## 3. Development Agents (개발 운용, Mike + Claude Code 팀)

### 3.1 카테고리별 매핑

총 30+ subagent + skill. 이미 Mike의 환경에 설치돼 있음. 카테고리별 정리:

| 카테고리 | 도구 | 출처 |
|---|---|---|
| **전략 설계** | `oh-my-claudecode:architect` (Opus, 전략) | 플러그인 |
| | `oh-my-claudecode:planner` (Opus, 인터뷰형 계획) | 플러그인 |
| | `feature-dev:code-architect` (블루프린트) | 플러그인 |
| | `feature-dev:code-explorer` (코드베이스 분석) | 플러그인 |
| | `vercel:ai-architect` (AI/MCP/Agent 설계) | 플러그인 |
| **구현** | `oh-my-claudecode:executor` (Sonnet, 빠른 실행) | 플러그인 |
| | `oh-my-claudecode:autopilot` (전체 자율) | 플러그인 |
| | `oh-my-claudecode:ultrawork` (병렬 실행) | 플러그인 |
| **디자인** | `oh-my-claudecode:designer` (UI/UX) | 플러그인 |
| | `design-system:design-system` skill (토큰/패턴 가이드) | skill |
| | `design-system:design-review` skill (8대 패턴 점수제) | skill |
| **코드 리뷰** | `oh-my-claudecode:code-reviewer` (심각도 평가) | 플러그인 |
| | `oh-my-claudecode:critic` (Opus, 다각도 비판) | 플러그인 |
| | `pr-review-toolkit:code-reviewer` (PR 표준 검사) | 플러그인 |
| | `pr-review-toolkit:silent-failure-hunter` (silent error 탐지) | 플러그인 |
| | `pr-review-toolkit:type-design-analyzer` (타입 설계 검증) | 플러그인 |
| | `pr-review-toolkit:comment-analyzer` (주석 품질) | 플러그인 |
| | `vercel:react-best-practices` (TSX 컴포넌트) | skill |
| **보안** | `oh-my-claudecode:security-reviewer` (OWASP) | 플러그인 |
| | `security-check:security-check` skill (Supabase RLS 중심) | skill |
| **QA / 검증** | `oh-my-claudecode:qa-tester` (tmux 세션) | 플러그인 |
| | `oh-my-claudecode:verifier` (증거 기반 검증) | 플러그인 |
| | `superpowers:verification-before-completion` (사실 확인 강제) | skill |
| **TDD** | `superpowers:test-driven-development` (테스트 우선) | skill |
| | `oh-my-claudecode:test-engineer` (E2E 전략) | 플러그인 |
| | `oh-my-claudecode:ultraqa` (반복 테스트) | 플러그인 |
| **디버깅** | `superpowers:systematic-debugging` (근본 원인 분석) | skill |
| | `oh-my-claudecode:debugger` (regression/stack trace) | 플러그인 |
| | `vercel:verification` (full-story 검증) | skill |
| **리팩토링** | `oh-my-claudecode:code-simplifier` (코드 단순화) | 플러그인 |
| | `refactor-tools:refactor-pipeline` (대형 파일 자동 분할) | 플러그인 |
| | `refactor-tools:split-file` (단일 파일 분할) | 플러그인 |
| **아키텍처 검증** | `arch-guard:arch-audit` (6대 패턴 분석) | 플러그인 |
| | `arch-guard:arch-check` (감사+자동수정) | 플러그인 |
| | `arch-guard:arch-fix` (자율 수정) | 플러그인 |
| | `arch-guard:pre-commit` (커밋 게이트) | 플러그인 |
| | `fsd-migrate:fsd-migrate` (FSD 마이그레이션) | 플러그인 |
| **계획 / 실행** | `superpowers:writing-plans` (sub-plan 작성) | skill |
| | `superpowers:executing-plans` (인라인 실행) | skill |
| | `superpowers:subagent-driven-development` (서브에이전트 실행) | skill |
| | `superpowers:brainstorming` (요구 발굴) | skill |
| | `superpowers:dispatching-parallel-agents` (병렬 디스패치) | skill |
| **메모리 / 컨텍스트** | `claude-mem` MCP (cross-session 메모리) | MCP |
| | `context7` MCP (라이브러리 문서 실시간) | MCP |
| | `oh-my-claudecode-t__notepad_*` MCP (notepad) | MCP |
| | `oh-my-claudecode-t__state_*` MCP (state) | MCP |
| **코드 탐색** | `oh-my-claudecode:explore` (코드 탐색) | 플러그인 |
| | `oh-my-claudecode-t__ast_grep_*` MCP (AST 검색) | MCP |
| | `oh-my-claudecode-t__lsp_*` MCP (LSP) | MCP |
| **외부 컨텍스트** | `oh-my-claudecode:external-context` (병렬 문서 조회) | 플러그인 |
| | `oh-my-claudecode:ccg` (Claude+Codex+Gemini 3-model) | 플러그인 |
| **데이터** | `oh-my-claudecode:scientist` (데이터 분석) | 플러그인 |
| | `oh-my-claudecode:sciomc` (병렬 scientist) | 플러그인 |
| **문서** | `oh-my-claudecode:writer` (Haiku, 빠른 문서) | 플러그인 |
| | `oh-my-claudecode:document-specialist` (외부 문서 조사) | 플러그인 |
| **Vercel** | `vercel:nextjs` (App Router 가이드) | skill |
| | `vercel:ai-sdk` (Vercel AI SDK 패턴) | skill |
| | `vercel:vercel-functions` (Edge / Serverless) | skill |
| | `vercel:next-cache-components` (캐싱) | skill |
| | `vercel:routing-middleware` (미들웨어) | skill |

**총 50+ subagent / skill.** 1인 창업가가 운용하는 가상 팀의 규모.

### 3.2 P별 디스패치 매트릭스 (MVP 1차)

각 P에서 어떤 Development Agent를 어떤 단계에 디스패치할지:

| Phase | 진입 시 (요구 발굴) | 설계 | 구현 | 디자인 | 리뷰 / QA | 커밋 게이트 |
|---|---|---|---|---|---|---|
| **P1 Foundation** | brainstorming | architect → code-architect | executor | design-system + design-review | code-reviewer | arch-guard:pre-commit |
| **P2 Source Intake** | (skip) | code-architect | executor | design-review | security-check + security-reviewer (병렬) + silent-failure-hunter | arch-guard + security-check |
| **P3 AI Pipeline** ⚠️ | brainstorming | vercel:ai-architect | executor + ai-architect | (skip, BE 중심) | qa-tester + verifier (정확도 측정) + critic | qa-tester gate (≥90%) |
| **P4 Scheduling** | (skip) | code-architect | executor | (skip) | code-reviewer | arch-guard |
| **P5 Home/Quest UI** | brainstorming | designer | executor | design-system 가이드 참조 + design-review 점수제 | react-best-practices + design-review | design-review ≥ 70점 |
| **P6 Play/Recovery/Canvas** | brainstorming | designer | executor | design-review | qa-tester (브라우저 E2E) + verifier + silent-failure-hunter | qa-tester + design-review |
| **P7 Game System** | (skip) | code-architect | executor | (skip) | code-reviewer + type-design-analyzer | arch-guard |
| **P8 Admin** | (skip) | code-architect | executor | (skip) | security-check + code-reviewer | security-check + arch-guard |

**공통 wrapper**: 모든 P 진입 전 `superpowers:writing-plans` (sub-plan 확인) + 실행은 `superpowers:subagent-driven-development` + 종료 시 `superpowers:verification-before-completion`.

---

## 4. Claude Code 하네스 권장 셋업

Development Agent 트랙을 실제로 작동시키는 인프라.

### 4.1 settings.json (`.claude/settings.local.json`)

```jsonc
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(pnpm:*)",
      "Bash(npx:*)",
      "Bash(supabase:*)",
      "Bash(vercel:*)",
      "Bash(curl:*)",
      "Bash(jq:*)",
      "Bash(grep:*)",
      "Bash(find:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(wc:*)",
      "WebFetch(domain:supabase.com)",
      "WebFetch(domain:sdk.vercel.ai)",
      "WebFetch(domain:docs.anthropic.com)",
      "WebFetch(domain:nextjs.org)"
    ]
  },
  "env": {
    "BASH_DEFAULT_TIMEOUT_MS": "120000",
    "ANTHROPIC_MODEL_PRIMARY": "claude-haiku-4-5-20251001",
    "ANTHROPIC_MODEL_QUALITY": "claude-sonnet-4-6"
  }
}
```

### 4.2 Hooks 권장

이미 Mike 환경에 잡혀있는 PreToolUse 병렬 강제 / 검증 강제 hook은 유지. 추가:

| Hook | 트리거 | 동작 |
|---|---|---|
| SessionStart | Claude Code 시작 | P3 진행 시 `eval/p3/results/` 마지막 run summary 자동 출력 (게이트 통과 여부 즉시 인지) |
| PostToolUse(Edit) | `tailwind.config.ts` / `tokens.css` 수정 후 | `pnpm lint:tokens` 자동 실행 (등록 외 hex 차단) |
| PreToolUse(Bash) | `git push` 명령 시 | 현재 branch가 main이고 commit이 origin보다 앞서면 1회 확인 prompt |
| pre-commit (git hook) | `git commit` 전 | `arch-guard:pre-commit` 자동 실행 |

### 4.3 Plugins 우선순위 (P별 사용)

| 우선순위 | 플러그인 | P별 사용 |
|---|---|---|
| 1 | superpowers | 모든 P (plan / execute / verify) |
| 2 | oh-my-claudecode | 모든 P (architect/executor/designer/reviewer) |
| 3 | vercel | P1 (scaffold), P3 (AI SDK), 배포 |
| 4 | feature-dev | P 진입 시 codebase 이해 + 아키텍처 설계 |
| 5 | design-system | P5/P6 UI 작업 |
| 6 | claude-mem | 세션 간 의사결정 회상 |
| 7 | context7 | Supabase / Next.js / AI SDK 최신 문서 |
| 8 | arch-guard | 커밋 전 FSD 검증 (P1-P8 전체) |
| 9 | refactor-tools | P3 Edge Function 커지면 분할 |
| 10 | pr-review-toolkit | PR 생성 전 종합 리뷰 |

### 4.4 MCP 서버

이미 설치됨:
- `claude-mem` (cross-session memory)
- `context7` (라이브러리 문서)
- `oh-my-claudecode-t` (LSP, AST grep, notepad, state)

추가 권장:
- `@supabase/mcp-server-supabase` — 마이그레이션/RLS/Edge Function 직접 호출
- `mcp-server-vercel` (또는 vercel CLI 직접) — 배포 모니터링

### 4.5 핵심 슬래시 명령 (Mike 자주 쓸 것)

| 명령 | 용도 | P별 |
|---|---|---|
| `/sc:implement` | 기능 구현 (executor + persona 자동) | 모든 P |
| `/sc:design` | 시스템 설계 | P3 진입 시 |
| `/sc:analyze` | 코드 품질/보안/아키텍처 분석 | 각 P 종료 시 |
| `/sc:troubleshoot` | 버그/빌드 오류 해결 | 막힐 때마다 |
| `/feature-dev:feature-dev` | feature 단위 가이드 개발 | 모든 P |
| `/arch-guard:arch-check` | FSD 위반 검출 + 자동 수정 | 매 commit 전 |
| `/design-system:design-review` | UI 일관성 자동 검증 | P5/P6 후 |
| `/security-check:security-check` | OWASP + RLS 점검 | P2/P3/P8 |
| `/superpowers:writing-plans` | sub-plan 작성 | P 진입 시 |
| `/superpowers:subagent-driven-development` | sub-plan 실행 | sub-plan 작성 후 |
| `/oh-my-claudecode:ralph` | 자동 반복 실행 (검증 통과까지) | P3 OCR 정확도 튜닝 |
| `/oh-my-claudecode:team` | N개 agent 병렬 작업 | P5/P6 컴포넌트 다수 |

---

## 5. SparkClaw 어필 — 듀얼 Agent 운용

### 5.1 한 줄 표현

> **순공대장 창업자는 1인이지만 운용 팀은 듀얼 Agent 트랙(Product 16개 + Development 50+)으로 구성된다. SparkClaw가 찾는 "AI를 팀원처럼 운용하는 1인 창업자 + AI Agent가 제품의 핵심인 서비스" 조건을 동시에 만족한다.**

### 5.2 단락 (사업소개서 §10 추가용)

```text
Agent 운용 방식 (듀얼 트랙)

순공대장 창업자는 1인이지만 운용 팀은 두 개의 Agent 트랙으로 구성됩니다.

Product Agents (제품 안, 사용자에게 작동): 16개 Agent로 구성된 학습
분석 엔진. Input Router → OCR → Question Analysis → Type RAG →
Variation → Solver → Review Scheduling → Quest → Game 파이프라인.
MVP 1차에 9개를 구현하고, MVP 1.5/2차에 나머지 7개로 단계적 확장.

Development Agents (개발 운용, Mike + Claude Code 협업): 50+ subagent
와 skill로 구성된 가상 개발 팀. oh-my-claudecode(전략/구현/디자인/
리뷰), superpowers(brainstorming/TDD/verification), vercel(AI SDK/
배포), feature-dev(아키텍처), design-system(UI 일관성), arch-guard
(FSD 검증) 등을 1인 창업자가 팀처럼 운용.

이 듀얼 구조는 "AI Agent가 AI Agent를 만든다"는 메타-레벨로, 1인
창업이 8주 안에 16-Agent 학습 엔진을 동작시키는 것을 가능하게 합니다.
```

### 5.3 수치로 어필 (옵션)

- Product Agents: **16개** (백서) / 9개 (MVP 1차 구현)
- Development Agents: **50+ subagent / skill** (가상 팀 규모)
- 인간: **1명** (Mike)
- 개발 기간: **8주** (MVP 1차)
- 1인 + AI 팀이 만드는 16-Agent 학습 엔진 — 이게 정확한 SparkClaw 적합도

---

## 6. 디스패치 가이드 (실전)

### 6.1 새 P 시작 시

```
1. /superpowers:brainstorming   (요구 명확화)
2. /superpowers:writing-plans   (sub-plan 작성)
3. /superpowers:using-git-worktrees  (격리 작업 공간)
4. /superpowers:subagent-driven-development  (task별 fresh subagent + 두 단계 리뷰)
```

### 6.2 각 task 안에서

```
1. architect → code-architect로 블루프린트
2. executor로 구현
3. test-driven-development로 테스트 먼저
4. code-reviewer + design-review (관련 시)로 리뷰
5. verifier로 사실 확인
6. arch-guard로 커밋 게이트
```

### 6.3 막힐 때

```
1. /superpowers:systematic-debugging  (근본 원인)
2. /oh-my-claudecode:debugger        (stack trace)
3. /sc:troubleshoot                  (빌드/배포)
4. /oh-my-claudecode:critic          (Opus, 다각도 비판)
5. /oh-my-claudecode:ccg             (3-model 합의)
```

### 6.4 PR / 머지 전

```
1. /pr-review-toolkit:code-reviewer
2. /pr-review-toolkit:silent-failure-hunter
3. /pr-review-toolkit:type-design-analyzer (타입 추가됐을 때)
4. /pr-review-toolkit:pr-test-analyzer
5. /security-check:security-check  (P2/P3/P8 관련)
6. /arch-guard:pre-commit
```

---

## 7. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-14** | **초안. Product Agents 16개 정확 명세 (SparkClaw §5 SSoT) + Source-to-Quest 6개 + 베리에이션 8개 = 3 레이어. MVP 단계별 구현 매트릭스. Development Agents 50+ subagent 카테고리별 매핑. P별 디스패치 매트릭스. Claude Code 하네스 권장 셋업 (settings/hooks/plugins/MCP/슬래시). SparkClaw 어필 단락.** |

---

> **"Agent가 Agent를 만든다."** Product Agents가 학생을 가르치고, Development Agents가 Product Agents를 만든다. 1인 창업가는 이 두 트랙의 오케스트레이터.
