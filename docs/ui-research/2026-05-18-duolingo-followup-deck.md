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
