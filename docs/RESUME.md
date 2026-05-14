# 순공대장 — 다음 세션 진입점 (RESUME)

> **이 문서를 먼저 읽으세요.** 5분 안에 현재 상태 + 다음 액션이 파악되도록 잠금.
> 작성일: 2026-05-14 / 마지막 commit: `5d3d331`

---

## 1. 현재 위치 (한 줄)

순공대장 MVP 1차의 **문서 트랙은 100% 완료**. 환경 결정 + 마스코트 자산 + agent 실행만 남음.

---

## 2. 핵심 컨텍스트 (잊었을 때 회상용)

| 항목 | 값 |
|---|---|
| 프로젝트 | 순공대장 — 수능생 듀오링고형 AI 회독 앱 |
| 트랙 | SparkClaw 1인 창업 |
| 마스코트 | **"순공이" (가안, 듀공 모티프)** — Midjourney+Canva 직접 작업 |
| UI 라벨 | 사용자 노출 = **"회독퀘스트"** / 백서 = "회독" |
| 톤 | **Light Study Garden** (Dark RPG 폐기됨) |
| 시안 SSoT | `app_UI.png` / `web_ui.png` (텍스트와 충돌 시 이미지 우선) |
| 컬러 | 크림 `#F8FBF7` + 민트 `#7CC97C` + 위험도(소프트 빨강·주황·파랑) |
| 스택 | Next.js 15 + FSD 2.1 + Tailwind + shadcn + Supabase + Anthropic API |
| 기간 | 8주 (W1-W8) |

---

## 3. 11 Commits 요약 (`mugungwhwa/soongong` main)

| # | Commit | 내용 |
|---|---|---|
| 1 | `296d5b2` | UI 시안 SSoT + 순공이/회독퀘스트 + Dark RPG 폐기 |
| 2 | `c04b00b` | 마스터 플랜 (8 sub-project + DB 9테이블 + agent matrix) |
| 3 | `d2ce2fc` | P1 Foundation sub-plan |
| 4 | `69f3c4b` | P3 AI Pipeline sub-plan ⚠️ |
| 5 | `22ecb3b` | UI v2.3 토스 정밀화 + 비교 레퍼런스 |
| 6 | `4d26dd3` | 외주 폐기 → Midjourney+Canva 자산 inventory |
| 7 | `113218f` | Agent 듀얼 트랙 + SparkClaw §10 |
| 8 | `ee17bca` | 환경 결정 + .env.local 템플릿 |
| 9 | `35113a6` | P2 Source Intake sub-plan |
| 10 | `2709c27` | P4/P7/P8 BE sub-plan 묶음 |
| 11 | `5d3d331` | P5/P6 UI sub-plan — P1-P8 트리오 완성 |

---

## 4. 핵심 문서 (자주 열어볼 것)

```
docs/
├── RESUME.md                                          ← 지금 이 파일
├── superpowers/plans/
│   ├── 2026-05-14-soongong-mvp1-master.md            ← 전체 로드맵
│   ├── 2026-05-14-soongong-mvp1-p1-foundation.md     ← W1 시작
│   ├── 2026-05-14-soongong-mvp1-p2-source-intake.md
│   ├── 2026-05-14-soongong-mvp1-p3-ai-pipeline.md    ← 게이트 ≥90%
│   ├── 2026-05-14-soongong-mvp1-p4-review-scheduling.md
│   ├── 2026-05-14-soongong-mvp1-p5-home-quest-ui.md
│   ├── 2026-05-14-soongong-mvp1-p6-play-recovery-canvas.md
│   ├── 2026-05-14-soongong-mvp1-p7-game-system.md
│   └── 2026-05-14-soongong-mvp1-p8-admin.md
├── setup/
│   ├── 2026-05-14-environment-decisions.md           ← Mike 결정 25분
│   └── .env.local.example
├── visual-assets/
│   └── 2026-05-14-soongong-asset-inventory.md        ← Midjourney+Canva 가이드
└── agent-strategy/
    └── 2026-05-14-agent-tracks.md                    ← 듀얼 Agent + 하네스
```

기획 SSoT: `01_제품_UX_게임화/순공대장_UI_설계.md` (v2.3)

---

## 5. Mike님의 남은 액션 (우선순위)

| 우선순위 | 작업 | 시간 | 참조 |
|---|---|---|---|
| 🔥 1 | **환경 결정 4개** (Vercel/Supabase/Anthropic/OCR) | 25분 | `docs/setup/2026-05-14-environment-decisions.md` |
| 🔥 2 | Vercel + Supabase 프로젝트 생성 + `.env.local` 채우기 | 30분 | 위 문서 §결정 1-3 후 액션 |
| ⭐ 3 | Midjourney 마스코트 응원/축하 2종 | 30-60분 | `docs/visual-assets/...asset-inventory.md` §4 |
| ⭐ 4 | Canva 앱 아이콘 + Favicon | 30분 | 위 문서 §5 |
| 5 | (P3 게이트 결과 보고) Mathpix 계정 | 10분 | P3 sub-plan T9 |
| 6 | Midjourney 추가 4종 (생각/위로/잠/놀람) | W2-4 | asset-inventory §3 |

**총 환경 셋업 ~1시간 + 마스코트 작업 ~2-4시간.**

---

## 6. 다음 세션 첫 명령 (agent 실행 패턴)

### A. Mike 환경 결정 진행 중인 경우

```
> docs/setup/2026-05-14-environment-decisions.md 읽고 결정 1-3 진행 상태 확인.
> 결정 1-2 끝났으면 P1 Task 1 (Design Tokens)부터 자동 실행.
```

→ Claude는 [[reference-soongong-repo]] 메모리에서 sub-plan 경로 자동 회상 후 `superpowers:subagent-driven-development`로 P1 진입.

### B. 환경 셋업 끝나고 실행만 남은 경우

```
> P1 sub-plan 실행 시작. subagent-driven-development 패턴 사용.
```

### C. Sub-plan 추가 보강 필요한 경우

```
> 마스터 플랜 + Mike의 변경 지시 반영해서 [P#] sub-plan 업데이트.
```

### D. SparkClaw 서류 제출 자료 작성

```
> docs/agent-strategy/2026-05-14-agent-tracks.md + SparkClaw 사업소개서.md §10 기반으로 제출 자료 PDF 초안 작성.
```

---

## 7. 위험 게이트 (잊지 말 것)

| 게이트 | 기준 | 미달 시 |
|---|---|---|
| P3 OCR 정확도 | ≥ 90% (수학 점화식 10장) | P4 진입 금지 + manual 폴백 활성 |
| P5 design-review | ≥ 70점 (8대 패턴) | UI 보강 |
| P6 E2E 7개 시나리오 | 모두 통과 | qa-tester 재실행 |
| tldraw 라이선스 | 상용 시 trial → commercial | Konva로 교체 (1-2일 spike) |

---

## 8. 빠른 git 작업

```bash
cd /Users/mike/Downloads/soongong
git status
git log --oneline -5

# Commit 시 일회용 author (절대 git config 수정 금지)
git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" commit -m "..."

# Push (SSH alias로 mugungwhwa 식별 — gh CLI active는 회사 그대로)
git push
```

---

## 9. 휴식 후 재개 체크리스트

- [ ] `git log --oneline -3` 으로 마지막 commit 확인
- [ ] 본 RESUME.md 읽기 (5분)
- [ ] Mike 환경 결정 진행 상태 확인 (`.env.local` 존재 여부)
- [ ] 마스코트 자산 진행 상태 확인 (`apps/web/public/mascot/` 폴더 존재 여부)
- [ ] 다음 액션 결정 (위 §6 패턴 선택)

---

**한 줄 요약**: 문서 11 commits 완료, Mike 환경 결정 25분 + 마스코트 작업 후 P1 자동 실행 가능.
