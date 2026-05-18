# UI Master Spec 후속 — Deprecate 처리 + Research Deck Stub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended for clean isolation) or `superpowers:executing-plans` (recommended for this plan — mechanical doc edits). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** UI master spec v1.0 머지 가능 상태로 가기 위해 §8 deprecate 4건 처리 + §3 retroactive 리서치 deck skeleton 1건 생성. 실제 5앱 deep-dive 채우기는 본 plan 범위 밖(별도 흐름).

**Architecture:** 단일 PR에 5 파일 변경 + 1 신규 파일. 코드 변경 0, 모두 문서 편집. 본 plan은 deprecate 위생 + deck placeholder만 책임. 5앱 deep-dive 컨텐츠 채우기는 plan 종료 후 별도 dispatch.

**Tech Stack:** Markdown · `Edit` tool · `Write` tool · `git` · `gh pr` · `sed`/`grep` (검증).

**Source spec:** `docs/superpowers/specs/2026-05-18-ui-master-design.md` v1.0 §8 + §3.

---

## 0. 산출물 게이트 (모두 통과 시 PR 머지 가능)

- [ ] `docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md` v1.1 → v1.2 (§4 첫 줄에 deprecate 표시 + §9 v1.2 entry)
- [ ] `docs/visual-assets/2026-05-18-character-design-agent.md` 240줄 → ~30줄 stub (상단 DEPRECATED 마킹 + UI master §4 링크 + 진행 마일스톤 표만 유지)
- [ ] `CLAUDE.md` §5 핵심 문서 경로에 UI master spec 추가 + 캐릭터 SSoT 옆 `DEPRECATED` 표시 + §9 v1.2 entry
- [ ] `docs/agent-strategy/2026-05-14-agent-tracks.md` §11 cross-link에 UI master 추가(있으면) + §12 v1.3 entry
- [ ] `docs/ui-research/2026-05-18-duolingo-followup-deck.md` skeleton 생성 (5앱 + 5패턴 placeholder 표, 컨텐츠는 빈 상태)
- [ ] `git diff --stat` 결과 5-6 파일 변경 (예상 +60/-220 line)
- [ ] 단일 commit + push + PR #1 추가 갱신
- [ ] PR 본문에 "deprecate 처리 완료" comment 추가

---

## 1. File Structure (변경 파일 매핑)

- **Modify:** `docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md`
  - §4 첫 줄: deprecate 안내 한 줄 추가
  - §9 변경 이력: v1.2 entry 추가
- **Modify (대규모 축소):** `docs/visual-assets/2026-05-18-character-design-agent.md`
  - 240줄 → ~30줄 stub (Write로 통째 교체)
- **Modify:** `CLAUDE.md`
  - §5 핵심 문서 경로 트리 업데이트
  - §9 변경 이력 v1.2 entry
- **Modify:** `docs/agent-strategy/2026-05-14-agent-tracks.md`
  - §11 (cross-link 섹션, 존재 시) UI master 링크 추가
  - §7 변경 이력 v1.3 entry
- **Create:** `docs/ui-research/2026-05-18-duolingo-followup-deck.md`
  - skeleton만 (placeholder 5앱 + 5패턴 표, 컨텐츠 ""로 비움)

코드 변경 없음. test 없음.

---

## 2. Tasks

### Task 0: 사전 점검 — agent-tracks.md §11 존재 확인 + worktree 상태

**Files:** Read only.

- [ ] **Step 1: agent-tracks.md §11 존재 여부 grep**

Run:
```bash
grep -n "^## 11\." docs/agent-strategy/2026-05-14-agent-tracks.md
```
Expected: 한 줄 매치 또는 "no match".
- 매치 → Task 4에서 §11 cross-link 갱신 + §12 v1.3 entry
- no match → Task 4에서 §11 신설 또는 skip하고 §7 변경이력만 v1.3 entry. (참고: 직전 v1.2 commit에서 §12 변경 이력 entry 추가했음 — 현재 §7이 변경이력일 가능성 높음, 본 grep 결과로 확정)

- [ ] **Step 2: worktree 상태 확인 (uncommitted 없어야 함)**

Run:
```bash
pwd && git status --short
```
Expected: `pwd`가 `.../worktrees/agent-tracks-matrix-augment`, status는 empty.

- [ ] **Step 3: docs/ui-research/ 디렉터리 존재 확인 + 없으면 생성**

Run:
```bash
mkdir -p docs/ui-research && ls -d docs/ui-research/
```
Expected: `docs/ui-research/` 출력.

---

### Task 1: spec v1.1 → v1.2 bump (§4 deprecate)

**Files:**
- Modify: `docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md`

- [ ] **Step 1: §4 첫 줄 deprecate 안내 추가**

`Edit` tool:
- `file_path`: `/Users/mike/Downloads/soongong/.claude/worktrees/agent-tracks-matrix-augment/docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md`
- `old_string`: `## §4. UI 리서치 — 듀오링고 follow-up mini-workflow`
- `new_string`:
```
## §4. UI 리서치 — 듀오링고 follow-up mini-workflow

> ⚠️ **DEPRECATED (v1.2)**: 본 §은 `docs/superpowers/specs/2026-05-18-ui-master-design.md` v1.0 §3으로 흡수 이관됨. 본 §은 history 보존용으로만 유지. 신규 작업은 UI master spec §3 참조.
```

> 주의: 이미 첫 줄이 `## §4.` 헤더 단독이면 위 `new_string`이 헤더 + deprecate 박스 형태로 추가됨. grep으로 unique 매칭 사전 확인:
> ```bash
> grep -c "## §4. UI 리서치 — 듀오링고 follow-up mini-workflow" docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md
> ```
> Expected: `1`

- [ ] **Step 2: §9 변경 이력에 v1.2 entry 추가**

`Edit` tool:
- `old_string`:
```
| **v1.1** | **2026-05-18** | **P0 sub-plan(`2fc1821`) 신규 발견 반영. §4.1 UI 리서치 트리거를 "P5 1주 전" → "P0 킥오프 직전/병행"으로 앞당김. §2.3 / §3.2에 P0 contract 정합 단서. §6에 P0 행 신설.** |
```
- `new_string`:
```
| **v1.1** | **2026-05-18** | **P0 sub-plan(`2fc1821`) 신규 발견 반영. §4.1 UI 리서치 트리거를 "P5 1주 전" → "P0 킥오프 직전/병행"으로 앞당김. §2.3 / §3.2에 P0 contract 정합 단서. §6에 P0 행 신설.** |
| **v1.2** | **2026-05-18** | **§4 UI 리서치 mini-workflow를 `ui-master-design.md` v1.0 §3으로 흡수 이관 + deprecate 마킹. 본 §은 history 보존용으로만 유지.** |
```

- [ ] **Step 3: diff verify**

Run:
```bash
git diff docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md | head -30
```
Expected: §4 헤더 다음에 DEPRECATED 박스 1줄 + 변경 이력 v1.2 row 1줄. 총 2곳 변경.

---

### Task 2: 캐릭터 SSoT 240줄 → 30줄 stub

**Files:**
- Modify: `docs/visual-assets/2026-05-18-character-design-agent.md` (Write로 통째 교체)

- [ ] **Step 1: 기존 §8 진행 마일스톤 표 정확한 텍스트 확인 (stub에 보존)**

Run:
```bash
sed -n '177,189p' docs/visual-assets/2026-05-18-character-design-agent.md
```
Expected: `## 8. 진행 현황 & 마일스톤` 헤더 + 표 5 row (v0.1 ✅ ~ v1.0 대기). 이 표를 stub에 그대로 옮김.

- [ ] **Step 2: Write tool로 240줄 → ~30줄 stub 통째 교체**

`Write` tool:
- `file_path`: `/Users/mike/Downloads/soongong/.claude/worktrees/agent-tracks-matrix-augment/docs/visual-assets/2026-05-18-character-design-agent.md`
- `content`:
```markdown
# 순공이 캐릭터 디자인 에이전트 — DEPRECATED

> ⚠️ **DEPRECATED (2026-05-18)**: 본 SSoT 240줄 전체는 `docs/superpowers/specs/2026-05-18-ui-master-design.md` v1.0 **§4**로 흡수 이관됨. 신규 작업은 UI master spec §4 참조.
>
> **본 stub의 역할:** 진행 마일스톤 표만 history 보존 + UI master 진입점 링크.

---

## 신규 진입점

- **워크플로우 / 잠긴 결정 / 절대 금지 / 품질 체크리스트** → [`ui-master-design.md §4`](../superpowers/specs/2026-05-18-ui-master-design.md#§4-마스코트캐릭터-production-워크플로우-캐릭터-ssot-흡수-)
- **트리거 문구 (Mike → Claude)**: "캐릭터 디자인 에이전트", "캐릭터 에이전트", "마스코트 작업", "순공이 디자인", "마스코트 v0.x" → UI master spec §4 자동 read

---

## 진행 마일스톤 (보존)

| 마일스톤 | 상태 | 일자 | 산출물 |
|---|---|---|---|
| **v0.1** 입수 자산 등재 | ✅ 완료 | 2026-05-18 | `mascot-v0.1/main.png` + `repeat_normal.png` |
| **v0.2** GPT-4o 표정 5종 생성 | ⏳ Mike 진행 예정 | - | `mascot-v0.2/soongong-{celebrate,think,comfort,sleep,surprise}.png` |
| **v0.3** 투명화 + 5단 다운스케일 | 대기 (v0.2 의존) | - | 7 슬롯 × 5 사이즈 = 35장 |
| **v0.4** `apps/web/public/mascot/` 배포 | 대기 (v0.3 의존) | - | Next.js Image 매핑 |
| **v1.0** P5 sub-plan `mascot.tsx` 완전 매핑 | 대기 (P5 진입 후) | - | 모든 placeholder 제거 |

마일스톤 갱신은 본 stub에 직접 commit (UI master spec §4.9도 동기 갱신).

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-18** | 초안 240줄. 정체성 / 잠긴 결정 11 / 금지 7 / GPT-4o 워크플로우 / 산출 명세 / 품질 체크 9 / 투명화 슬롯 7 / 진행 마일스톤 / 팔로업 프로토콜. |
| **DEPRECATED** | **2026-05-18** | UI master spec §4로 흡수. 본 파일은 마일스톤 표만 보존하는 stub로 축소 (240줄 → ~30줄). |
```

- [ ] **Step 3: stub size verify**

Run:
```bash
wc -l docs/visual-assets/2026-05-18-character-design-agent.md
```
Expected: 30-40줄 범위.

- [ ] **Step 4: diff verify (대규모 deletion 확인)**

Run:
```bash
git diff --stat docs/visual-assets/2026-05-18-character-design-agent.md
```
Expected: `~210 deletions, ~30 insertions` 정도.

---

### Task 3: CLAUDE.md §5 경로 갱신 + §9 v1.2 entry

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 현재 §5 트리 + §9 마지막 entry 확인**

Run:
```bash
grep -n "^## 5\.\|^## 9\." CLAUDE.md && sed -n '69,84p' CLAUDE.md && echo "---" && sed -n '128,135p' CLAUDE.md
```
Expected: §5와 §9 line 번호 + 현재 트리/변경이력 형태 확인.

- [ ] **Step 2: §5 트리에 UI master spec 추가 + 캐릭터 SSoT 옆 DEPRECATED 표시**

`Edit` tool:
- `old_string`:
```
├── visual-assets/2026-05-18-character-design-agent.md  ← 순공이 캐릭터 디자인 에이전트 SSoT
```
- `new_string`:
```
├── visual-assets/2026-05-18-character-design-agent.md  ← DEPRECATED, ui-master §4로 이관 (stub만 유지)
├── superpowers/specs/2026-05-18-ui-master-design.md  ← UI master SSoT (디자인 시스템 + 캐릭터 production + 에이전트 dispatch + 리서치 + 모션 + 6게이트)
```

> 만약 grep 결과 위 line이 정확히 매칭 안 되면 (포맷 변경 가능성), Task 3 Step 1의 sed 출력으로 정확한 텍스트 확인 후 그대로 사용.

- [ ] **Step 3: §9 변경 이력에 v1.2 entry 추가**

`Edit` tool:
- `old_string`: (Task 3 Step 1에서 확인한 마지막 entry — 예시)
```
| **v1.1** | **2026-05-18** | **§5 핵심 문서 경로 트리에 캐릭터 디자인 에이전트 SSoT(`2026-05-18-character-design-agent.md`) + 마스코트 v0.1 작업본 폴더 추가. 인벤토리 주석 Midjourney → GPT-4o 갱신.** |
```
- `new_string`:
```
| **v1.1** | **2026-05-18** | **§5 핵심 문서 경로 트리에 캐릭터 디자인 에이전트 SSoT(`2026-05-18-character-design-agent.md`) + 마스코트 v0.1 작업본 폴더 추가. 인벤토리 주석 Midjourney → GPT-4o 갱신.** |
| **v1.2** | **2026-05-18** | **§5에 UI master spec(`superpowers/specs/2026-05-18-ui-master-design.md`) 추가. 캐릭터 SSoT는 DEPRECATED 표시(ui-master §4로 흡수, stub만 유지).** |
```

- [ ] **Step 4: diff verify**

Run:
```bash
git diff CLAUDE.md
```
Expected: §5에 UI master 라인 1개 추가 + 캐릭터 SSoT 라인 DEPRECATED 표시 + §9 v1.2 row 1개.

---

### Task 4: agent-tracks.md §11 cross-link + §7 변경 이력 v1.3 entry

**Files:**
- Modify: `docs/agent-strategy/2026-05-14-agent-tracks.md`

- [ ] **Step 1: §11 존재 확인 + 변경이력 헤더 확인 (Task 0 Step 1 결과 사용)**

만약 §11 매치 있으면 Step 2 진행. 없으면 Step 2 skip하고 Step 3로.

- [ ] **Step 2: §11 cross-link에 UI master 링크 추가 (조건부)**

§11이 존재한다면 `Edit`:
- `old_string`: (sed로 §11 영역 확인 후 마지막 항목 1줄)
- `new_string`: 마지막 항목 + `\n- **`docs/superpowers/specs/2026-05-18-ui-master-design.md`** — UI master SSoT (디자인 + 캐릭터 + 에이전트 dispatch + 리서치 + 모션 + 6게이트)`

> 정확한 텍스트는 sed -n '226,236p' 결과로 확정 (인접 트랙 cross-link 영역).

- [ ] **Step 3: 변경 이력에 v1.3 entry 추가**

§7 변경 이력 마지막 entry는 (직전 commit에서 추가한) v1.2:
```
| **v1.2** | **2026-05-18** | **§3.2 매트릭스 보강 — P0 행 신설, P3/P4 리뷰/QA에 scientist 추가, P4에 silent-failure-hunter 추가, P5 진입 시에 external-context + ccg + document-specialist 추가, P5 매트릭스 아래 메모 1줄. Source: `docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md` v1.1 §6.** |
```

`Edit`:
- `old_string`: 위 v1.2 entry 한 줄
- `new_string`:
```
| **v1.2** | **2026-05-18** | **§3.2 매트릭스 보강 — P0 행 신설, P3/P4 리뷰/QA에 scientist 추가, P4에 silent-failure-hunter 추가, P5 진입 시에 external-context + ccg + document-specialist 추가, P5 매트릭스 아래 메모 1줄. Source: `docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md` v1.1 §6.** |
| **v1.3** | **2026-05-18** | **§11 cross-link 갱신 — UI master spec(`docs/superpowers/specs/2026-05-18-ui-master-design.md`) 추가. UI+캐릭터 dispatch matrix가 본 문서 §3.2 위 cross-cut layer로 작용.** |
```

- [ ] **Step 4: diff verify**

Run:
```bash
git diff docs/agent-strategy/2026-05-14-agent-tracks.md
```
Expected: §11에 UI master 링크 추가(있는 경우) + §7 v1.3 row 1개.

---

### Task 5: 리서치 deck skeleton 생성

**Files:**
- Create: `docs/ui-research/2026-05-18-duolingo-followup-deck.md`

- [ ] **Step 1: Write로 placeholder skeleton 파일 생성**

`Write` tool:
- `file_path`: `/Users/mike/Downloads/soongong/.claude/worktrees/agent-tracks-matrix-augment/docs/ui-research/2026-05-18-duolingo-followup-deck.md`
- `content`:
```markdown
# Duolingo Follow-up 5앱 Deep-Dive Deck (Skeleton)

> **상태:** Skeleton — 컨텐츠 비어 있음.
> **다음 액션:** UI master spec §3.5 dispatch 순서대로 5앱 deep-dive 컨텐츠 채우기.
> **Source spec:** `docs/superpowers/specs/2026-05-18-ui-master-design.md` v1.0 §3.

---

## 0. 메타

| 항목 | 값 |
|---|---|
| 작성일 | 2026-05-18 (skeleton) |
| 컨텐츠 채움 예정일 | TBD (Mike + Claude 별도 dispatch 후) |
| 가중 anchor | 듀오링고 60% |
| Retroactive 여부 | YES (P0 Day 1-2 이미 진행 중, 사후 정합 점검 모드) |

---

## 1. 5앱 deep-dive

### 1.1 Duolingo (anchor, 가중 60%)

| 영역 | 관찰 | 우리 차용 여부 | 근거 |
|---|---|---|---|
| 스트릭 | _empty_ | _empty_ | _empty_ |
| XP | _empty_ | _empty_ | _empty_ |
| HP (Hearts) | _empty_ | _empty_ | _empty_ |
| 마스코트 (Duo) | _empty_ | _empty_ | _empty_ |
| 매일 3개 루프 | _empty_ | _empty_ | _empty_ |
| 그린 톤 컬러 시스템 | _empty_ | _empty_ | _empty_ |

### 1.2 카카오 헤이바이브 (가중 10%)

| 영역 | 관찰 | 우리 차용 여부 | 근거 |
|---|---|---|---|
| 친근 마스코트 | _empty_ | _empty_ | _empty_ |
| 라이트 그린 톤 | _empty_ | _empty_ | _empty_ |

### 1.3 클래스101 (가중 10%)

| 영역 | 관찰 | 우리 차용 여부 | 근거 |
|---|---|---|---|
| 학습 카드 | _empty_ | _empty_ | _empty_ |
| 진도 시각화 | _empty_ | _empty_ | _empty_ |

### 1.4 Brilliant (가중 10%)

| 영역 | 관찰 | 우리 차용 여부 | 근거 |
|---|---|---|---|
| 인터랙티브 step UI | _empty_ | _empty_ | _empty_ |

### 1.5 Memrise (가중 10%)

| 영역 | 관찰 | 우리 차용 여부 | 근거 |
|---|---|---|---|
| Spaced repetition UI | _empty_ | _empty_ | _empty_ |

---

## 2. 5패턴 차용 결정 catalog

| 패턴 | 우리 차용? | 우리 변형 | 근거 |
|---|---|---|---|
| Streak | ✅ 100% (UI master spec §3.4 prefilled) | 그대로 | 매일 진입 동기, 듀오링고 핵심 |
| XP | ✅ 100% (prefilled) | 그대로 | 보상 시각화 |
| Heart (HP) | ✅ 변형 (prefilled) | 위협 X → 기억 HP, 그린 톤 | UI 설계.md §7-2 (붉은 하트 금지) |
| 리뷰 카드 | ✅ 100% (prefilled) | 그대로 | 회독퀘스트 카드 (UI 설계.md §7-1) |
| 오답 복기 V1-V5 | ✅ 변형 (prefilled) | Memrise + 우리 회독 변형 | 오답_회수_모드.md |

---

## 3. tokens.css 사후 정합 점검 (Retroactive)

P0 Day 1-2 이미 진행 완료. `apps/web/src/shared/styles/tokens.css`가 본 deck 컨텐츠 채워진 후 다음 4개 정합성 점검 대상:

- [ ] 메인 그린 hex가 듀오링고 그린과 의도적으로 유사하되 동일 X (legal safety)
- [ ] 위험도 3색이 채도 ≤ 60 소프트 톤 유지 (UI 설계.md §3)
- [ ] Pretendard 한글 폰트 로딩 적용
- [ ] radius / shadow 토큰이 시안 PNG와 정합

각 미달 시 보정 PR 발행.

---

## 4. Fallback

1주 안 5앱 deep-dive 못 끝내면 reference **5 → 3** (Duolingo + 카카오 헤이바이브 + 클래스101) 축소 + 2일 어림 lock → P5 진입 강행.

---

## 5. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v0.1-skeleton** | **2026-05-18** | 초안 skeleton. 5앱 / 5패턴 placeholder 표 + retroactive 점검 4항목. 컨텐츠는 빈 상태. |
```

- [ ] **Step 2: 파일 생성 확인**

Run:
```bash
wc -l docs/ui-research/2026-05-18-duolingo-followup-deck.md && head -5 docs/ui-research/2026-05-18-duolingo-followup-deck.md
```
Expected: ~80줄 + 첫 5줄에 skeleton 헤더.

---

### Task 6: commit + push + PR #1 갱신

**Files:** 모든 변경 (5 파일).

- [ ] **Step 1: git status 최종 확인**

Run:
```bash
git status --short
```
Expected: 4 modified + 1 new file:
- `M  docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md`
- `M  docs/visual-assets/2026-05-18-character-design-agent.md`
- `M  CLAUDE.md`
- `M  docs/agent-strategy/2026-05-14-agent-tracks.md`
- `?? docs/ui-research/2026-05-18-duolingo-followup-deck.md`

- [ ] **Step 2: git diff --stat 전체 확인**

Run:
```bash
git diff --stat HEAD
```
Expected: ~5 files, ~+100/-220 (캐릭터 SSoT 대규모 삭제 + nano 추가들).

- [ ] **Step 3: git add 명시적 5개**

Run:
```bash
git add \
  docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md \
  docs/visual-assets/2026-05-18-character-design-agent.md \
  CLAUDE.md \
  docs/agent-strategy/2026-05-14-agent-tracks.md \
  docs/ui-research/2026-05-18-duolingo-followup-deck.md
```

- [ ] **Step 4: commit (단일, -c 일회용 author)**

Run:
```bash
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" commit -m "$(cat <<'EOF'
docs(deprecate+deck): UI master spec §8 처리 4건 + §3 retroactive deck skeleton

- spec v1.1 → v1.2: §4 UI 리서치 deprecate 마킹 + 변경이력
- 캐릭터 SSoT 240줄 → ~30줄 stub (마일스톤 표 + 진입점 링크만 유지)
- CLAUDE.md §5: UI master spec 추가, 캐릭터 SSoT DEPRECATED 표시
- agent-tracks.md §11 + §7 v1.3: UI master cross-link
- docs/ui-research/2026-05-18-duolingo-followup-deck.md skeleton 신규 (5앱/5패턴 placeholder + retroactive 4항목)
- Source: ui-master-design.md v1.0 §8 + §3

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```
Expected: `[worktree-agent-tracks-matrix-augment <sha>] docs(deprecate+deck): ...` + `5 files changed, +X/-Y`.

- [ ] **Step 5: push to PR #1 branch**

Run:
```bash
git push
```
Expected: `<prev>..<new> worktree-agent-tracks-matrix-augment -> worktree-agent-tracks-matrix-augment` fast-forward.

- [ ] **Step 6: gh PR auth switch + comment 추가 + 복귀**

> 주의: gh CLI active 계정이 `treenod-mike`(회사)면 `gh auth switch -u mugungwhwa` 먼저 → comment 추가 → `gh auth switch -u treenod-mike` 복귀. (UI master spec과 동일한 계정 분리 패턴.)

Run:
```bash
gh auth switch -u mugungwhwa && \
gh pr comment 1 --body "deprecate 4건 처리 + 리서치 deck skeleton 신규. 본 PR 머지 후 별도 흐름으로 5앱 deep-dive 컨텐츠 채움 예정. (UI master spec v1.0 §8 + §3 완료)" && \
gh auth switch -u treenod-mike
```
Expected: comment URL 출력 + treenod-mike 복귀 확인.

---

## 3. 본 plan 종료 조건

§0 산출물 게이트 8개 모두 체크 + PR #1에 추가 commit + comment 1개.

이 plan 종료 후 다음 액션은 **별개 흐름**:
- **5앱 deep-dive 컨텐츠 채우기** — UI master spec §3.5 dispatch 순서 (`external-context` || `document-specialist` → `ccg` → `designer` → `design-system` → `design-review` → Mike OK). 30분-1시간 작업, 별도 plan 또는 subagent dispatch.
- **PR #1 Mike 리뷰 + 머지** — agent-tracks v1.2 + UI master spec v1.0 + 본 plan 산출물이 main으로 통합.
- **머지 후 캐릭터 v0.2 트리거** — Mike가 ChatGPT Plus + GPT-4o 세션 운영 → mood 5종 생성 (UI master spec §4.4).

---

## 4. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| v1.0 | 2026-05-18 | 초안. UI master spec §8 deprecate 4건 + §3 deck skeleton 1건 → 6 task. |
