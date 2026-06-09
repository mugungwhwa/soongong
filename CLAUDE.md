# 순공대장 — Project CLAUDE.md

> 이 파일은 Claude Code 세션 시작 시 자동 로드된다. 글로벌 `~/.claude/CLAUDE.md`의 운영 룰을 베이스로 하고, 본 파일은 **순공대장 프로젝트 특수 사항**만 잠근다. 충돌 시 본 파일 우선.

---

## 0. 첫 진입 (모든 세션 시작 시)

1. `docs/RESUME.md` 먼저 읽기 (5분 안에 현재 상태 회복)
2. `git log --oneline -5` 로 최근 commit 확인
3. Mike 환경 결정 / 마스코트 자산 진행 상태 확인 후 다음 액션 결정

---

## 1. 프로젝트 한 줄

순공대장: 수능생 듀오링고형 AI **회독 리텐션 엔진**. 학생이 문제사진/인강기록/캡처를 올리면 AI Agent가 1/3/7/14일 회독퀘스트로 변환. **콴다는 학생의 '막힘'을 풀고, 순공대장은 학생의 '까먹음'을 푼다** (전략정리 §0). SparkClaw 1인 창업 트랙 8주 MVP 1차.

## 2. 잠긴 결정사항 (텍스트와 시안 충돌 시 시안 우선 — 단, 시안이 §8 폐기 정책을 위반하는 경우 텍스트(정책) 우선)

| 항목 | 값 | SSoT |
|---|---|---|
| 마스코트 | "순공이" (가안, **듀공** 모티프) | UI 설계.md §6 |
| UI 라벨 | "회독퀘스트" / 백서 = "회독" | 핵심요약.md |
| 톤 | Light Study Garden | UI 설계.md §1 |
| 컬러 | 크림 `#F8FBF7` + 민트 `#7CC97C` + 위험도(소프트) | UI 설계.md §3 |
| 시안 | `app_UI.png` / `web_ui.png` | repo root |
| 시각 자산 | Midjourney + Canva (Mike 직접, **외주 없음**) | docs/visual-assets/...asset-inventory.md |
| 디자인 reference | 듀오링고 + 카카오 헤이바이브 + 클래스101 + Pretendard (토스 차용 X) | UI 설계.md §1-2 비교 레퍼런스 |
| 스택 | Next.js 15 + FSD 2.1 + Tailwind + shadcn + Supabase + Anthropic | docs/...master.md |
| 게임화 강도 | Dark RPG 대비 -20dB (라이트 단일, 다크모드 X) | UI 설계.md §12, §14 |
| **사업 정체성** | **엔진 회사** (콘텐츠 회사 X). 콘텐츠는 사용자 자료 + 평가원 발간 학습목표 | 전략정리.md §3.1 |
| **데이터 아키텍처** | **Postgres = truth (온톨로지 트리) + pgvector = 검색 (학습 객체 임베딩)** | 전략정리.md §3.9 |
| **온톨로지 트리** | 과목→영역→단원→개념→유형→풀이전략→오답패턴(+변형축). 초기 단일 분류 + 사용자 다중 태그 | 전략정리.md §3.3, §3.8 |
| **비즈니스 모델** | **듀오링고형 5티어 하이브리드** — Free / Super 9,900 / Max 19,900 / 가족 / B2B2C + 시즌 IAP. 자동결제 OFF 기본 + 카톡 명시 고지. 첫 6개월 가격 결정 보류 | 전략정리.md §5 |
| **버티컬·글로벌 순서** | 1년 수능 → 2년 공시 → 3년+ 자격증/어학 / 글로벌은 일본(3-5년) → 동남아 → 미국 Pro Exam. **첫 18개월 한국 집중** | 전략정리.md §4.3, §6 |
| **게임화 룰** | XP/스트릭/기억HP/뱃지/등급/리그/푸시 — 본 SSoT가 단일 진실 공급원 | **`01_제품_UX_게임화/게임성_기획_구조.md` v1.0** |
| 기억 HP 단위 | **0-5 정수** (백분율 X) | 게임성_기획_구조.md §4-2 |
| 사용자 등급 6단 | 순공입문/순공러/순공대장/순공도사/순공마왕/순공전설 (식물 모티프 X) | 게임성_기획_구조.md §6-1 |
| 뱃지 희귀도 4단 | 일반/희귀/영웅/전설 (3단 common/rare/epic X) | 게임성_기획_구조.md §5-3 |
| 순공리그 진입 | **MVP 1.5차** (MVP 1차에는 sidebar 잠금 표시) | 게임성_기획_구조.md §7, §10 |

**폐기된 방향** (절대 회귀 X): Dark Study RPG / 다크 네이비 / 회독마왕 / 외주 발주 트랙 / "토스 결" 단일 reference. 추가 13종(사업/포지셔닝 9 + 게임화 4)은 §8 참조.

## 3. 작업 패턴

### Mike와의 협업
- **단일 추천안 + 근거** 제시. A/B/C/D 메뉴형 질문 금지.
- 응답 마무리는 **"OK / 다르게"** 2가지로 수렴.
- 항상 한국어. 정서법 정확.
- ★ Insight 박스(`★ Insight ────...`)로 짧은 교육적 통찰 박기 (설명형 모드 시).

### Git / Commit
- 작업 단위마다 **자동 commit**. Push는 명시 OK 받은 후.
- **`git config user.* 수정 절대 금지`**. 일회용 옵션 사용:
  ```bash
  git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" commit ...
  ```
- Remote는 이미 SSH alias로 박힘: `git@github.com-mugung:mugungwhwa/soongong.git`. 그냥 `git push` 하면 mugungwhwa 계정으로 push, gh CLI active(`treenod-mike` 회사)는 그대로 유지.
- Commit 메시지 형식: 짧은 제목 + 본문 불릿 + `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` 마지막에.

### Multica 자율 실행 (관리 에이전트 플랫폼)
- Multica 플랫폼 로그인 = mugungwhwa 개인 계정 (회사 treenod-mike X). 플랫폼 인증과 git push identity는 완전히 별개 — 플랫폼은 개인 계정으로 OK.
- Multica 에이전트의 자율 커밋/푸시도 §3 Git/Commit 룰 100% 적용:
  - git config user.* 수정 절대 금지 (전역이 회사 계정이어도 그대로 둠).
  - 커밋은 일회용 -c 옵션으로 개인 identity 강제: `git -c user.name="Mike" -c user.email="mikeikhoonkim1208@gmail.com" commit ...`
  - push는 SSH alias remote(`git@github.com-mugung:mugungwhwa/soongong.git`)로만 → mugungwhwa로 나감. gh active가 treenod-mike여도 alias라 영향 없음.
- runtime(데몬) 시작 시 remote 확인: `git remote -v` → mugung alias 맞는지.
- 초기 운영: 에이전트는 PR만 생성, 자동 머지 OFF. Mike 직접 리뷰 후 머지.
- 각 이슈에 완료 기준(DoD) 명시 (예: design-review ≥ 91 / arch-audit ≥ 89) → 에이전트 자가 검증.
- 폐기 방향(§8) 회귀 차단은 본 CLAUDE.md가 자동 가드레일 — Multica의 Claude Code 에이전트가 repo CLAUDE.md를 읽으므로 별도 설정 불필요.

### Agent 디스패치
- 새 sub-project 시작: `superpowers:writing-plans` → `superpowers:subagent-driven-development`
- 각 task: architect → executor → reviewer 3-stage
- 막힐 때: `superpowers:systematic-debugging` 또는 `oh-my-claudecode:critic` (Opus 다각도)
- PR/머지 전: `pr-review-toolkit:*` + `arch-guard:pre-commit`
- 자세한 디스패치 매트릭스: `docs/agent-strategy/2026-05-14-agent-tracks.md` §3-4

## 4. 위험 게이트 (잊지 말 것)

| 게이트 | 기준 | 미달 시 |
|---|---|---|
| P3 OCR 정확도 | ≥ 90% (수학 점화식 10장) | P4 진입 금지 + manual 폴백 활성 |
| P5 design-review | ≥ 70점 (8대 패턴) | UI 보강 후 재실행 |
| P6 E2E 7개 시나리오 | 모두 통과 | qa-tester 재실행 |
| tldraw 라이선스 | 상용 시 trial → commercial | Konva로 교체 (1-2일 spike) |
| 디자인 토큰 lint | `pnpm lint:tokens` 통과 | 등록 외 hex 차단 (`scripts/check-tokens.ts`) |

## 5. 핵심 문서 경로

```
2026-05-19-순공대장_전략_정리.md (root)                ← 사업/엔진/포지셔닝 상위 SSoT (v1.1, 2026-05-19)
docs/
├── RESUME.md                                          ← 첫 진입점
├── superpowers/plans/2026-05-14-soongong-mvp1-{master,p1..p8}.md   ← 9개 plan
├── setup/2026-05-14-environment-decisions.md          ← Mike 결정 25분
├── setup/.env.local.example
├── visual-assets/2026-05-14-soongong-asset-inventory.md  ← GPT-4o+Canva 자산 인벤토리
├── visual-assets/2026-05-18-character-design-agent.md  ← DEPRECATED, ui-master §4로 이관 (stub만 유지)
├── superpowers/specs/2026-05-18-ui-master-design.md  ← UI master SSoT (디자인 시스템 + 캐릭터 production + 에이전트 dispatch + 리서치 + 모션 + 6게이트)
├── visual-assets/mascot-v0.1/                         ← Mike 작업본 reference (main.png, repeat_normal.png)
└── agent-strategy/2026-05-14-agent-tracks.md          ← 듀얼 트랙 (시각 specialist cross-link §8)
01_제품_UX_게임화/순공대장_UI_설계.md (v2.3 SSoT)
app_UI.png / web_ui.png (이미지 SSoT)
```

## 6. 자주 쓸 명령

```bash
# 진행 상태 확인
git log --oneline -5
cat docs/RESUME.md | head -50

# 디자인 토큰 검증
cd apps/web && pnpm lint:tokens

# P3 정확도 측정
pnpm eval:p3

# P2 compliance 게이트 측정
pnpm eval:p2

# Supabase 마이그레이션
pnpm dlx supabase db push

# Edge Function 배포
pnpm dlx supabase functions deploy <name>

# 로컬 dev
cd apps/web && pnpm dev
```

## 7. 글로벌 룰과의 충돌 처리

- **계정 분리** (글로벌 §6): 본 프로젝트는 **mugungwhwa 개인** 트랙. 회사 계정 절대 사용 X.
- **§2.1 Long-task Preflight**: 본 프로젝트 sub-plan 작성/실행은 이미 작업 분해 + 실패 시나리오 + 체크포인트가 sub-plan 자체에 박혀 있으므로 추가 preflight 면제 가능.
- **§4 Eval Harness**: P2/P3 sub-plan의 eval runner는 7대 원칙 적용됨 — 추가 검증 불필요.

## 8. 폐기 정책 (회귀 금지)

다음을 다시 도입하려는 어떤 제안도 거절하고 Mike에게 확인 받기:
- Dark RPG 톤 / 다크 네이비 / 회독마왕 (web_ui.png/app_UI.png 시안에 잔존 — SOO-20에서 자산 교체 추적)
- 외주 발주 (작가/디자이너)
- 토스 단일 reference 차용
- git config user.* 수정
- 회사 계정(treenod-mike)으로 본 repo push
- **컨텐츠 회사 방향** (기출 라이센싱, 자체 출제팀) — 엔진 회사 정체성 고수 (전략정리 §3.1)
- **IAP 단독 비즈니스 모델** — 듀오링고형 5티어 하이브리드 (전략정리 §5)
- **자동결제 + 매달 무알림 한국식 구독** — 자동결제 OFF 기본 + 카톡 명시 고지 (전략정리 §5.3)
- **fear-based 결제 카피** ("안 사면 점수 떨어집니다") — 가치 기반 카피로 (전략정리 §5.10)
- **"한국적 듀오링고" 카피캣 포지셔닝** — "듀오링고의 다음 진화" narrative (전략정리 §2.3)
- **첫 18개월 글로벌 시도** — 한국 PMF 검증 우선 (전략정리 §6.4)
- **K-12 미국 시장 직진입** (rote learning 거부감) — Pro Exam만 (전략정리 §6.2)
- **중국 시장 단기 진입** (雙減政策) — 보류 (전략정리 §6.2)
- **정직원 2~3명 1년 동시 채용** (1억 시드 기준 불가능) — 옵션 B 공동창업자 (전략정리 §7.4)
- **rank 식물 모티프** (씨앗/새싹/푸른잎/꽃봉오리/활짝꽃) — `게임성_기획_구조.md §6-1` 6단으로 고정
- **기억 HP 백분율 단위** — 0-5 정수만 허용 (`게임성_기획_구조.md §4-2`)
- **뱃지 희귀도 3단** (common/rare/epic) — 4단(일반/희귀/영웅/전설)만 허용
- **순공리그 MVP 1차 도입** — MVP 1.5차 이전엔 sidebar 잠금 표시만

## 9. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-14** | **초안. 잠긴 결정사항 9개 + 작업 패턴 + 위험 게이트 + 폐기 정책.** |
| **v1.1** | **2026-05-18** | **§5 핵심 문서 경로 트리에 캐릭터 디자인 에이전트 SSoT(`2026-05-18-character-design-agent.md`) + 마스코트 v0.1 작업본 폴더 추가. 인벤토리 주석 Midjourney → GPT-4o 갱신.** |
| **v1.2** | **2026-05-18** | **§5에 UI master spec(`superpowers/specs/2026-05-18-ui-master-design.md`) 추가. 캐릭터 SSoT는 DEPRECATED 표시(ui-master §4로 흡수, stub만 유지).** |
| **v1.3** | **2026-05-19** | **상위 사업/엔진/포지셔닝 SSoT(`2026-05-19-순공대장_전략_정리.md` v1.1) 등록. §1 "회독 리텐션 엔진" 격상 + 콴다 차이. §2 잠긴 결정사항 5행 추가(엔진 정체성/데이터 아키/온톨로지/비즈모델/버티컬·글로벌). §5 트리에 상위 SSoT 추가. §8 폐기 정책 9종 추가(컨텐츠 회사/IAP 단독/자동결제 무알림/fear 카피/카피캣/18개월 글로벌/K-12 미국/중국/정직원 2-3명).** |
| **v1.4** | **2026-05-19** | **§2 잠긴 결정사항에 게임화 SSoT 5행 추가 (게임화 룰 / 기억 HP 단위 / 사용자 등급 6단 / 뱃지 희귀도 4단 / 순공리그 진입). §8 폐기 정책에 게임화 회귀 4종(식물 등급/HP 백분율/3단 희귀도/리그 MVP 1차) 추가. `게임성_기획_구조.md` v1.0 SSoT 잠금과 연동.** |
| **v1.5** | **2026-06-08** | **§3에 'Multica 자율 실행' 하위 섹션 추가 — 플랫폼 로그인(개인 mugungwhwa 계정)과 git push identity 분리 명시, 자율 커밋 시 기존 Git/Commit 룰(config 수정 금지·일회용 -c·SSH alias push) 적용, 초기 PR-only(자동 머지 OFF) 운영, 이슈 DoD 명시 룰.** |
| **v1.6** | **2026-06-09** | **§2 헤더 충돌 규칙에 폐기정책 예외 단서 추가 — 시안이 §8 폐기 정책 위반 시 텍스트(정책) 우선. §8 'Dark RPG 톤 / 다크 네이비 / 회독마왕' 항목에 시안 잔존 + SOO-20 자산 교체 추적 크로스링크 주석. (SOO-21·A2, 텍스트 편집만 — 시안 PNG 미변경)** |

---

> **이 파일은 매 세션 자동 로드된다.** 변경 시 매우 신중하게.
