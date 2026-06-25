# P3 OCR Spike — Mathpix vs Claude vision vs Tesseract.js 비교 보고서

> 상태: **Phase A 완료, Phase B (실제 측정) 대기**.
> 작성일: 2026-05-19
> 코드: `eval/p3-ocr-spike/` (자체 package, 독립 실행)

---

## 1. 목적

순공대장 P3 sub-plan의 OCR 정확도 게이트(`≥ 90%, 수학 점화식 10장`)를 본 구현 전에 분리 검증. 결과에 따라:

- **모든 runner 미달** → manual 폴백을 메인 플로우로 승격 (P2 sub-plan §Manual)
- **일부 통과** → 가장 높은 정확도 + 합리적 비용의 runner 채택
- **모두 통과** → 비용·지연 기준으로 1순위 선택

본 보고서는 spike의 단일 진실 공급원 (SSoT).

---

## 2. Phase A 산출물 (코드 + 인프라)

### 2.1 Self-contained eval 패키지

위치: `eval/p3-ocr-spike/`. 루트 monorepo와 독립 — 자체 `package.json` + `tsconfig.json` + `.env`.

| 파일 | 역할 |
|---|---|
| `runners/_shared.ts` | JSONL append + fsync, Levenshtein, 정규화, timeout, 진행률 |
| `runners/tesseract.ts` | 로컬 wasm OCR (kor+eng+equ trained data) |
| `runners/claude.ts` | Anthropic Sonnet 4.6 vision + 한글/LaTeX 혼용 프롬프트 |
| `runners/mathpix.ts` | Mathpix v3 /text API (text + latex_styled formats) |
| `runners/aggregate.ts` | 3종 결과 비교 매트릭스 markdown 생성 |
| `golden/ground-truth.example.json` | 10케이스 템플릿 (Mike가 복사 후 채움) |

### 2.2 환경 표준화

| 파일 | 역할 |
|---|---|
| `docs/setup/.env.local.example` | 본 spike + P1/P2/P3 본 구현 공통 env 키 5종 (Supabase, Anthropic, Vercel, Mathpix, 운영 플래그) |
| `eval/p3-ocr-spike/.env.example` | spike 전용 env (Anthropic + Mathpix + timeout/seed) |

### 2.3 CLAUDE.md §4 준수

- 결정론: SEED env 노출 (현재 외부 API라 효과 제한적 — 향후 sampling 추가 대비)
- 격리: 케이스별 `CASE_TIMEOUT_MS` (기본 30s), 한 케이스 실패가 전체를 중단시키지 않음
- 부분 진행: JSONL one-line append + fsync (Crash 시 재실행 시 마지막 행까지 복원 가능)
- 진행률: `[runner i/N] elapsed=mm:ss pass=p fail=f` 매 케이스마다 stdout

---

## 3. Phase B 실행 절차 (Mike unblock 후)

### 3.1 진입 조건 (전부 충족 시 실행)

- [ ] Mike 결정 4 완료 → `ANTHROPIC_API_KEY` 발급 + `eval/p3-ocr-spike/.env`에 기재
- [ ] Mike 결정 5 완료 → Mathpix trial 키 발급 + `.env`에 기재 (skip 가능 — 2종 비교로 대체)
- [ ] Mike가 수학 점화식 10장 준비 (휴대폰 촬영 or 기존 문제집/노트 캡처)
- [ ] `eval/p3-ocr-spike/golden/images/`에 jpg 10장 배치
- [ ] `golden/ground-truth.json` 작성 (예제 파일 복사 후 expected 채움)

### 3.2 실행

```bash
cd /Users/mike/Downloads/soongong-p3-ocr-spike/eval/p3-ocr-spike
pnpm i
pnpm typecheck
pnpm run:tesseract
pnpm run:claude
pnpm run:mathpix   # Mathpix 키 있을 때만
pnpm report        # 비교 매트릭스
```

### 3.3 게이트 판정

`accuracy_at_90 ≥ 0.9` (10장 중 9장 이상이 90% 일치) → 통과.

---

## 4. 결과 (Phase B 완료 후 채울 자리)

### 4.1 비교 매트릭스

| Runner    | Total | OK  | Acc avg | ≥0.7  | ≥0.9  | Latency  | Cost     |
|-----------|-------|-----|---------|-------|-------|----------|----------|
| tesseract | TBD   | TBD | TBD     | TBD   | TBD   | TBD ms   | $0.000   |
| claude    | TBD   | TBD | TBD     | TBD   | TBD   | TBD ms   | $TBD     |
| mathpix   | TBD   | TBD | TBD     | TBD   | TBD   | TBD ms   | $TBD     |

(자동 생성: `pnpm report` 실행 시 `results/comparison-matrix.md`에 채워짐)

### 4.2 케이스별 상세 (선택)

가장 어려운 케이스 + 가장 쉬운 케이스 각 1개씩, 3 runner의 predicted를 나란히 보여 — 어떤 패턴이 약한지 인사이트.

### 4.3 비용 시나리오

- MVP 1차 가입자 100명 × 일 5장 = 일 500 OCR → 월 15,000
- 각 runner 월 비용 = `cost_per_call × 15000`

---

## 5. 단일 추천 (Phase B 완료 후)

(채울 자리)

**1순위**: TBD
**이유**: TBD (정확도 + 비용 + 지연 trade-off)
**후보 2순위 (fallback)**: TBD

---

## 6. P3 sub-plan 영향

(Phase B 완료 후 채울 자리)

- 채택 runner: TBD
- P3 sub-plan T1-T9 변경 필요 부분: TBD
- Manual 폴백 메인 승격 여부: Yes/No

---

## 7. Phase A 검증

- [x] worktree `soongong-p3-ocr-spike` 생성 (브랜치 `feat/p3-ocr-spike`)
- [x] 자체 package.json + tsconfig.json + .gitignore
- [x] 3종 runner 코드 + 공유 유틸 + 집계 스크립트
- [x] 골든셋 예제 + .gitkeep 디렉토리
- [x] `.env.local.example` 통합 템플릿 (docs/setup/)
- [x] 본 보고서 템플릿
- [ ] `pnpm typecheck` 통과 (Phase A 마무리 직전 — pnpm i 후)
- [ ] commit + draft PR open

---

## 8. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| v0.1-phase-A | 2026-05-19 | Phase A 완료 — 코드 + 인프라 + 보고서 템플릿. Phase B 측정 대기. |
