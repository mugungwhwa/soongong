# 환경 트랙 결정사항 — Mike 결정 필요

> 환경 트랙 시작 전 결정해야 할 **5개 항목**. 각 항목에 옵션 비교 + 추천 + 근거 + 결정 후 액션. 모두 30분 안에 결정 가능.
> 결정 후 P1 sub-plan의 Task 4 (Supabase Auth) / Task 5 (users 테이블)부터 즉시 실행 가능.

---

## 결정 1: Vercel 계정 / 프로젝트

| 옵션 | 장점 | 단점 |
|---|---|---|
| **A. `mugungwhwa` (개인)** ⭐ 추천 | 본 repo `mugungwhwa/soongong`과 일치, GitHub 통합 자동, 회사 계정 오염 0 | Pro plan 비용 개인 부담 ($20/월, 필요시) |
| B. `treenod` (회사) | 회사 인프라 통합 | 회사 자산이 되어 SparkClaw 1인 창업 적합도 약함, 향후 분리 어려움 |

### 추천: **A. mugungwhwa (개인)**

근거:
- 본 repo가 이미 mugungwhwa로 push되고 있음 (commit `113218f`)
- SparkClaw 1인 창업 트랙이라 회사 자산이 섞이면 안 됨
- MVP 단계는 **Hobby plan ($0/월)** 으로 충분 — 출시 후 Pro 전환

### 결정 후 액션 (Mike)

```
1. https://vercel.com 에서 mugungwhwa 계정으로 로그인
2. "Add New" → "Project" → GitHub에서 mugungwhwa/soongong import
3. Framework Preset: Next.js (자동 인식)
4. Root Directory: apps/web
5. Build Command: pnpm build (자동)
6. Install Command: pnpm install
7. Deploy 클릭 → 첫 빌드는 P1 Task 1-2 끝나야 성공
```

---

## 결정 2: Supabase 조직 / 프로젝트

| 옵션 | 장점 | 단점 |
|---|---|---|
| **A. 새 개인 organization (mike@mugungwhwa)** ⭐ 추천 | Free tier로 시작 가능 (DB 500MB / 1GB Storage / 5만 MAU), 회사 분리 | 결제는 개인 카드 ($25/월 Pro 필요 시) |
| B. 회사 organization (treenod) | 회사 결제 | 회사 자산화, SparkClaw 1인 창업 트랙과 충돌 |

### 추천: **A. 새 개인 org**

근거:
- Free tier가 MVP 검증에 충분 — DB 500MB는 학생 1000명 + 분석 데이터 충분
- pgvector는 Free에도 포함됨
- 결제 단계는 출시 후 또는 SparkClaw 선정 후 검토

### 결정 후 액션 (Mike)

```
1. https://supabase.com 회원가입 (개인 이메일)
2. New Organization → mugungwhwa
3. New Project → name "soongong-mvp", region "Northeast Asia (Seoul)"
4. Database password 생성 + 1Password 저장
5. Settings → API → Project URL + anon key + service_role key 메모
   (.env.local 에 박힐 값)
```

**Region이 Seoul인지 반드시 확인** — 학생 응답 지연(latency) 핵심.

---

## 결정 3: Anthropic API 키 출처

| 옵션 | 장점 | 단점 |
|---|---|---|
| **A. 개인 결제로 시작** ⭐ 추천 (MVP 1차) | 즉시 사용 가능, prompt caching 적용 시 비용 절감 | 초기 카드 결제 ($20-50 한도 시작 권장) |
| B. SparkClaw 인프라 혜택 활용 | 비용 0 | SparkClaw 선정 후에만 가능, 선정까지 lead time |
| C. Vercel AI Gateway 경유 | 멀티 프로바이더 통합 (Anthropic/OpenAI/Google 등), 비용 추적 단일화 | 약간의 latency 추가, Gateway 설정 부담 |

### 추천: **A → SparkClaw 선정되면 B로 전환**

근거:
- 즉시 시작 가능, MVP 1차 비용 추정: Haiku 4.5 + Vision 합쳐 **$30-80/월** (학생 100명 × 30회 분석/월 기준)
- prompt caching 적용 시 추가 40-60% 절감
- SparkClaw 선정 후 B로 전환은 환경 변수 교체만으로 끝

### 결정 후 액션 (Mike)

```
1. https://console.anthropic.com 회원가입
2. Settings → API Keys → "Create Key" (이름: "soongong-mvp")
3. 키 복사 → 1Password 저장 (UI에 다시 안 보임)
4. Settings → Billing → 한도 $20-50/월 시작 권장
5. 키를 .env.local에 ANTHROPIC_API_KEY=... 형태로 저장
```

**비용 알림 설정** — Anthropic console에서 $20/$50/$100 알림 등록.

---

## 결정 4: OCR 외부 서비스

| 옵션 | 정확도 (수식) | 비용 | 비고 |
|---|---|---|---|
| **A. Vision LLM only (Claude Sonnet 4.6)** ⭐ 추천 (시작) | 보통 (한글 OK, 복잡한 수식 약함) | Anthropic 비용에 포함, 추가 $0 | P3 게이트 (70%) 미달 시 B로 전환 |
| B. + Mathpix 활성 (`ENABLE_MATHPIX=true`) | 매우 높음 (수식 전문) | $0.005/요청 × 호출 횟수 | 수식이 많은 한국 수능 수학에 유리 |
| C. Google Cloud Vision + Mathpix | 매우 높음 (전반적) | Cloud Vision $1.5/1000 + Mathpix | 가장 비싸지만 가장 정확 |

### 추천: **A로 시작 → P3 정확도 게이트 결과 보고 B 결정**

근거:
- P3 sub-plan에 이미 `ENABLE_MATHPIX` flag로 토글 가능하게 잠겨있음
- A로 측정 → 70% 미달 시 B 활성 → 그래도 미달 시 C
- 비용/정확도 trade-off를 측정 데이터로 결정

### 결정 후 액션 (Mike)

```
1. P3 시작 시 ENABLE_MATHPIX=false 로 시작
2. P3 종료 시점 게이트 측정 후 결정
3. Mathpix 활성 결정 시:
   - https://mathpix.com 회원가입
   - "Get App ID & Key" → API 키 발급
   - .env.local에 MATHPIX_APP_ID, MATHPIX_APP_KEY 추가
   - Supabase secret: pnpm dlx supabase secrets set ENABLE_MATHPIX=true
```

---

## 결정 5: 1차 AI 모델 / 라우팅

| Agent | 추천 모델 | 근거 |
|---|---|---|
| Subject Routing | **Haiku 4.5** | 빠름/저렴, 분류 작업에 충분 |
| OCR Parsing (Vision) | **Sonnet 4.6** | Vision 품질이 중요, 한글+수식+그림 |
| Learning Object Builder | **Haiku 4.5** | 태깅 작업 |
| Wrong Reason Tagger | **Haiku 4.5** | 분류 |
| Variation Generation (MVP 1.5+) | **Sonnet 4.6** | 문항 품질이 중요 |
| Solver Verification (MVP 2차) | **Opus 4.7** 또는 **Sonnet 4.6** | 정답 검증은 품질 최고 |

### 추천: **Haiku + Sonnet 혼합 (이미 P3 sub-plan에 박혀있음)**

P3 sub-plan `_shared/ai.ts`의 `getModel("fast" | "quality")`로 이미 구분:
```ts
export function getModel(tier: "fast" | "quality") {
  return tier === "fast"
    ? anthropic("claude-haiku-4-5-20251001")
    : anthropic("claude-sonnet-4-6");
}
```

근거:
- Haiku 4.5: Input $0.25/1M / Output $1.25/1M (10x 저렴)
- Sonnet 4.6: Input $3/1M / Output $15/1M
- Vision은 Sonnet 4.6 (Haiku는 Vision 약함)
- 라우팅/태깅은 Haiku로 비용 1/10

### 결정 후 액션

별도 결정 없음 — P3 sub-plan에 이미 잠겨있음. **Mike 결정 불필요**.

---

## 결정 6 (옵션): CI / 자동 배포

| 옵션 | 권장 |
|---|---|
| **A. Vercel 자동 배포 + GitHub Actions(lint/test)** ⭐ | Vercel이 push 자동 감지 + Preview Deployment 생성. PR 머지 시 Production 배포. |
| B. GitHub Actions만 | 빌드/배포 다 직접 정의 필요. 복잡. |

### 추천: **A** — Vercel 자동 배포 + 간단한 GitHub Actions

근거: Vercel 통합이 가장 마찰 적음. PR마다 Preview URL 자동 생성 → Mike가 실제 결과 확인 가능.

### 결정 후 액션

```
1. Vercel 프로젝트 import 시 자동 설정됨 (결정 1 액션에 포함)
2. main 브랜치 push → Production
3. 다른 브랜치 push → Preview
4. (선택) .github/workflows/lint.yml 추가 — P1 Task 1 끝나면 자동 생성 가능
```

---

## 결정 7 (옵션): Notification / Monitoring

| 항목 | 옵션 | 추천 |
|---|---|---|
| Error tracking | Sentry / Vercel Analytics | **Vercel Analytics** (무료, 통합) |
| 비용 알림 | Anthropic / Supabase / Vercel 콘솔 각각 | **각자 설정** (MVP 단순) |
| Uptime | UptimeRobot / Vercel | **Vercel Speed Insights** |

별도 결정 단순 — 모두 Vercel 생태계 안에서 해결. 추가 비용 0.

---

## 비용 예상 (MVP 1차 8주 단위)

| 항목 | 추정 |
|---|---|
| Vercel Hobby | $0 |
| Supabase Free | $0 |
| Anthropic API (학생 100명 × 30분석/월) | **$30-80/월** |
| Mathpix (활성 시) | +$10-30/월 |
| 도메인 (선택) | $12/년 |
| **합계** | **$30-80 × 2개월 = $60-160** (8주 MVP) |

SparkClaw 선정 시 Anthropic 비용은 **0**으로 전환.

---

## 환경 변수 관리 가이드

1. **로컬 개발**: `apps/web/.env.local` (gitignore에 이미 포함됨)
2. **Vercel 배포**: Vercel Dashboard → Project → Settings → Environment Variables
   - Production / Preview / Development 환경별로 분리 가능
   - Vercel CLI: `pnpm dlx vercel env pull apps/web/.env.local` 로 자동 동기화
3. **Supabase Edge Function secrets**: `pnpm dlx supabase secrets set KEY=value`
4. **1Password / Bitwarden에 백업** — API 키 분실 방지

`.env.local.example` 템플릿은 별도 파일(`apps/web/.env.local.example` — P1 Task 4에서 자동 생성).

---

## Mike 체크리스트 (결정 + 셋업)

- [ ] 결정 1: Vercel 계정 → mugungwhwa (예상 5분)
- [ ] 결정 2: Supabase organization + project → mugungwhwa org + soongong-mvp + Seoul region (예상 10분)
- [ ] 결정 3: Anthropic API 키 → 개인 결제로 시작 (예상 10분)
- [ ] 결정 4: OCR → Vision LLM only로 시작 (예상 0분, 자동)
- [ ] 결정 5: AI 모델 라우팅 → Haiku + Sonnet 혼합 (자동, 결정 불필요)
- [ ] 결정 6: CI / 배포 → Vercel 자동 (Vercel import 시 자동)
- [ ] 결정 7: Monitoring → Vercel Analytics (선택, 출시 직전)

**총 결정 시간: 약 25분**

---

## 결정 후 자동 진행 가능한 셋업 절차

Mike가 위 7개 결정 끝내고 환경 변수 준비 끝나면, Claude Code가 자동으로:

```
1. P1 Task 1 (Design Tokens) 실행 — 결정 1-2 불필요, 즉시 시작 가능
2. P1 Task 2 (Next.js scaffolding) 실행 — 결정 1 필요 (Vercel import 위해 GitHub repo 준비)
3. P1 Task 3 (shadcn 9종) 실행 — 결정 1-2 불필요
4. P1 Task 4 (Supabase Auth) 실행 — 결정 2 필요
5. P1 Task 5 (users 테이블) 실행 — 결정 2 필요
6. (이후 P2부터) — 결정 3 필요 (Anthropic 키)
```

즉 **결정 1-2만 끝나면 P1 Task 1-5까지 자동 진행 가능**. 결정 3은 P3 진입 전까지만 끝나면 됨.

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-14** | **초안. 환경 트랙 5개 핵심 결정 + 2개 옵션 결정 + 추천 + 결정 후 액션 + 비용 추정 + 체크리스트.** |
