# 회독 리텐션앱 경쟁 UX 딥리서치 — 티어다운 & 갭 비교 (SOO-93)

> **목적**: 순공이가 진짜 "회독 리텐션 앱"으로서 갖춰야 할 기능·UI·UX를 글로벌 레퍼런스(듀오링고 + 에듀/게임에듀 다수)에서 발굴하고, 현행 순공대장 디자인과 1:1 비교한다.
> **제약(Mike 명시)**: 브랜드 변경 아님. 색·로고·마스코트·디자인 토큰 교체 제안 금지. 도출물은 "기능·플로우·UX 패턴" 수준. 본 문서는 비교/제안 리포트이며 코드 변경이 아니다 — 채택은 Mike가 별도 결정한다.
> **작성**: UI·디자인 리드 / 2026-06-20

---

## 0. TL;DR (한 장 요약)

순공대장은 **이미 "좋은 쪽" 매트릭스에 정렬돼 있다** — 마스코트 mood 분기, 기억HP 0–5 정수(백분율·하트 아님), 라이트 동반자 톤. 듀오링고/Habitica의 협박·다크패턴 쪽은 피하고 있다. **빠진 것은 "리텐션 마감재"** 다섯 가지다:

| 우선순위 | 제안 | 한 줄 | 근거 레퍼런스 | 임팩트 | 난이도 |
|---|---|---|---|---|---|
| **P1** | 비-처벌 빈 상태(Empty State) | 첫 회독 전·큐 0건일 때 순공이가 기다리는 동반자 화면 | Finch | 高 | 低 |
| **P2** | 동반자 톤 회독 리마인드 시스템 | "물 줄 시간이래요"식 돌봄 푸시·넛지 (협박 금지) | Memrise·Finch | 高 | 中 |
| **P3** | 오늘 복습 due 큐 정수 노출 | 홈에 "오늘 회독 N개"를 Anki식 정수 카운트로 명확화 | Anki | 中–高 | 低 |
| **P4** | 회독 보호권(Streak Freeze) — 동반자 변형 | 끊겨도 순공이가 하루 막아줌, **무료·죄책감 0** | 듀오링고(분해 차용) | 高 | 中 |
| **P5** | 단원별 숙련도(strength) 시각화 | 정수 단계·은유 상태로(백분율 금지) | Quizlet·Memrise | 中 | 中 |

P6~P8(자가채점·온보딩 게이트·mood 체크인)은 백로그 후보. 자가채점/적응형 큐는 **MOAT(망각·문제생성) 경계**라 직접 제안하지 않고 상신 대상으로 분리한다(§7).

---

## 1. 레퍼런스 티어다운

리서치 폭이 넓어 [Lead 제안]대로 **1차 = 듀오링고 + 대표 5개(Anki·Quizlet·Memrise·Brilliant·Finch) + 거절 레퍼런스(Habitica)** 로 좁혀 빠른 갭표를 낸다.

### 1-A. Duolingo — 게임화 리텐션의 앵커 (차용 + 안티패턴 둘 다)

- **랜딩/온보딩 "Play-first, profile-second"**: 언어·유입경로·하루 학습시간 3개만 묻고 **즉시 학습 시작**, 회원가입은 온보딩 *끝*에 배치(스킵 가능). 먼저 가치(첫 레슨·진척 데이터)를 주고 "잃기 싫어서" 가입으로 보답하게 하는 상호성 설계.
- **리텐션 머신**: Streak(일일 리텐션 ~2배), **Streak Freeze/Repair**(1–2일 보호 → *불안을 낮춰 장기 리텐션을 오히려 높임* ← 핵심 인사이트), XP·데일리골, 주간 30인 리그(브론즈→다이아 10단계, 상위 승급/하위 강등), Hearts(오답 시 생명 차감).
- **넛지/푸시 톤**: "You made Duo sad / You've let Duo down" 등 **passive-aggressive Duo 밈** — 손실회피·죄책감 기반. 사용자 밈을 공식 톤으로 역흡수.
- **마스코트(Duo)**: 성과에 **mood 연동**(성공=백플립, 실패=울음, struggle=격려), 앱 아이콘도 "아픈/뚱한" mood로 동적 변경.
- **효과적 vs 논란**: Freeze·리그·마스코트 긍정 연출은 *가치를 동반*해 효과적. 반면 hearts 결제 유도·**유료 streak repair**는 deceptive.design에 **다크패턴 브랜드로 등재**된 심리 착취.

> **순공이 적용**: 차용 = Play-first 온보딩, Freeze(불안완화), 마스코트 mood=성과 연동(이미 보유). 거절 = 죄책감 알림·빨강하트 차감·유료 repair·hearts 상점.

### 1-B. SRS 코어 — Anki / Quizlet / Memrise (회독의 본질)

순공이는 "반복 복습으로 망각을 막는" 앱이다. 이 군은 **복습 큐·숙련도·리마인드를 어떻게 UI로 보여주는지**가 핵심.

- **Anki(정직한 도구형)**: 덱 진입 시 **New / Learning / Review 3색 정수 카운트** — "오늘 할 양"이 숫자로 즉시 노출. 세션은 카드 뒤집기 후 **자가채점 Again/Hard/Good/Easy 4버튼**으로 다음 간격 조정. 통계는 정답률 표·복습 forecast. streak·마스코트·보상 없음.
- **Quizlet(대중 게임화형)**: Learn 모드 **Memory Score**가 잊기 직전 항목 우선 노출. 카드별 **mastery level(숙련 단계)**, 라운드 진행바, "언제 다시 볼지" 안내. **Answer Streak**·achievements/badges·Match 리더보드.
- **Memrise(가든 메타포·돌봄 톤)**: 단어=씨앗, **복습=물주기**. 단기→장기기억 이동, 시든 꽃 다시 피우기 = **숙련도를 식물 상태로 은유 시각화**. **Daily Goal**+streak, 알림 카피가 **"Your Plants Need Watering!"** — 압박이 아닌 **돌봄·동반자 톤**(순공이가 참고할 모범).

> **회독앱 필수 SRS 패턴 TOP 5**: ① 오늘 복습 due를 **정수**로 노출 ② 회상 강도 자가채점 ③ 숙련도를 **정수 단계·은유**로(백분율 X) ④ 잊기 직전 우선 노출(적응형 큐) ⑤ 돌봄 톤 리마인드 + Daily Goal. — ①③은 순공이 **기억HP 0–5 정수** 노선과 정합.

### 1-C. 게임화 + 동반자 톤 — Brilliant / Finch / Habitica

- **Brilliant(게임화 STEM)**: streak·XP·League. 프리미엄 퍼널은 무료를 의도적으로 조임(하루 2 keys, 순차 진행 강제). 온보딩은 목표 묻는 **5–7문항 개인화 퀴즈**로 페이월 전 구매의도 적립(web-to-app).
- **Finch(셀프케어 펫 — 동반자 톤 교과서)**: 실제 태스크 완료가 펫에게 에너지를 주고 펫이 **생애 단계로 성장**. 아침 **mood 체크인** 후 펫이 탐험. 핵심: **off-day 페널티 0** — "missing a day doesn't punish you, your bird waits patiently." 성취 최적화가 아니라 **self-compassion** 중심.
- **Habitica(하드코어 습관 RPG — 거절 사례)**: Dailies 실패·보스 데미지로 **HP 손실, 0이면 death(레벨·장비·스탯 박탈)**. 파티원이 놓치면 **전원 추가 데미지**(사회적 죄책감). 빨강으로 짙어지는 누적 처벌. → 순공이 "협박/죄책감 거부"와 **정면 충돌 = 거절 레퍼런스**.

> **동반자 톤 차용 TOP 5**: ① 행동→마스코트 성장 루프(Finch) ② **비-처벌 빈상태** ③ mood 체크인 진입 ④ 개인화 온보딩 퀴즈(Brilliant) ⑤ 비-경쟁 보상 통화(꾸밈/해금).
> **거절(Habitica형)**: HP death·캐릭터 데미지, 파티 연좌, 빨강 누적 처벌, 하드 과금 게이팅, passive-aggressive 카피.

---

## 2. 현행 순공대장 인벤토리 (우리 측 기준)

스택: Next.js 15 + FSD 2.1 + Tailwind + shadcn + Supabase. 마스코트: 순공이(듀공). 출처: 코드베이스 직접 조사.

**화면**: 브랜드 히어로(랜딩) · 온보딩(3스텝: 생년→과목→사진 + 회독약속 reveal) · 홈 대시보드(StatsGrid 5박스) · 오늘의 회독(Today) · 회독 진행(Play) · 결과/보상 · 오답회수(Tier V1–V5) · 회독 캘린더(1/3/7/14일) · 저니(6단 등급 + NeuralMap) · 오답노트 · 그래프 · 일지.

**리텐션 기능 현황**:

| 기능 | 상태 | 비고 |
|---|---|---|
| 스트릭 | ✓ | Flame, 자동계산(어제→+1, 그외→1 리셋) — **Freeze 없음** |
| 기억 HP | ✓ | **0–5 정수**, Heart 아이콘 (백분율·하트게이지 아님) |
| 위험도 배지 | ✓ | 3단(여유/주의/위험), 소프트 컬러 |
| 보상/축하 연출 | ✓ | celebrate mood + XP 카운터 애니메이션 |
| 진척 시각화 | ✓ | JourneyNeuralMap + tier 진척% + StatsGrid |
| 마스코트 mood | ✓ | 5표정(cheer/celebrate/comfort/down/idle) 화면별 분기 |
| 넛지 배너 | △ | NudgeProvider 구조만, UI 미완 |
| 푸시/리마인드 | ✗ | Bell 버튼 UI 스텁만, 로직 미구현 |
| 빈 상태 | ✗ | 코드베이스에 없음 |
| 리그 | △ | 마케팅 카드만, 인앱 라우트 미연결 |
| 보스전/던전 | ✗ | 아이콘만 |

**게임화**: XP 6행동(20~80) · 등급 6단(순공입문→전설) · 뱃지 4단 · 게임성 강도 라이트(듀오링고 대비 -20dB, 다크RPG 지양).

---

## 3. 갭 비교표 — 레퍼런스 패턴 × 순공대장

✓ 있음 · △ 약함/부분 · ✗ 없음

| # | 레퍼런스 필수 패턴 | 근거 | 순공대장 | 갭 진단 |
|---|---|---|---|---|
| A | Play-first 온보딩(가입 후순위) | Duolingo | △ | 3스텝 온보딩 有, 가입 게이트 위치 점검 필요 |
| B | Streak + Freeze 짝(불안완화) | Duolingo | △ | streak 有, **Freeze 없음 → 끊기면 처벌형 리셋** |
| C | 가변보상 레이어링(리그/뱃지) | Duolingo·Quizlet | △ | XP·등급·뱃지 有, 리그는 마케팅만 |
| D | 마스코트 mood = 성과 연동 | Duolingo·Finch | ✓ | **이미 모범 수준** (5 mood 분기) |
| E | 진척 시각화(path/map) | Duolingo | ✓ | NeuralMap·tier% 보유 |
| F | 오늘 복습 due 큐 **정수** 노출 | Anki | △ | 위험퀘스트 카운트 有, "오늘 N개" 명확성 약함 |
| G | 회상 강도 자가채점 | Anki·Quizlet | ✗ | 정답/오답 이분만 — **MOAT 경계(§7)** |
| H | 숙련도 strength 시각화 | Quizlet·Memrise | △ | 기억HP 0–5 有, 단원별 숙련 단계 표시 약함 |
| I | 잊기 직전 우선 적응형 큐 | Anki·Quizlet·Memrise | ✓ | forgetting-top3·memory_defense 보유(**MOAT, 손대지 않음**) |
| J | 돌봄 톤 리마인드 + Daily Goal | Memrise | ✗ | 푸시 미구현, 넛지 provider만 |
| K | 행동→마스코트 성장 루프 | Finch | △ | mood 분기 有, "성장" 루프는 약함 |
| L | **비-처벌 빈 상태** | Finch | ✗ | **완전 미구현 — 최대 갭** |
| M | mood 체크인 진입 | Finch | ✗ | 없음 |
| N | 개인화 온보딩 퀴즈 | Brilliant | △ | 과목 선택 有, 목표/가치 맞춤은 약함 |
| O | 비-경쟁 보상 통화(꾸밈/해금) | Finch | ✗ | XP는 경쟁/등급용, 꾸밈형 통화 없음 |

**한눈 진단**: 순공이의 강점은 **D·E·I**(마스코트 mood·진척시각화·적응형 망각엔진). 가장 큰 공백은 **L(빈상태)·J(돌봄 리마인드)·B(Freeze)·F(due 큐 명확성)** — 모두 *코어 회독 루프는 그대로 두고 마감재만 더하는* 영역이라 브랜드 리스크가 낮다.

---

## 4. 제안 목록 (브랜드 유지 전제, 기능·플로우·UX만)

각 제안: 근거 · 예상 리텐션 임팩트 · 난이도 · 브랜드/게이트 정합. **색·로고·마스코트·토큰 교체 제안 0건.**

### P1 — 비-처벌 빈 상태(Empty State) 신설 〔최우선〕
- **무엇**: 첫 회독 전 / 오늘 큐 0건 / 오답 0건 상태에서 순공이가 *기다리는* 동반자 화면. "오늘은 쉬어도 괜찮아 — 순공이가 여기서 기다릴게" 톤(Finch "your bird waits patiently").
- **근거**: Finch 비-처벌 빈상태. **L 갭(최대 공백) 직접 해소.**
- **임팩트**: 高 — 첫 경험·복귀 마찰 제거는 D1 리텐션 직결.
- **난이도**: 低 — 신규 화면 1~3종, 기존 마스코트 mood(idle/cheer) 재사용.
- **정합**: ◎ §2-5 동반자 톤·§2-1 마스코트 mood 활용. 라이트 단일.

### P2 — 동반자 톤 회독 리마인드(푸시/넛지) 카피 시스템
- **무엇**: 미구현 푸시 + provider만 있는 넛지를 묶어 **돌봄 톤 리마인드**로. "○○단원에 물 줄 시간이래요"(Memrise "Plants Need Watering" 변형). 빈도·시점 가드 + **협박/죄책감/passive-aggressive 카피 금지**.
- **근거**: Memrise 돌봄 리마인드, Finch "just enough to help, never overwhelm". **J 갭 해소.**
- **임팩트**: 高 — D1/D7 리텐션의 핵심 레버.
- **난이도**: 中 — 푸시 인프라(권한·스케줄러) 필요.
- **정합**: ◎ 단, §3 거절 매트릭스(잦은 푸시·죄책감) 가드가 설계 전제. 카피 톤 검수 필수.

### P3 — 오늘 복습 due 큐 정수 노출 강화
- **무엇**: 홈 StatsGrid/Today에 **"오늘 회독 N개"**를 Anki식 정수 카운트(신규/복습중/오늘예정)로 명확화. 데이터는 이미 forgetting-top3로 존재 → **표시만** 추가.
- **근거**: Anki New/Learning/Review 3카운트. **F 갭 해소.** 기억HP 0–5 정수 노선과 정합.
- **임팩트**: 中–高 — "오늘 할 양"의 가시성이 착수율을 올림.
- **난이도**: 低 — 데이터 존재, UI 표시 위주.
- **정합**: ◎ §2-2 정수 위계. 백분율 금지 준수.

### P4 — 회독 보호권(Streak Freeze) — 동반자 변형
- **무엇**: streak이 끊겨도 순공이가 하루 막아주는 보호권. "어제 못 했네 — 순공이가 하루 막아뒀어" 톤. **무료 한정, 유료 repair·죄책감 연출 금지.**
- **근거**: 듀오링고 Freeze를 **분해 차용**(불안완화 메커니즘만, 과금·다크패턴은 버림). **B 갭 해소.**
- **임팩트**: 高 — 장기 리텐션의 검증된 레버(불안 완화).
- **난이도**: 中 — streak 계산 로직 확장.
- **정합**: ○ 게임성 강도 캡(홈30) 주의, 무료·동반자 톤 한정 시 §3 거절 회피.

### P5 — 단원별 숙련도(strength) 시각화
- **무엇**: 단원/주제별 숙련을 **정수 단계 또는 은유 상태**로 표시(Memrise 식물 성장 / Quizlet mastery). 기억HP 0–5 정수 체계의 단원 단위 확장.
- **근거**: Quizlet mastery·Memrise strength. **H 갭 강화.**
- **임팩트**: 中 — 진척 체감·복귀 동기.
- **난이도**: 中 — 단원별 집계 + 표시 컴포넌트.
- **정합**: ◎ **백분율 금지(§2-2)** — 정수/은유로만. 마스코트·식물 등급 신설은 금지(§ 마스코트 락)이니 *기존 기억HP 은유 내에서*.

### P6~P8 — 백로그 후보
- **P6 회상 강도 자가채점(Again/Hard/Good/Easy)** — Anki/Quizlet. soongong은 정답/오답 이분. **MOAT 경계(망각·문제생성 엔진 연동) → §7 상신 대상.** 임팩트 中, 난이도 中.
- **P7 Play-first 온보딩 게이트 점검** — 가입 게이트를 온보딩 *끝*으로(Duolingo). 임팩트 中, 난이도 中.
- **P8 mood 체크인 진입(Finch)** — 회독 시작 전 가벼운 기분 체크 → 마스코트 mood 연결. 임팩트 低–中, 난이도 中.

---

## 5. 차용 vs 거절 매트릭스 (브랜드 락 가드)

| 차용 ✅ (동반자 톤 유지) | 거절 ❌ (§3 위반 / 다크패턴) |
|---|---|
| Play-first 온보딩 (가치 먼저) | passive-aggressive 카피("You let Duo down") |
| Streak **Freeze**(불안완화, 무료) | **유료** streak repair / hearts 결제 유도 |
| 돌봄 톤 리마인드("물 줄 시간") | 빨강 하트 차감 / 잦은 압박 푸시 |
| 비-처벌 빈 상태(기다림) | HP death·캐릭터 데미지(Habitica) |
| due 큐 정수 노출 | 백분율·하트게이지 위계 |
| 숙련도 정수·은유 시각화 | 파티 연좌 데미지(사회적 죄책감) |
| 마스코트 mood=성과(이미 보유) | 아이템샵형 하드 과금 게이팅 |

순공대장은 현재 **오른쪽(거절) 패턴을 하나도 안 쓰고 있다** — 이 보고서의 제안은 전부 왼쪽(차용)에서, 색·마스코트·토큰을 건드리지 않고 **기능·플로우·UX 마감재**만 더하는 방향이다.

---

## 6. 순공이가 이미 잘하고 있는 것 (회귀 금지 항목)

- **마스코트 mood = 성과 연동** — 듀오링고/Finch 모범과 동급. 유지.
- **기억HP 0–5 정수** — SRS 군의 "정수 숙련도" 베스트프랙티스와 정합. 백분율/하트로 회귀 금지.
- **라이트 동반자 톤** — Habitica·듀오링고 다크패턴을 구조적으로 회피. 유지.
- 제안 채택 시에도 위 3개는 **고정 기준선**이며, 이를 깨는 변형은 거절 대상이다.

---

## 7. MOAT / 가드레일 노트 (에스컬레이션 분리)

- **MOAT(문제생성·온톨로지·망각엔진) 영역은 건드리지 않는다.** 갭표 G(자가채점)·I(적응형 큐)는 망각·문제생성 엔진과 직결 → **직접 제안 대상에서 제외**하고 발견 사항으로만 기록. P6(자가채점)은 채택 검토 시 **Orchestration Lead 경유 Mike 상신** 후 게임화 리드와 합의 필요.
- **게임성 강도 캡**: 모든 제안은 화면별 캡(홈30/회독20/결과50/오답던전60/리그70/4점보스80) 안에서. 특히 P4(Freeze)·P2(리마인드)는 홈/회독 저강도 화면이라 과한 연출 금지.
- **브랜드 락**: 색·로고·마스코트·토큰 교체 0건. 마스코트는 순공이(듀공) 고정, 식물 등급 신설 금지.

---

## 8. 출처

**Duolingo**: [Onboarding UX(userguiding)](https://userguiding.com/blog/duolingo-onboarding-ux) · [Streaks(deconstructoroffun)](https://duolingo.deconstructoroffun.com/mechanics/streaks) · [Streak 메커니즘(apptitude)](https://apptitude.io/blog/how-duolingos-streak-mechanic-actually-works/) · [Gamification(trophy.so)](https://trophy.so/blog/duolingo-gamification-case-study) · [Retention(trypropel)](https://www.trypropel.ai/resources/duolingo-customer-retention-strategy) · [passive-aggressive(debugger)](https://debugger.medium.com/duolingo-needs-to-chill-8f1832745ca0) · [다크패턴 등재(deceptive.design)](https://www.deceptive.design/brands/duolingo) · [Duo 디자인(design.duolingo.com)](https://design.duolingo.com/writing/duo)

**SRS**: Anki — [Deck Options](https://docs.ankiweb.net/deck-options.html) · [Studying](https://docs.ankiweb.net/studying.html) · [FSRS](https://faqs.ankiweb.net/what-spaced-repetition-algorithm) / Quizlet — [Spaced repetition](https://quizlet.com/gb/features/spaced-repetition) · [Answer Streaks](https://help.quizlet.com/hc/en-us/articles/40011154960653-Studying-with-Answer-Streaks) / Memrise — [Daily Goal](https://memrise.zendesk.com/hc/en-us/articles/360015888417) · [Classic Review/물주기](https://memrise.zendesk.com/hc/en-us/articles/360015887697) · [Plants Need Watering 리뷰](https://latg.org/plants-need-watering-review-of-memrise/)

**게임화/동반자**: Brilliant — [Pricing & Plans](https://brilliant.org/help/pricing-and-plans/) · [Onboarding(Savvy)](https://trysavvy.com/example/brilliant-onboarding) / Finch — [Google Play](https://play.google.com/store/apps/details?id=com.finch.finch&hl=en_US) · [Paste Magazine](https://www.pastemagazine.com/tech/finch/finch-app-mental-health-virtual-pet-self-care) · [Engadget](https://www.engadget.com/apps/this-self-care-virtual-pet-is-helping-me-get-my-act-together-160027169.html) / Habitica — [HP](https://habitica.fandom.com/wiki/Health_Points) · [Death Mechanics](https://habitica.fandom.com/wiki/Death_Mechanics)

> 인앱 푸시 카피 원문 일부는 리뷰 패러프레이즈 기반 — 정확 문구는 실제 앱 캡처가 SSoT. 순공대장 현황은 코드베이스 직접 조사.
