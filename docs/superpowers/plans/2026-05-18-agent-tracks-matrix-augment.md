# Agent Tracks §3.2 Matrix Augment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `docs/agent-strategy/2026-05-14-agent-tracks.md` §3.2 P별 디스패치 매트릭스를 보강한다. P0 행 신설 + P3/P4/P5 기존 행 보강 + P5 메모 갱신 + 변경 이력 entry.

**Architecture:** 단일 문서 편집 plan. Markdown 표 1곳(§3.2)과 변경 이력(§7) 2곳 수정. 코드 변경 없음, 테스트 무관, 게이트는 grep verification + git diff 시각 점검만.

**Tech Stack:** Markdown · `grep` · `Edit` tool · `git diff` · git commit/push.

**Source spec:** `docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md` v1.1 §6.

---

## 0. 산출물 게이트 (모두 통과 시 PR 머지 가능)

- [ ] §3.2 매트릭스 P0 행 1개 신설 (7 cells)
- [ ] P3 행 "리뷰 / QA" 칸에 `scientist` 추가
- [ ] P4 행 "리뷰 / QA" 칸에 `scientist` + `silent-failure-hunter` 추가
- [ ] P5 행 "진입 시" 칸에 `external-context` + `ccg` + `document-specialist` 추가
- [ ] P5 행 아래 메모 1줄 추가: *"UI 리서치는 P0 킥오프 직전/병행으로 앞당겨짐 (v1.1 spec)"*
- [ ] §7 변경 이력에 v1.1 entry 추가
- [ ] `git diff docs/agent-strategy/2026-05-14-agent-tracks.md` 결과가 5곳만 변경되었음을 시각 확인
- [ ] commit (단일) + push (Mike OK 후)

---

## 1. File Structure (변경 파일)

- Modify: `docs/agent-strategy/2026-05-14-agent-tracks.md`
  - §3.2 매트릭스 행 (현재 lines ~194-208, 실제 line 번호는 Task 1 step 1에서 grep 확인)
  - §7 변경 이력 표 (파일 끝, 현재 lines ~388 부근)

신규 파일 없음. 코드 변경 없음.

---

## 2. Tasks

### Task 1: 매트릭스 영역의 정확한 위치 grep으로 확인

**Files:**
- Read: `docs/agent-strategy/2026-05-14-agent-tracks.md`

- [ ] **Step 1: 매트릭스 표 영역 line 번호 확인**

Run:
```bash
grep -n "P5 Home/Quest UI\|P3 AI Pipeline\|P4 Scheduling\|P별 디스패치 매트릭스\|변경 이력" docs/agent-strategy/2026-05-14-agent-tracks.md
```

Expected: 5-6개 line 번호 출력. `P별 디스패치 매트릭스` 헤더와 P3/P4/P5 행 line 번호 메모할 것 (Task 2-5에서 사용).

- [ ] **Step 2: §7 변경 이력 마지막 entry 확인**

Run:
```bash
sed -n '385,395p' docs/agent-strategy/2026-05-14-agent-tracks.md
```

Expected: `| v1.0 | 2026-05-14 | 초안 ... |` 같은 마지막 row. v1.1 entry를 그 뒤에 추가할 형식 파악.

- [ ] **Step 3: 진행 메모 작성**

이후 Task에서 `old_string`을 정확히 매칭하기 위해 Step 1-2에서 본 텍스트 그대로 메모. 공백/이모지(`⚠️`) 한 글자도 다르면 Edit 실패.

---

### Task 2: P3 행 "리뷰 / QA" 칸에 `scientist` 추가

**Files:**
- Modify: `docs/agent-strategy/2026-05-14-agent-tracks.md` (§3.2 P3 행)

- [ ] **Step 1: 정확한 old_string 확인**

P3 행 원문은 (Task 1에서 확인):
```
| **P3 AI Pipeline** ⚠️ | brainstorming | vercel:ai-architect | executor + ai-architect | (skip, BE 중심) | qa-tester + verifier (정확도 측정) + critic | qa-tester gate (≥90%) |
```

- [ ] **Step 2: Edit으로 "리뷰 / QA" 칸 변경**

`Edit` tool 호출:
- `file_path`: `/Users/mike/Downloads/soongong/docs/agent-strategy/2026-05-14-agent-tracks.md`
- `old_string`: `qa-tester + verifier (정확도 측정) + critic |`
- `new_string`: `qa-tester + verifier (정확도 측정) + critic + scientist (분포 분석) |`

> 주의: `|` (파이프)까지 포함해서 unique 매칭 보장. P3 행 외 다른 곳에 같은 문자열 없는지 grep으로 사전 확인:
> ```bash
> grep -c "verifier (정확도 측정) + critic" docs/agent-strategy/2026-05-14-agent-tracks.md
> ```
> Expected: `1`

- [ ] **Step 3: 변경 verify**

Run: `git diff docs/agent-strategy/2026-05-14-agent-tracks.md`
Expected: P3 행 한 줄만 변경. `+...scientist (분포 분석)...` 보임.

---

### Task 3: P4 행 "리뷰 / QA" 칸에 `scientist` + `silent-failure-hunter` 추가

**Files:**
- Modify: `docs/agent-strategy/2026-05-14-agent-tracks.md` (§3.2 P4 행)

- [ ] **Step 1: 정확한 old_string 확인**

P4 행 원문 (Task 1 확인):
```
| **P4 Scheduling** | (skip) | code-architect | executor | (skip) | code-reviewer | arch-guard |
```

- [ ] **Step 2: Edit**

- `old_string`: `| executor | (skip) | code-reviewer | arch-guard |`
- `new_string`: `| executor | (skip) | code-reviewer + scientist (retention 분석) + silent-failure-hunter (cron silent drop) | arch-guard |`

> grep uniqueness 사전 확인:
> ```bash
> grep -c "| executor | (skip) | code-reviewer | arch-guard |" docs/agent-strategy/2026-05-14-agent-tracks.md
> ```
> Expected: `1`

- [ ] **Step 3: verify**

Run: `git diff docs/agent-strategy/2026-05-14-agent-tracks.md`
Expected: P4 행 한 줄 추가 변경. 누적 2 행 변경.

---

### Task 4: P5 행 "진입 시" 칸 보강 + 메모 추가

**Files:**
- Modify: `docs/agent-strategy/2026-05-14-agent-tracks.md` (§3.2 P5 행 + 메모 줄)

- [ ] **Step 1: 정확한 old_string 확인**

P5 행 원문:
```
| **P5 Home/Quest UI** | brainstorming | designer | executor | design-system 가이드 참조 + design-review 점수제 | react-best-practices + design-review | design-review ≥ 70점 |
```

- [ ] **Step 2: Edit으로 "진입 시" 칸 변경**

- `old_string`: `| **P5 Home/Quest UI** | brainstorming | designer |`
- `new_string`: `| **P5 Home/Quest UI** | brainstorming + external-context + ccg + document-specialist | designer |`

> grep uniqueness 확인:
> ```bash
> grep -c "P5 Home/Quest UI" docs/agent-strategy/2026-05-14-agent-tracks.md
> ```
> Expected: `1`

- [ ] **Step 3: 메모 줄 추가**

매트릭스 표 바로 다음 줄(또는 "**공통 wrapper**:" 줄 직전)에 한 줄 추가.

`Edit` tool:
- `old_string`: `**공통 wrapper**: 모든 P 진입 전 \`superpowers:writing-plans\``
- `new_string`: `> *Note (v1.1 spec 반영):* P5의 UI 리서치 mini-workflow는 P0 킥오프 직전/병행으로 앞당겨짐. P0 Day 1 \`tokens.css\` 잠금이 데드라인.\n\n**공통 wrapper**: 모든 P 진입 전 \`superpowers:writing-plans\``

> 주의: `\n\n`은 Edit tool에서 실제 줄바꿈 2개. 정확한 텍스트는 Task 1 step 1에서 본 원문 그대로 매칭.

- [ ] **Step 4: verify**

Run: `git diff docs/agent-strategy/2026-05-14-agent-tracks.md`
Expected: P5 행 변경 + 메모 1줄 추가. 누적 P3/P4/P5 행 + 메모 1줄.

---

### Task 5: P0 행 신설 (P1 위 또는 매트릭스 첫 행)

**Files:**
- Modify: `docs/agent-strategy/2026-05-14-agent-tracks.md` (§3.2 표 첫 데이터 행 위)

- [ ] **Step 1: 정확한 old_string 확인**

매트릭스 첫 행(P1 Foundation)을 anchor로 잡는다. 원문:
```
| **P1 Foundation** | brainstorming | architect → code-architect | executor | design-system + design-review | code-reviewer | arch-guard:pre-commit |
```

- [ ] **Step 2: Edit으로 P0 행을 P1 위에 삽입**

- `old_string`: `| **P1 Foundation** | brainstorming | architect → code-architect | executor | design-system + design-review | code-reviewer | arch-guard:pre-commit |`
- `new_string`:
```
| **P0 Demo Skeleton** ⚡ | brainstorming + UI 리서치 mini-workflow 병행 | code-architect + designer | executor (mock-first FSD 2.1 + shadcn 9종) | design-system 가이드 + design-review (Day 7 gate ≥ 70) | qa-tester (Playwright E2E) + silent-failure-hunter | arch-guard:pre-commit + pnpm lint:tokens + check-no-dark |
| **P1 Foundation** | brainstorming | architect → code-architect | executor | design-system + design-review | code-reviewer | arch-guard:pre-commit |
```

> P0는 P1 직전에 삽입. 매트릭스가 P-번호 순서로 자연스럽게 정렬됨. `⚡` 이모지는 "와꾸 우선 / mock-first 트랙" 시각 표지.

- [ ] **Step 3: verify**

Run: `git diff docs/agent-strategy/2026-05-14-agent-tracks.md`
Expected: P0 행 1개 추가. 누적 P3/P4/P5 행 + 메모 1줄 + P0 행.

매트릭스 표 view 확인 (정렬 깨짐 없는지):
```bash
grep -A 12 "P별 디스패치 매트릭스" docs/agent-strategy/2026-05-14-agent-tracks.md | head -15
```
Expected: P0 → P1 → P2 → ... → P8 순서로 9개 데이터 행.

---

### Task 6: §7 변경 이력에 v1.1 entry 추가 + commit

**Files:**
- Modify: `docs/agent-strategy/2026-05-14-agent-tracks.md` (§7)

- [ ] **Step 1: 마지막 entry 확인 (Task 1 step 2 결과 사용)**

가정: 마지막 row는 `| **v1.0** | **2026-05-14** | **초안 ...** |` 형태.

- [ ] **Step 2: Edit으로 v1.1 entry 추가**

- `old_string`: `| **v1.0** | **2026-05-14** | **초안. 16+50 Agent 듀얼 트랙 + P별 디스패치 매트릭스 + 하네스 셋업.** |`
  (실제 텍스트는 Task 1 step 2에서 확인한 원문 사용)
- `new_string`:
```
| **v1.0** | **2026-05-14** | **초안. 16+50 Agent 듀얼 트랙 + P별 디스패치 매트릭스 + 하네스 셋업.** |
| **v1.1** | **2026-05-18** | **§3.2 매트릭스 보강 — P0 행 신설, P3/P4 리뷰/QA에 scientist 추가, P4에 silent-failure-hunter 추가, P5 진입 시에 external-context + ccg + document-specialist 추가, P5 메모 갱신. Source: `docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md` v1.1 §6.** |
```

- [ ] **Step 3: 전체 diff 최종 verify**

Run: `git diff --stat docs/agent-strategy/2026-05-14-agent-tracks.md`
Expected: `1 file changed, ~7 insertions(+), ~3 deletions(-)` 범위.

Run: `git diff docs/agent-strategy/2026-05-14-agent-tracks.md`
Expected: 5곳 변경 (P0 행 신설, P3/P4/P5 행 보강, P5 메모, v1.1 변경이력). 다른 변경 없음.

- [ ] **Step 4: commit**

Run:
```bash
git add docs/agent-strategy/2026-05-14-agent-tracks.md && \
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" commit -m "$(cat <<'EOF'
docs(agent-tracks): §3.2 매트릭스 v1.1 — P0 행 신설 + P3/P4/P5 보강

- P0 Demo Skeleton 행 신설 (mock-first 와꾸 우선 트랙)
- P3: 리뷰/QA에 scientist 추가 (정확도 분포 분석)
- P4: 리뷰/QA에 scientist + silent-failure-hunter 추가
- P5: 진입 시에 external-context + ccg + document-specialist 추가
- P5 메모: UI 리서치 P0 킥오프 직전/병행으로 앞당김 명시
- Source: specs/2026-05-18-eval-review-ui-research-design.md v1.1 §6

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: 성공 메시지 (commit SHA + "1 file changed").

- [ ] **Step 5: push (Mike OK 후만)**

Run (Mike 명시 OK 받은 후):
```bash
git push
```

Expected: `... main -> main` fast-forward.

---

## 3. Plan 종료 조건

§0 산출물 게이트 8개 모두 체크 + git history에 단일 commit 1개 (origin/main fast-forward 완료).

이 plan 종료 후 다음 액션은 **별개 흐름**:
- Mike가 "P0 실행 시작" 지시 시 → `superpowers:subagent-driven-development`로 `docs/superpowers/plans/2026-05-18-soongong-mvp1-p0-demo-skeleton.md` 진입
- 또는 휴식

---

## 4. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| v1.0 | 2026-05-18 | 초안. spec v1.1 §6을 implementable 6 task로 분해. |
