# 순공대장 — 문제 평가 / 문제 리뷰 / UI 리서치 cross-cut 워크플로우

**Spec version:** v1.0
**작성일:** 2026-05-18
**상태:** brainstorming 단계 — Mike 검토 대기
**관련 문서:**
- `docs/agent-strategy/2026-05-14-agent-tracks.md` (디스패치 매트릭스 §3.1-3.2)
- `docs/superpowers/plans/2026-05-14-soongong-mvp1-p3-ai-pipeline.md`
- `docs/superpowers/plans/2026-05-14-soongong-mvp1-p4-review-scheduling.md`
- `docs/superpowers/plans/2026-05-14-soongong-mvp1-p5-home-quest-ui.md`
- `docs/superpowers/plans/2026-05-14-soongong-mvp1-p6-play-recovery-canvas.md`
- `CLAUDE.md` (잠긴 결정사항 §2)

---

## 0. 목적과 범위

MVP 1차의 세 핵심 도메인 — **문제 평가** / **문제 리뷰** / **UI 리서치(듀오링고 follow-up)** — 에 대해, 어떤 에이전트·스킬을 어느 시점에 어떤 순서로 디스패치할지를 한 페이지에 묶는다.

**왜 별도 spec인가:**
- 기존 `agent-tracks.md §3.2`는 **Phase 축**(P1→P8 시간 순서)에 강하지만, **도메인 축**(한 도메인이 여러 Phase를 가로지를 때) cross-cut view가 없다.
- 이 spec은 §3.2를 폐기하지 않고, 그 위에 도메인 layer를 얹는다. 두 축 동시 유지.

**범위:**
- ✅ 3개 도메인의 진입 트리거 / 산출물 / 디스패치 순서 / hook 지점 / 위험·완화
- ✅ 통합 게이트 + `agent-tracks.md §3.2` 보강 항목 명시
- ❌ 도메인별 sub-plan 재작성 (기존 P3/P4/P5/P6 sub-plan 보존)
- ❌ 코드 구현 (writing-plans → executing-plans 단계에서)

---

## §1. 도메인 매트릭스 (cross-cut overview)

| 도메인 | 진입 트리거 | 핵심 산출물 | 주력 에이전트 | hook 지점 |
|---|---|---|---|---|
| **문제 평가** | P3 시작 시 + 매 학생 업로드(runtime) | 정확도 리포트 ≥90% / `problem` row + meta | `vercel:ai-architect` → `executor` → `qa-tester` + `verifier` + `critic` + `scientist` | P3 sub-plan §4 |
| **문제 리뷰** | 첫 풀이 직후 + 1/3/7/14d cron + 리뷰 풀이 직후 | `review_queue` / `review_attempt` / 회독 카드 N장 | `code-architect` → `executor` → `code-reviewer` + `silent-failure-hunter` + `scientist` | P4 + P6 (Play) |
| **UI 리서치 (듀오링고 follow-up)** | P5 시작 **1주 전 one-shot** | reference deck + 디자인 토큰 lock PR + 패턴 catalog | `external-context` + `document-specialist` → `ccg` → `designer` → `design-review` | P5 §0 + `CLAUDE.md §2` 갱신 |

---

## §2. 문제 평가 mini-workflow

### 2.1 진입 트리거
- ① **빌드 시 (1회)** — P3 sub-plan 구현 시작 시 evaluator 모듈 구축
- ② **런타임 (매번)** — 학생이 문제 이미지/캡처 업로드할 때마다

### 2.2 산출물
- **빌드 시**: `eval/p3/results/{date}.jsonl` — 수학 점화식 10장 정확도 ≥ 90% 게이트
- **런타임**: `problem` row 1건 + `meta: {ocr_text, type, difficulty, mistake_likelihood, source_tag}`

### 2.3 디스패치 순서 (sequential `→`, parallel `||`)
1. **설계** — `vercel:ai-architect` (Claude SDK + tool definition + prompt 전략, **P0 `src/shared/lib/ai.ts` mock contract 준수**)
2. **구현** — `oh-my-claudecode:executor` + `vercel:ai-sdk` skill 참조
3. **정확도 측정** — `oh-my-claudecode:qa-tester` (eval suite 실행) || `oh-my-claudecode:verifier` (증거 기반 검증) — parallel
4. **다각도 점검** — `oh-my-claudecode:critic` (Opus 비판, 1회)
5. **분포 분석** — `oh-my-claudecode:scientist` (난이도/유형별 정확도 분포)

### 2.4 hook 지점
P3 sub-plan §4 (evaluator 모듈) 내부 강화. **새 sub-plan 추가 없음.**
evaluator 출력 schema는 P4 회독 큐가 consume.

### 2.5 위험 / 완화
- **fail mode**: 수학 수식 OCR 90% 미달 → **manual 폴백 활성** (학생이 OCR 결과 보정 가능한 텍스트 input UI 제공)
- **plan B**: tesseract + Claude vision dual + heuristic fallback

---

## §3. 문제 리뷰 mini-workflow

### 3.1 진입 트리거
- ① **큐 생성** — 학생 첫 풀이 직후
- ② **due 도래** — 1/3/7/14d cron
- ③ **다음 due 재계산** — 학생 리뷰 풀이 직후

### 3.2 산출물
- `review_queue` row (`due_at`, `interval_step`, `mastery_score`)
- `review_attempt` row (정답률, 풀이 시간, hint 사용 횟수)
- **학생 뷰**: 오늘의 회독퀘스트 카드 N장
- ※ schema는 P0 `src/shared/mocks/quests.ts` + `recovery-variants.ts`와 정합

### 3.3 디스패치 순서
1. **설계** — `feature-dev:code-architect` (스케줄링 + SM-2 변형 알고리즘)
2. **구현** — `oh-my-claudecode:executor` + `vercel:vercel-functions` (cron) + Supabase RLS
3. **리뷰** — `oh-my-claudecode:code-reviewer` || `pr-review-toolkit:silent-failure-hunter` (cron silent drop 위험) — parallel
4. **정착률 측정** — `oh-my-claudecode:scientist` (1/3/7/14 회독별 retention 분포, 첫 7일 후)
5. **게이트** — `arch-guard:pre-commit` + `security-check:security-check` (RLS 정책 검증)

### 3.4 hook 지점
- P4 sub-plan §전체 (스케줄링 코어)
- P6 sub-plan §Play (리뷰 풀이 UI)

### 3.5 위험 / 완화
- **fail mode**: cron drift / 알림 silent drop → `silent-failure-hunter` 자동 점검 + Supabase log 강제 fsync
- **plan B**: cron 실패 시 **client-side fallback** (학생 접속 시 due 체크 후 즉시 큐 표시)

---

## §4. UI 리서치 — 듀오링고 follow-up mini-workflow

> ⚠️ **DEPRECATED (v1.2)**: 본 §은 `docs/superpowers/specs/2026-05-18-ui-master-design.md` v1.0 §3으로 흡수 이관됨. 본 §은 history 보존용으로만 유지. 신규 작업은 UI master spec §3 참조.

### 4.1 진입 트리거
**P0 킥오프 직전 또는 P0 Day 0-1과 병행** (v1.0의 "P5 1주 전 one-shot"에서 앞당김 — P0가 Day 1에 `tokens.css` SSoT를 잠그므로). P0 Day 1 토큰 잠금 **직전**까지 reference deck + 디자인 토큰 lock PR 완료 **필수**.

> ⚠️ **결정적 타이밍**: P0 Day 1 토큰 잠금이 시간 데드라인. UI 리서치가 늦으면 P0 Day 7 `design-review` 70점 게이트 + P5 진입 두 곳 모두 위협받는다.

### 4.2 산출물
- `docs/ui-research/2026-MM-DD-duolingo-followup-deck.md` (MM-DD는 리서치 시작일에 확정)
  - reference 5개 deep-dive: **듀오링고 (anchor) + 헤이바이브 + 클래스101 + Brilliant + Memrise**
- **디자인 토큰 lock PR** (`tailwind.config.ts`, `tokens.css`) — Mike 직접 머지
- **패턴 catalog**: Streak / XP / Heart / 리뷰카드 / 오답복기 5패턴 × (우리 차용 여부 + 근거)

### 4.3 디스패치 순서
1. **reference 수집** — `oh-my-claudecode:external-context` || `oh-my-claudecode:document-specialist` — parallel
2. **3-model 통찰** — `oh-my-claudecode:ccg` (Claude + Codex + Gemini 시각 비교, 1회)
3. **디자인 합성** — `oh-my-claudecode:designer` (Sonnet, UI 패턴 합성)
4. **토큰 정렬 점검** — `design-system:design-system` skill (우리 컬러/radius와 reference 정렬 가능성)
5. **게이트** — `design-system:design-review` dry-run + Mike 최종 OK → 토큰 PR 머지

### 4.4 hook 지점
- P5 sub-plan §0 (진입 전 단계)
- `CLAUDE.md §2` 잠긴 결정사항 **갱신**: reference 4개(헤이바이브/클래스101/Brilliant/Memrise) 추가 명시, "토스 차용 X" 유지

### 4.5 위험 / 완화
- **fail mode**: reference 너무 많아 토큰 분산 → 듀오링고 anchor **60% 가중** + follow-up 4앱 각 10%
- **plan B**: 1주 안 못 끝내면 reference **5개 → 3개** 축소 + 2일차 어림 lock → P5 시작 강행

---

## §5. 통합 게이트

| 게이트 | 트리거 | 도구 | 미달 시 |
|---|---|---|---|
| **P3 정확도 ≥ 90%** | 문제 평가 구현 후 | `qa-tester` eval suite | manual 폴백 활성 + **P4 진입 보류** |
| **회독 retention 측정** | 문제 리뷰 첫 7일 후 | `scientist` 분석 리포트 | 알고리즘 파라미터 튜닝 (interval step 조정) |
| **UI 토큰 lock PR 머지** | UI 리서치 종료 시 | `design-review` dry-run + Mike OK | **P5 구현 시작 보류** |

---

## §6. `agent-tracks.md §3.2` 매트릭스 보강 (spec 승인 후 별도 PR)

기존 매트릭스를 폐기하지 않고 다음 행만 보강:

- **P3** 행 "리뷰 / QA" 칸에 **`scientist`** 추가 (정확도 분포 분석)
- **P4** 행 "리뷰 / QA" 칸에 **`scientist` + `silent-failure-hunter`** 추가
- **P5** 행 "진입 시 (요구 발굴)" 칸에 **`external-context` + `ccg` + `document-specialist`** 추가
- **P5** 행 메모 박기: *"UI 리서치는 P0 킥오프 직전/병행으로 앞당겨짐 (v1.1)"*
- **P0** 행 **신설** (현재 §3.2 매트릭스에 없음):
  - 진입 시 = `superpowers:brainstorming` + UI 리서치 mini-workflow 병행
  - 설계 = `feature-dev:code-architect` + `oh-my-claudecode:designer`
  - 구현 = `oh-my-claudecode:executor` (mock-first FSD 2.1 + shadcn 9종)
  - 디자인 = `design-system:design-system` 가이드 + `design-system:design-review` (Day 7 gate ≥ 70)
  - 리뷰 / QA = `oh-my-claudecode:qa-tester` (Playwright E2E) + `pr-review-toolkit:silent-failure-hunter`
  - 커밋 게이트 = `arch-guard:pre-commit` + `pnpm lint:tokens` + `check-no-dark`

이 보강 PR은 spec 승인 → writing-plans → 첫 implementation milestone과 함께 묶거나, 메타 단독 PR로 분리. 결정은 writing-plans 단계에서.

---

## §7. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-18** | **brainstorming 산출 초안. 3개 도메인 mini-workflow + 통합 게이트 + §3.2 보강 항목.** |
| **v1.1** | **2026-05-18** | **P0 sub-plan(`2fc1821`) 신규 발견 반영. §4.1 UI 리서치 트리거를 "P5 1주 전" → "P0 킥오프 직전/병행"으로 앞당김. §2.3 / §3.2에 P0 contract 정합 단서. §6에 P0 행 신설.** |
| **v1.2** | **2026-05-18** | **§4 UI 리서치 mini-workflow를 `ui-master-design.md` v1.0 §3으로 흡수 이관 + deprecate 마킹. 본 §은 history 보존용으로만 유지.** |

---

> **다음 단계**: Mike 검토 → `superpowers:writing-plans` 스킬로 implementation plan 작성.
