# 순공대장 P0 Demo Skeleton 완료 보고

> P0 와꾸 트랙 (Day 1-7) 압축 완주 보고. 듀오링고형 AI 회독 앱의 8개 화면을 mock-first로 연결, Vercel preview 직전 상태.

- **종료 일시**: 2026-05-18
- **브랜치**: `feat/p0-day1` (mugungwhwa/soongong)
- **압축 비율**: 7일 plan → 단일 세션 14 commit 완주
- **다음 단계**: Vercel preview 배포 (Mike 직접) → P1 정식 진입

---

## 1. 게이트 결과

| 게이트 | 기준 | 결과 | 상태 |
|---|---|---|---|
| 8개 화면 클릭 완주 | 모두 도달 가능 | /today /play/[id] /result /admin /recovery/[id] /login /calendar /diary /graph /wrong-notes /demo (13 routes) | ✅ |
| Playwright E2E | 2/2 통과 | 23.5s, /today→업로드→AnalysisCard + /play/q-001→정답5→정답카드 | ✅ |
| design-review | ≥70/100 | **89/100** (Day1 86 → +3) | ✅ |
| arch-audit | Critical 0 | **86/100** Critical 0건 (Day1 Critical 3건 모두 해소) | ✅ |
| lint:tokens | 0 위반 | ✅ 21개 토큰 화이트리스트 완전 통과 | ✅ |
| lint:no-dark | 0 위반 | ✅ 다크모드 0건 (라이트 단일 잠금) | ✅ |
| Vercel preview | URL 1개 | _Mike 직접 작업 대기_ | ⏳ |
| tldraw 라이선스 | 결정 | v5 trial → P1에서 commercial 검토, Konva 폴백 보존 | ⚖️ |

**P0 게이트 7/8 통과**. 남은 1건은 Mike의 Vercel 계정 작업.

---

## 2. 14 commit 타임라인

| Day | Commit | 내용 |
|---|---|---|
| 1 | `e1796c0` | 디자인 토큰 v1 + Pretendard + Tailwind v4 wiring |
| 1 | `e8b7bd9` | shadcn/ui 9종 + Mascot 컴포넌트 + demo 페이지 |
| 1 | `f1e375c` | mock fixtures + env 토글 + ai.ts swap point |
| 1 | `faa3c6f` | layout + sidebar/bottom-nav + route 스텁 |
| 2 | `f42831c` | 홈 3-column 시안 충실 구현 |
| 2 | `7301e4d` | tokens.css UI 리서치 deck §3 정합 보정 |
| 2 | `cf936a5` | 디자인 총괄 리포트 v1.0 — 3 skill 합성 (Day 1 baseline 86/88) |
| 2 | `b0545ac` | Critical A+B 보정 — use client + FSD 역방향 import 제거 |
| 3 | `273530c` | tldraw v5 spike + PadCanvas widget |
| 3 | `bc38ab5` | 회독 플레이 페이지 + 정답/오답 분기 |
| 4 | `99ff8bb` | 업로드 시트 3-옵션 + mock 분석 + 결과 카드 |
| 5 | `38d4096` | 결과 화면 + XP 카운트업 + 마스코트 spring 애니메이션 |
| 6 | `d27eb57` | admin/recovery/login + tokens & no-dark lint 게이트 |
| 7 | `d6ffe90` | Playwright E2E 2 specs 통과 |

---

## 3. Mike에게 넘기는 것

### 3.1 Vercel Preview 배포 체크리스트

1. https://vercel.com mugungwhwa 로그인 (회사 계정 X)
2. Add New → Project → mugungwhwa/soongong import
3. Settings:
   - Framework Preset: **Next.js**
   - Root Directory: **`apps/web`**
   - Build Command: **`pnpm build`**
   - Install Command: **`pnpm install`**
   - Node Version: 20+ (pnpm 11.1.2)
4. Environment Variables (Preview + Production 둘 다):
   - `NEXT_PUBLIC_MOCK_MODE=true`
   - `NEXT_PUBLIC_APP_NAME=순공대장`
5. Deploy → 첫 build log 확인 (성공 예상, build 시간 ~90s)
6. Preview URL 메모 → README.md에 append + 본 보고서 §1 게이트 표 업데이트

### 3.2 마스코트 placeholder swap (시각 자산 트랙)

GPT-4o + Canva 작업본이 도착하면 다음 6 슬롯에 PNG 배치:
- `apps/web/public/mascot/cheer.png`
- `apps/web/public/mascot/celebrate.png`
- `apps/web/public/mascot/think.png`
- `apps/web/public/mascot/comfort.png`
- `apps/web/public/mascot/sleep.png`
- `apps/web/public/mascot/surprise.png`

그 다음 `apps/web/src/shared/ui/mascot.tsx`를 emoji → `<Image>` 컴포넌트로 swap.

### 3.3 AI 연결 swap point (P3 단계)

`apps/web/src/shared/lib/ai.ts`:
```ts
export async function analyzeSource(input: { sourceId: string }) {
  if (env.NEXT_PUBLIC_MOCK_MODE) return mockAnalyze(input);
  throw new Error("Real AI not implemented yet — P3 단계에서 Anthropic SDK 분기 채움");
}
```
P3 진입 시 `else` 분기에 Anthropic SDK 호출만 채우면 mock → real 전환 완료.

---

## 4. 디자인 합성 핵심 (상세는 별도 파일)

상세 리포트: `docs/ui-research/2026-05-18-design-master-report-day7.md`

| 항목 | Day 1 | Day 7 | Δ |
|---|---|---|---|
| design-system:design-review | 86 | **89** | +3 |
| arch-guard:arch-audit | 88 | **86** | -2 (Critical 3→0) |
| 마스코트 노출 화면 | - | 10/10 전수 | ✓ |
| 폐기 항목 회귀 | - | 0건 | ✓ |
| 라이트 단일 잠금 | - | 완벽 | ✓ |

**듀오링고 패턴 매핑** = 마스코트 노출 빈도, 스트릭/HP/XP 시각 위계, 게이미피케이션 강도 -20dB 모두 UI 설계.md §6 §12 §14 계약대로 박혔음.

### 4.1 P1에서 정리할 Warning (블로킹 아님)

| 항목 | 건수 | 해소 방법 |
|---|---|---|
| `text-white` 하드코딩 | 10 | `var(--color-text-inverse)` 토큰 교체 |
| review-map gradient 미등록 | 1 | tokens.css에 gradient 토큰 등록 |
| entities deep import | 6 | `entities/*/index.ts` 배럴 신설 |
| XP 색상 골드 미적용 | 1 | result-rewards XpCounter 텍스트에 골드 토큰 |

예상 소요: 30분 1 commit으로 design-review 91+, arch-audit 89로 끌어올림. P1 첫 PR로 처리 권장.

---

## 5. P0에서 잠긴 핵심 결정 (회귀 금지)

본 P0 와꾸가 거쳐 잠근 사항. 폐기 방향을 다시 끄집어내는 어떤 제안도 거절:

| 항목 | 값 | 이유 |
|---|---|---|
| 게임화 강도 | Light Study Garden (Dark RPG -20dB) | 수능생 학습 도메인, 다크 톤은 학습 피로 가속 |
| 디자인 톤 | 크림(#F8FBF7) + 민트(#7CC97C) | 듀오링고 친근감 + 학습 가든 메타포 |
| 마스코트 | 듀공 "순공이" (외주 X) | GPT-4o + Canva 직접 작업 트랙 |
| FSD 구조 | features ↮ widgets 단방향 | b0545ac에서 잠금 (역방향 import 금지) |
| 다크모드 | 미지원 (라이트 단일) | `dark:` 키워드 lint로 차단 |
| tldraw | v5 trial (P0 OK) | 상용 시 commercial 검토, Konva 폴백 |
| AI swap point | `shared/lib/ai.ts` | mock/real 분기를 단일 파일로 잠금 |

---

## 6. 다음 단계

### 6.1 즉시
- [ ] Mike — Vercel preview 배포 (위 §3.1 체크리스트)
- [ ] Mike — Preview URL을 본 보고서 §1, README.md에 기재

### 6.2 P1 진입 직전 (환경 결정 25분)
- [ ] Supabase 프로젝트 생성 (mugungwhwa 계정)
- [ ] Anthropic API 키 발급 + Vercel env 등록
- [ ] `docs/setup/2026-05-14-environment-decisions.md` 결정 25분 진행

### 6.3 P1 첫 PR (30분 cleanup)
- [ ] `text-white` 10건 토큰 교체
- [ ] review-map gradient 토큰 등록
- [ ] entities index.ts 배럴 3개 신설
- [ ] result-rewards XP 골드 토큰
- 목표: design-review 91+, arch-audit 89

### 6.4 P1 본격
- [ ] Supabase 연결 + Auth 실제 구현 (login 더미 → 실제 OAuth)
- [ ] P2 source-intake plan 진입
- [ ] P3 ai-pipeline plan 진입 (`shared/lib/ai.ts` 실연결)

---

## 7. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| v1.0 | 2026-05-18 | 초안. P0 7일치를 1 세션 14 commit으로 압축 완주 보고. |
