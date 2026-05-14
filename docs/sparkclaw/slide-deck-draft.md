---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    background: #F8FBF7;
    color: #2E2E2E;
    font-family: "Pretendard", sans-serif;
  }
  h1 { color: #5BAE6E; }
  h2 { color: #2E2E2E; border-bottom: 2px solid #7CC97C; padding-bottom: 0.3rem; }
  strong { color: #5BAE6E; }
  table { font-size: 0.85rem; }
  .small { font-size: 0.75rem; color: #6E6E6E; }
---

<!-- _class: lead -->

# 순공대장
## AI가 기억을 지키는 수능 회독 앱

**1인 창업자 × 50+ Development Agent × 16개 Product Agent**
8주 MVP 1차

<div class="small">SparkClaw 제출 자료 · 2026-05-14</div>

---

## 1. Problem

### 한국 수능생은 이미 많이 공부한다. 문제는...

- 인강을 보지만 **다시 풀지 않는다**
- 오답을 찍지만 **회수하지 못한다**
- 공부시간은 쌓이지만 **기억은 빠르게 사라진다**

**해결할 문제 = 강의 부족이 아니라 복습 실행 부족**

학술 근거: 에빙하우스 망각곡선 / 분산학습(Cepeda) / 인출 연습(Karpicke & Roediger, *Science* 2008) / 섞어풀기(Rohrer)

---

## 2. Solution

### 문제를 풀어주는 AI가 아니라, **다시 풀게 만드는 AI**

```
문제사진 / 인강기록 / 캡처
   ↓
Compliance Gate → OCR → 학습 객체화
   ↓
1/3/7/14일 회독퀘스트 자동 생성
   ↓
오답회수 모드 (V0-V5 베리에이션)
   ↓
XP / 스트릭 / 기억 HP / 순공리그
```

**핵심**: 대시보드가 아니라 **오늘의 회독퀘스트 3개**를 바로 시작하게 만드는 화면

---

## 3. Demo (시안)

### 모바일 홈 (`app_UI.png`)
- 🔥 스트릭 · ❤️ 기억 HP · ⏱ 순공시간 · ⭐ XP+등급
- 마스코트 '**순공이**'(가안, 듀공 모티프) 인사 카드
- 오늘의 회독퀘스트 3개 (위험도 배지 / 난이도 / 보상 XP / CTA)

### 웹 대시보드 (`web_ui.png`)
- 사이드바 + 12-그리드 (홈 / 오늘회독 / 오답통계 / 리그)
- 과목별 숙련도 게이지 + 망각방어 TOP3 + 빠른 시작 4-버튼

톤: **Light Study Garden** — 듀오링고 리텐션 + 한국 학습앱 카드 메타 + 친근 마스코트

---

## 4. Market

| 구분 | 규모 |
|---|---|
| TAM | 국내 초·중·고 사교육비 **27.5조원** |
| SAM | 고등학생 사교육비 **7.8조원** + 수능/N수 시장 |
| SOM (초기) | 수능 응시자 **55만명** 중 1-5% |

**보수적 계산**: 2% × 9,900원 = **연 매출 13억** / 10% 확장 시 **65억**

타깃: 인강 중심 독학재수생, 오답관리 약한 수능생, 관리형 스터디카페 이용자

---

## 5. AI Agent Architecture — 듀얼 트랙

### Product Agents (16개)
`Input Router · OCR & Capture · Lecture · Question Analysis · DNA · Type RAG · Variation · Difficulty · Generation · Solver · Evaluation · Review Scheduling · Quest · Game · Compliance · Admin`

→ **MVP 1차에 9개 구현**, 1.5/2차에 7개 확장

### Development Agents (50+)
`oh-my-claudecode (architect/executor/designer/reviewer) · superpowers (TDD/verification) · vercel (AI SDK/배포) · feature-dev · design-system · arch-guard · refactor-tools · ...`

→ **1인 창업자가 운용하는 가상 팀**

---

## 6. Business Model

| Plan | 기능 |
|---|---|
| **Free** | 문제사진 제한, 오늘의 회독 일부, 스트릭 |
| **Plus** (월 9,900원) | 무제한 회독 생성, 오답던전, 망각방어전 |
| **Pro** (월 19,900원) | AI 유사문항, 고급 리포트, 4점보스, 학부모 공유 |
| **B2B/B2B2C** | 독학재수학원·스터디센터 관리 대시보드 |

**초기 과금 포인트**: "AI가 풀어준다" ✗ / **"내 문제를 계속 회독시켜준다"** ✓

---

## 7. SparkClaw Fit

### SparkClaw가 보는 것 = "AI를 팀원으로 쓰는 창업자" + "AI Agent가 제품 핵심"
### 순공대장 = **둘 다 만족**

| 지표 | 값 |
|---|---|
| Product Agents | **16개** (백서) / **9개** (MVP 1차) |
| Development Agents | **50+** subagent / skill |
| 인간 | **1명** (Mike) |
| 개발 기간 | **8주** |
| 개발 비용 | **$60–160** (SparkClaw 선정 시 **$0**) |

**메타 차별점**: "**AI Agent가 AI Agent를 만든다**"

---

## 8. Roadmap

| 주 | Phase | 출력 |
|---|---|---|
| W1 | P1 Foundation | Next.js + Supabase + 디자인 토큰 |
| W1-2 | P2 Source Intake | 업로드 + Compliance Gate |
| W2-3 | **P3 AI Pipeline** ⚠️ | 라우팅+OCR+학습객체 (정확도 ≥90% 게이트) |
| W4 | P4 Scheduling | 1/3/7/14일 cron |
| W4-5 | P5 Home/Quest UI | 홈+퀘스트 카드 |
| W5-6 | P6 Play+Recovery+Canvas | 회독 플레이+오답회수+풀이 캔버스 |
| W6-7 | P7 Game System | XP/스트릭/HP/뱃지 |
| W7-8 | P8 Admin | 검수 화면 |

**모든 phase는 ~6,500줄 sub-plan에 실제 코드 수준으로 잠겨있음**

---

## 9. Risk + Mitigation

| 위험 | 완화 |
|---|---|
| P3 OCR 정확도 미달 | **manual 폴백 (학생 직접 입력) 미리 빌드** |
| Anthropic API 비용 | Haiku 4.5 라우팅 + Sonnet 4.6 Vision 분리 (10x 절감) |
| Mathpix 비용 | `ENABLE_MATHPIX=false` 토글 |
| tldraw 라이선스 | Konva 폴백 |
| PII 노출 | Compliance Gate에서 차단 |

**모든 위험에 코드 수준 폴백이 미리 박혀있음** — 8주 안에 멈추지 않는 구조

---

## 10. Why Now / Why Us

### Why Now
- 인공지능기본법 시행 (2026-01-22) — AI 분석 결과 명시 의무
- Anthropic Claude 4.6 / 4.7 + Vercel AI SDK + Supabase Edge — 1인 SaaS 풀스택 성숙
- 수능 응시자 증가 (2026학년도 55.4만명, 전년 대비 +3.1만)

### Why Mike (1인)
- **듀얼 Agent 트랙을 코드 수준으로 운용** — sub-plan ~6,500줄 + agent 매트릭스
- SparkClaw 1인 창업 트랙 정확 fit
- 8주 안에 16-Agent 학습 엔진 동작 검증

---

<!-- _class: lead -->

# 감사합니다

**순공대장**
1인 × 50+ Dev Agent × 16 Product Agent
8주 MVP 1차

GitHub: `mugungwhwa/soongong`
연락: mikeikhoonkim1208@gmail.com

<div class="small">시안 첨부: app_UI.png · web_ui.png</div>
