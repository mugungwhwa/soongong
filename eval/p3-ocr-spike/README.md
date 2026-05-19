# P3 OCR Spike — Mathpix vs Claude vision vs Tesseract.js

순공대장 P3 sub-plan의 OCR 정확도 게이트(≥90%, 수학 점화식 10장)를 본 구현 전에 분리 검증.

## 진입 조건

| 조건 | 확인 방법 | 미달 시 |
|---|---|---|
| Node.js 22+ + pnpm 11.x | `node -v && pnpm -v` | nvm으로 22 설치 |
| ANTHROPIC_API_KEY | `.env` 채움 | Claude runner 차단 (mike 결정 4) |
| MATHPIX_APP_ID/KEY | `.env` 채움 | Mathpix runner skip (2종 비교로 대체) |
| 골든셋 이미지 10장 | `golden/images/`에 jpg 10개 | spike 실행 불가 |
| `golden/ground-truth.json` | `ground-truth.example.json` 복사 후 채움 | spike 실행 불가 |

## 디렉토리

```
eval/p3-ocr-spike/
├── package.json              # 자체 deps (root와 독립)
├── tsconfig.json
├── .env.example              # → .env로 복사 후 키 채우기
├── .gitignore                # results/*.jsonl, golden/images/*, .env 제외
├── golden/
│   ├── images/               # Mike가 채울 수학 사진 10장
│   ├── ground-truth.example.json
│   └── ground-truth.json     # ← 실제 정답 (Mike가 채움)
├── runners/
│   ├── _shared.ts            # JSONL, normalize, levenshtein, timeout
│   ├── tesseract.ts          # 로컬 wasm OCR (kor+eng+equ)
│   ├── claude.ts             # Anthropic Sonnet 4.6 vision
│   ├── mathpix.ts            # Mathpix v3 /text API
│   └── aggregate.ts          # 결과 비교 매트릭스 + P3 게이트 판정
└── results/                  # JSONL + summary.json (gitignored)
```

## 실행

```bash
cd eval/p3-ocr-spike

# 1) 설치 (최초 1회)
pnpm i

# 2) 환경변수
cp .env.example .env
# .env 열어서 ANTHROPIC_API_KEY 등 채우기

# 3) 골든셋
# golden/images/ 에 수학 사진 10장 넣기
cp golden/ground-truth.example.json golden/ground-truth.json
# golden/ground-truth.json 열어서 10개 케이스 expected 채우기

# 4) 타입 체크 (코드만 검증, env 무관)
pnpm typecheck

# 5) 개별 실행
pnpm run:tesseract
pnpm run:claude
pnpm run:mathpix

# 6) 전체 + 보고서
pnpm run:all
pnpm report      # 비교 매트릭스 출력 + results/comparison-matrix.md 저장
```

## 산출물 형식

각 runner는 `results/{runner}-{ISO_ts}.jsonl`에 한 케이스당 한 줄 append:

```json
{"case_id":"m-001","runner":"claude","ts":"2026-05-19T...","predicted":"수열 ...","expected":"수열 ...","accuracy":0.92,"latency_ms":2340,"cost_usd":0.012,"error":null}
```

`.summary.json`에 집계:
- `accuracy_avg`: 평균 Levenshtein 비율 (0..1)
- `accuracy_at_70`: ≥0.7 비율 (loose pass)
- `accuracy_at_90`: ≥0.9 비율 (P3 게이트)
- `latency_avg_ms`, `cost_total_usd`

## P3 게이트

`accuracy_at_90 ≥ 0.9` (10장 중 9장 이상이 90% 일치) → 해당 runner P3 채택 가능.

미달 시:
- 모든 runner 미달 → P3 OCR 게이트 fail, manual 폴백을 메인 플로우로 승격 (P2 sub-plan §Manual)
- 일부 미달 → 가장 높은 accuracy_avg + 가장 낮은 cost runner 추천

## 결정론 + 격리 (CLAUDE.md §4)

- 각 runner는 외부 API 호출 후 결과를 JSONL로 즉시 append + fsync — 중간 크래시 시에도 부분 진행 보존
- `CASE_TIMEOUT_MS` (기본 30s)로 케이스 단위 격리 — 한 케이스 실패가 전체 중단시키지 않음
- `SEED` 환경변수는 현재 외부 API라 영향 적지만 향후 sampling 추가 시 사용

## 제한

- Tesseract.js의 `equ` trained data는 영어 수식 위주. 한글 + 한글 수식 혼용 시 정확도 낮을 수 있음 — 그게 정답.
- Claude vision 비용 추정치는 2026-05 기준 추정. 실제 결제 후 보정 필요.
- Mathpix 가격은 volume tier에 따라 다름 — trial은 1000 req 무료 후 유료.
