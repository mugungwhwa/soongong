# 순공대장 — UI Master Design Spec

**Spec version:** v1.0
**작성일:** 2026-05-18
**상태:** brainstorming 산출 → Mike 검토 대기
**관련 문서:**
- **(cross-link)** `01_제품_UX_게임화/순공대장_UI_설계.md` v2.3 — 디자인 토큰 16 hex + 컴포넌트 5종 + 화면 8개 SSoT
- **(cross-link)** `app_UI.png` / `web_ui.png` — 시안 SSoT (시안 우선 룰, CLAUDE.md §2)
- **(흡수)** `docs/visual-assets/2026-05-18-character-design-agent.md` — UI master **§4**로 이관, deprecate stub
- **(흡수)** `docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md` v1.1 §4 — UI master **§3**으로 이관, deprecate
- **(hook)** `docs/superpowers/plans/2026-05-18-soongong-mvp1-p0-demo-skeleton.md` — Day 1 토큰 lock 데드라인
- **(hook)** `docs/superpowers/plans/2026-05-14-soongong-mvp1-p5-home-quest-ui.md`, `…-p6-play-recovery-canvas.md`
- **(hook)** `docs/agent-strategy/2026-05-14-agent-tracks.md` v1.2 §3.2 (P0 / P5 / P6 행)

---

## §0. 목적·범위·SSoT 매핑

순공대장의 **디자인 시스템 + 캐릭터 production + UI 작업 에이전트 dispatch + 듀오링고 follow-up 리서치 자동화**를 한 cross-cut spec으로 통합한다.

### 0.1 왜 별도 spec인가
- UI 설계.md v2.3은 "**무엇을** 그릴지" 명세 (디자인 토큰/화면/컴포넌트). UI master는 "**어떻게** 그릴지" 명세 (에이전트 dispatch + 리서치 + 품질 게이트 + 상품화 기준).
- 캐릭터 에이전트 SSoT 240줄은 production 워크플로우 전용으로 분산되어 있었음. UI master 안에 흡수하면 **"디자인 = UI + 캐릭터" 단일 SSoT**.
- 직전 spec v1.1 §4 UI 리서치는 mini-workflow였는데 UI master scope에 자연스럽게 흡수.

### 0.2 Scope
- ✅ 상품화 기준 (정량 3 + 정성 5축)
- ✅ UI+캐릭터 에이전트 dispatch matrix
- ✅ 듀오링고 follow-up 리서치 자동화 워크플로우
- ✅ 마스코트 production 워크플로우 (GPT-4o, 12 sub-§)
- ✅ 컴포넌트 라이브러리 사용 가이드 (shadcn 9 + 커스텀 5)
- ✅ 모션/인터랙션 spec (Framer Motion 4 패턴)
- ✅ 통합 게이트 6종 + hook 지점

### 0.3 Out of Scope (다른 SSoT 위임)
- ❌ 디자인 토큰 정의 자체 (UI 설계.md §3 cross-link)
- ❌ 화면 8개 와이어프레임 (UI 설계.md §A-H + 시안 PNG)
- ❌ 실제 코드 구현 (P0/P5/P6 sub-plan)
- ❌ 마스코트 일러스트 production 자체 (§4 워크플로우 따라 Mike + GPT-4o)

### 0.4 SSoT 매핑 표
| 영역 | SSoT | 본 spec과의 관계 |
|---|---|---|
| 디자인 토큰 (16 hex + radius + shadow) | UI 설계.md v2.3 §3 + 시안 PNG | cross-link, 본 spec §5에서 사용 룰만 |
| 화면 8개 (A 온보딩 ~ H 오답회수) | UI 설계.md §A-H + 시안 PNG | cross-link |
| 컴포넌트 스타일 5종 (퀘스트카드/HP/배지/타임라인/통계) | UI 설계.md §7 | cross-link, 본 spec §5에 code-level 사용 가이드 |
| **마스코트 production** | **본 spec §4 (흡수)** | 캐릭터 SSoT는 deprecate stub |
| **UI 리서치 워크플로우** | **본 spec §3 (흡수)** | spec v1.1 §4 deprecate |
| 에이전트 dispatch | agent-tracks.md §3.2 + **본 spec §2** | 본 spec이 UI+캐릭터 전용 layer |

---

## §1. 상품화 기준 (Commercial-grade Definition)

### 1.1 정량 게이트 3종
| 게이트 | 기준 | 측정 도구 | 미달 시 |
|---|---|---|---|
| **시안 정합** | ≥ 85% | `pixelmatch` (`web_ui.png` vs 구현 페이지 스크린샷) + 수동 spot check | UI 보강 후 재측정 |
| **design-review 점수** | ≥ 80 (8대 패턴 합계 100점 기준) | `design-system:design-review` skill | UI 보강 후 재실행 |
| **베타 정성 평가** | 5명 "이거 듀오링고 같다" ≥ 70% | 5점 척도 + 4점 이상 비율 | 정성 5축 중 약한 축 보강 |

### 1.2 정성 5축
| 축 | 정의 | 검증 방법 |
|---|---|---|
| **일관성** | 컬러/타이포/spacing이 모든 화면에서 동일한가 | design-review 1대(Typography) + 2대(Color) + 4대(Layout) 패턴 |
| **친근감** | 마스코트 mood 변화 + 응원 톤이 일관 등장하는가 | §4 mascot mood 6종 사용처 매트릭스 |
| **즉시성** | CTA ≤50ms 시각 반응, 모션 60fps | Chrome DevTools Performance + iPhone 13 simulator |
| **안전감** | 오답/위험 표시가 위협 아닌 알림 톤인가 | DangerBadge 3종 컬러 채도 ≤60 검증 |
| **만족감** | XP/보상 시각화가 풍부 + 즉각적 | 결과 화면 confetti + XP 카운트업 모션 (§6.1) |

---

## §2. UI+캐릭터 에이전트 dispatch matrix

### 2.1 6단계 dispatch (sequential `→`, parallel `||`)
1. **리서치** (P0 Day 0-1 또는 직전) — `oh-my-claudecode:external-context` || `oh-my-claudecode:document-specialist` (병렬 수집) → `oh-my-claudecode:ccg` (Claude+Codex+Gemini 3-model 통찰)
2. **설계** (P0 Day 1-2) — `oh-my-claudecode:designer` + `feature-dev:code-architect`
3. **토큰 lock** (P0 Day 1 마감, **데드라인**) — `design-system:design-system` skill 가이드 + Mike OK → `tailwind.config.ts` + `tokens.css` commit
4. **구현** (P0 Day 2-7 + P5/P6) — `oh-my-claudecode:executor` + `vercel:react-best-practices` skill 참조
5. **캐릭터 production** (병렬, §4 워크플로우) — `character-design-agent` (Mike 작업 + Claude 가이드)
6. **폴리시 검수** (P0 Day 7 + P5/P6 종료) — `design-system:design-review` (≥80 게이트) + `oh-my-claudecode:qa-tester` (Playwright E2E + iPhone 13 60fps)

### 2.2 agent-tracks.md §3.2 hook 매트릭스
| §3.2 행 | 본 spec §2 단계 매핑 |
|---|---|
| **P0 Demo Skeleton** | 1-6 모두 (Day 0-7 트랙) |
| **P5 Home/Quest UI** | 4-6 (구현 + 검수) |
| **P6 Play/Recovery/Canvas** | 4-6 (구현 + 모션 60fps 게이트) |

---

## §3. 리서치 자동화 mini-workflow (spec v1.1 §4 흡수)

### 3.1 진입 트리거
**P0 킥오프 직전 또는 P0 Day 0-1과 병행**. **P0 Day 1 `tokens.css` 잠금이 데드라인**.

> ⚠️ **Retroactive trigger 룰**: 본 spec 머지 시점에 P0가 이미 진행 중(Day 1+)이면, 리서치 mini-workflow는 **즉시 발동**해서 Day 1에 잠긴 tokens.css가 reference deck 기반으로 정합한지 사후 점검 → 미정합 시 `tokens.css` 보정 PR로 catch-up. P0 진행을 막지는 않음.

### 3.2 산출물 (3종)
- `docs/ui-research/2026-MM-DD-duolingo-followup-deck.md` (5앱 deep-dive, `MM-DD`는 시작일에 확정)
- 디자인 토큰 lock PR (`apps/web/tailwind.config.ts` + `apps/web/src/shared/styles/tokens.css`)
- 패턴 catalog (5패턴 × 우리 차용 여부 + 근거)

### 3.3 5앱 reference 가중
| 앱 | 가중 | 차용 영역 |
|---|---|---|
| **듀오링고** (anchor) | 60% | 스트릭/XP/HP/마스코트/그린 톤/매일 3개 루프 |
| 카카오 헤이바이브 | 10% | 친근 마스코트 + 라이트 그린 톤 |
| 클래스101 | 10% | 학습 카드 + 진도 시각화 |
| Brilliant | 10% | 인터랙티브 학습 step UI |
| Memrise | 10% | spaced repetition UI 패턴 |

### 3.4 5패턴 catalog (차용 결정)
| 패턴 | 우리 차용? | 근거 |
|---|---|---|
| **Streak** | ✅ 100% | 듀오링고 핵심, 매일 진입 동기 |
| **XP** | ✅ 100% | 보상 시각화 |
| **Heart (HP)** | ✅ 변형 | 위협 X → 기억 HP, 그린 톤 (UI 설계.md §7-2) |
| **리뷰 카드** | ✅ 100% | 회독퀘스트 카드 (UI 설계.md §7-1) |
| **오답 복기 (V1-V5)** | ✅ 변형 | Memrise 패턴 + 우리 회독 변형 (오답_회수_모드.md) |

### 3.5 디스패치 순서
1. `external-context` || `document-specialist` (병렬 수집)
2. `ccg` (3-model 통찰, 1회)
3. `designer` (패턴 합성)
4. `design-system` (토큰 정렬 점검)
5. `design-review` (dry-run)
6. Mike 최종 OK → 토큰 PR 머지

### 3.6 fallback
1주 안 못 끝나면 reference **5 → 3** 축소 + 2일 어림 lock → P5 진입 강행.

---

## §4. 마스코트/캐릭터 production 워크플로우 (캐릭터 SSoT 흡수) ⭐

> 본 §은 `docs/visual-assets/2026-05-18-character-design-agent.md` 240줄을 흡수한 SSoT. 원본 파일은 §8 deprecate 처리 후 stub만 유지.

### 4.1 정체성 & 역할
| 항목 | 값 |
|---|---|
| 이름 | 순공이 캐릭터 디자인 에이전트 |
| 영문 ID | `character-design-agent` |
| 트랙 | 시각 자산 specialist (코드 sub-agent 아님) |
| 담당 | Mike (작업) + Claude (가이드·후처리·배포 매핑) |

**한 줄 미션**: 잠긴 결정사항(§4.2) 깨지 않고 일관된 순공이 자산을 GPT-4o로 생산·후처리·배포.

### 4.2 잠긴 결정사항 + 절대 금지

**잠긴 결정사항 11개:**
| 항목 | 값 |
|---|---|
| 모티프 | 듀공 (sea dugong), 라운드/통통/친근 |
| 컬러 (몸) | 민트 `#7CC97C` |
| 컬러 (배) | 연한 크림 (페일 옐로우 톤) |
| 컬러 (배경) | 크림 `#F8FBF7` 또는 투명 |
| 액세서리 | 노란 왕관 (소형, 머리 중앙) |
| 톤 | Light Study Garden, 카와이 스티커 |
| 레퍼런스 | 듀오링고 + 카카오 헤이바이브 + 클래스101 |
| 이미지 생성 | **GPT-4o (ChatGPT Plus)** |
| 투명화 | remove.bg (1st) / Canva (Pro 시) / rembg (자동화) |
| 사이즈 표준 | 1024 / 512 / 256 / 128 / 64 PNG |
| 비율 | 정사각형 1:1 |

**절대 금지 7개 (회귀 시 즉시 거절):**
- ❌ Dark RPG 톤 / 다크 네이비 / 어두운 색조
- ❌ "회독마왕" 같은 위협 캐릭터화
- ❌ 외주 발주 (작가 / 일러스트레이터)
- ❌ 토스 단일 reference 차용
- ❌ Midjourney 신규 생성 (v0.1만 보존, 신규는 GPT-4o)
- ❌ DALL-E 3 단독 (캐릭터 일관성 약함)
- ❌ 다른 마스코트로 갈아끼우기 (순공이 락)

### 4.3 입력 reference
| 파일 | 경로 | 해상도 | 역할 |
|---|---|---|---|
| 풀바디 | `docs/visual-assets/mascot-v0.1/main.png` | 1254×1254 RGB | 락 reference (**매 GPT-4o 생성 메시지에 첨부**) |
| 페이스 클로즈업 | `docs/visual-assets/mascot-v0.1/repeat_normal.png` | 1254×1254 RGB | 표정 클로즈업 보조 |

### 4.4 GPT-4o 워크플로우 (1세션 30-60분 5종 일괄)
```
1. ChatGPT Plus 새 세션 (GPT-4o)
2. mascot-v0.1/main.png 첨부 + base prompt (자산 인벤토리 §4.2) + 표정 변형부 (§4.3)
3. 결과 OK → PNG 다운, NOK → "왕관 더 작게" 식 1-2회 보정 (최대 3회 룰)
4. 같은 세션의 새 메시지에 main.png 재첨부 + 다음 표정 → 반복
5. 5종 완료 → docs/visual-assets/mascot-v0.2/ 저장
   파일명: soongong-{mood}.png (mood = celebrate / think / comfort / sleep / surprise)
6. Mike → Claude 알림 → §4.5-4.8 후처리·배포
```

**일관성 강제 3룰 + prompt 정확도 1룰 (v1.1):**
1. **매 생성마다 main.png 첨부** (세션 길어질수록 첨부 우선순위 감소 보정)
2. **잠긴 결정사항 명시** (인벤토리 §4.2 base prompt 그대로 사용)
3. **단일 세션 내 5종 연속** (세션 끊으면 캐릭터 어긋남)
4. **prompt에 "투명 배경 또는 정확히 `#F8FBF7` 단색 배경" 명시 필수** (v1.1 정정 — 자산 `#F7F4F2` vs 앱 `#F8FBF7` G−7 B−4 미세 색차로 사각형 노출 위험. main `2f3106d` 측정 근거)

**재시도 룰:**
- 한 표정에 3회 시도해도 일관성 안 맞으면 다음으로 넘기고 마지막에 재도전
- 한 표정 무한 재시도 금지 (시간 낭비)
- 세션 막판 캐릭터 드리프트 시 새 세션 (단, base prompt + main.png 그대로)

### 4.5 산출 자산 명세

**파일명 규칙:** `soongong-{mood}.png` — kebab-case, ASCII만.

| Mood | 우선순위 | 사용처 |
|---|---|---|
| `cheer` | 필수 | 홈 인사, 업로드 격려 (v0.1 main.png 대체 OK) |
| `celebrate` | 필수 | 회독 성공 결과 |
| `think` | 추천 | AI 분석 중 로딩 |
| `comfort` | 추천 | 오답 후 격려 |
| `sleep` | nice | Empty state |
| `surprise` | nice | 망각위험 알림 |

**사이즈 변형:** 원본 1254×1254 → 다운스케일 5단
- `soongong-{mood}-1024.png`
- `soongong-{mood}-512.png`
- `soongong-{mood}-256.png`
- `soongong-{mood}-128.png`
- `soongong-{mood}-64.png`

### 4.6 배포 경로 + 매핑 코드
```
apps/web/public/mascot/
  soongong-cheer.png
  soongong-cheer-512.png
  soongong-cheer-256.png
  …
```
매핑 코드: `apps/web/src/shared/ui/mascot.tsx`의 `MASCOT_SRC` 객체. placeholder 정책은 자산 인벤토리 §9 참조. P5 sub-plan 진입 시 placeholder 모두 제거.

### 4.7 품질 체크리스트 9개
mascot-v0.2/ 저장 전 확인:
- [ ] **캐릭터 일관성** — 5종 모두 같은 인물로 인식 (왕관 모양 / 눈 크기 / 지느러미 위치)
- [ ] **컬러 통일** — 민트 색조가 5종 사이 ±10% hex 범위 (Canva에서 일괄 보정 가능)
- [ ] **표정 인식성** — celebrate ≠ comfort ≠ surprise가 한눈에 구분
- [ ] **사이즈** — 1024 이상 정사각형
- [ ] **배경** — 단색 크림 또는 투명 (혼합 색 배경 금지)
- [ ] **알파 채널** — 투명 필요 슬롯(§4.8 매트릭스)이면 알파 정확
- [ ] **모서리·끝단** — 왕관 끝 / 지느러미 끝 잘림 없음
- [ ] **금지선** — Dark RPG 톤 / 다른 인물 변형 없음 (§4.2)
- [ ] **파일명** — kebab-case + ASCII

### 4.8 투명화 슬롯 매트릭스 7 슬롯

> ⚠️ **v1.1 정정 (main 2f3106d 흡수)**: 자산 배경 `#F7F4F2` vs 앱 토큰 `#F8FBF7` → G −7, B −4 미세 색차 → 사각형 미세 노출 위험. **전 슬롯 투명화 권장**으로 강등.

| UI 슬롯 | 배경 | 투명화 필요 |
|---|---|---|
| 홈 메인 일러스트 | 크림 | 권장 (자산 배경과 미세 색차) |
| 온보딩 인트로 | 크림 | 권장 (자산 배경과 미세 색차) |
| 회독퀘스트 카드 썸네일 | 흰/연민트 카드 | ✅ 필수 |
| 뱃지 / 리워드 아이콘 | 다양 | ✅ 필수 |
| 푸시 알림 아이콘 | 시스템 | ✅ 필수 |
| 앱 아이콘 | 시스템 | ✅ 필수 |
| 결과 화면 (콘페티 위) | 그라데이션 | ✅ 필수 |

→ **MVP 1차 기준 전 슬롯 투명화 1회**. GPT-4o prompt에 "투명 배경 또는 `#F8FBF7` 단색" 명시(§4.4 4번 룰)하면 후처리 부담 감소.

**도구 우선순위:**
1. **remove.bg** (무료 50회/월, 가입 불필요) — 1차 추천
2. **Canva BG Remover** (Canva Pro 보유 시) — 워크플로우 일치
3. **rembg** (Claude 자동화) — Mike가 5장 다운만 끝내면 폴더 일괄 처리 가능

### 4.9 진행 마일스톤
| 마일스톤 | 상태 | 일자 | 산출물 |
|---|---|---|---|
| **v0.1** 입수 자산 등재 | ✅ 완료 | 2026-05-18 | `mascot-v0.1/main.png` + `repeat_normal.png` (Midjourney, Mike 작업본) |
| **v0.1-alpha** 자동 투명화 (Pillow floodfill) | ✅ 부분 완료 | 2026-05-18 | `mascot-v0.1-alpha/main-alpha.png` (완벽, production 가능) + `repeat_normal-alpha.png` (belly 아래 1-2% 잔재, reference 용도) |
| **v0.2** GPT-4o 표정 5종 생성 | ⏳ Mike 진행 예정 | - | `mascot-v0.2/soongong-{celebrate,think,comfort,sleep,surprise}.png`. **prompt에 "투명 배경 또는 `#F8FBF7` 단색" 명시 필수 (§4.4 4번 룰)** |
| **v0.3** 투명화 + 5단 다운스케일 | 대기 (v0.2 의존) | - | 7 슬롯 × 5 사이즈 = 35장 (전 슬롯 권장으로 강등) |
| **v0.4** `apps/web/public/mascot/` 배포 | 대기 (v0.3 의존) | - | Next.js Image 컴포넌트 매핑 |
| **v1.0** P5 sub-plan `mascot.tsx` 완전 매핑 | 대기 (P5 진입 후) | - | 모든 placeholder 제거 |

### 4.10 팔로업 프로토콜

**트리거 문구 5개** (Mike → Claude 자동 §4 read):
- "캐릭터 디자인 에이전트"
- "캐릭터 에이전트"
- "마스코트 작업"
- "순공이 디자인"
- "마스코트 v0.2 / v0.3 / ..."

**Claude 시작 액션 4단계:**
1. UI master spec §4 read (sub-§ 12개 일독, 토큰 ~3K)
2. §4.9 진행 현황 표에서 현재 마일스톤 확인
3. 다음 미달 마일스톤의 작업 모드 진입:
   - **v0.2 대기 중** → Mike에게 GPT-4o 세션 가이드 + base prompt 즉시 제공
   - **v0.2 도착** → §4.7 품질 체크 + §4.8 투명화 + rembg 자동화
   - **v0.3 완료** → mascot.tsx 매핑 + P5 sub-plan 연결
4. 잠긴 결정사항(§4.2) 위반 시도 → 즉시 거절 + §4.2 인용

### 4.11 외부 도구 의존성
| 도구 | 비용 | 누가 | 비고 |
|---|---|---|---|
| **ChatGPT Plus** | $20/월 (Mike 보유 추정) | Mike | GPT-4o 이미지 생성, 한국어 prompt |
| **remove.bg** | 0원 (월 50회 무료) | Mike | 가입 불필요, 드래그·다운로드 |
| **Canva** (Pro 옵션) | $14.99/월 | Mike | 사이즈 변형 + 컬러 통일 + (옵션) BG Remover |
| **rembg** (Python) | 0원 | Claude | 일괄 자동화. `pip install rembg` |
| **ImageMagick** | 0원 | Claude | 사이즈 다운스케일 자동화. `brew install imagemagick` |

### 4.12 Cross-link (캐릭터 production 외부 SSoT)
- `docs/visual-assets/2026-05-14-soongong-asset-inventory.md` — 자산 인벤토리 백서 (§3 mood 6종 표 + §4 GPT-4o base prompt + §7 저장 구조 + §9 placeholder 정책)
- P5 sub-plan — `mascot.tsx` 슬롯 명세, 사용처 매트릭스
- UI 설계.md v2.3 §3 (컬러 토큰) + §6 (마스코트 명세)
- CLAUDE.md §2 (잠긴 결정사항)

---

## §5. 컴포넌트 라이브러리 사용 가이드

### 5.1 shadcn 9종 (P0 install)
| 컴포넌트 | 주 사용처 |
|---|---|
| `Button` | CTA / 액션 |
| `Card` | 통계 / 퀘스트 컨테이너 |
| `Dialog` | 업로드 모달 / 결과 모달 |
| `Input` | 텍스트 입력 (OCR 보정 등) |
| `Select` | 과목 / 난이도 |
| `Avatar` | 사용자 프로필 |
| `Badge` | 위험도 / 등급 |
| `Progress` | 회독 진도 / HP 게이지 |
| `Toast` | 보상 알림 |

### 5.2 커스텀 5종 (UI 설계.md §7 → code spec)

**QuestCard** (`apps/web/src/shared/ui/quest-card.tsx`)
| 속성 | 값 |
|---|---|
| 카드 배경 | `#FFFFFF` |
| radius | 20px |
| shadow | `0 2px 8px rgba(0,0,0,0.06)` |
| 번호 동그라미 | 32x32, 민트 fill (`#7CC97C`), 흰 숫자 |
| 배지 | radius 999 pill, text 12px, padding 4/10 |
| 난이도 칩 | 흰 fill + 옅은 그린 테두리 |
| CTA | 메인 그린 fill (`#7CC97C`), radius 16, height 48 |

**HPBar** (기억 HP, `apps/web/src/shared/ui/hp-bar.tsx`)
- 하트 메인 그린 톤 (붉은 하트 금지 — 위협감 줄임)
- "5/5" 숫자 강조, "기억 HP" 라벨 보조
- 풀로 차면 라임 fill (`#B8E5A4`), 닳을수록 회색

**DangerBadge** (망각위험 3종, `apps/web/src/shared/ui/danger-badge.tsx`)
| 종류 | bg | text |
|---|---|---|
| 망각위험 높음 | `#FCE8E8` | `#E85C5C` |
| 오늘 회독퀘스트 권장 | `#FFF1DF` | `#C77A3A` |
| 안정권 | `#E6F0FC` | `#4A7FBF` |
- pill radius 999, 작은 원형 점 + 텍스트, 소프트 톤 (채도 ≤ 60)

**StreakTimeline** (회독 타임라인, `apps/web/src/shared/ui/streak-timeline.tsx`)
| 노드 | 스타일 |
|---|---|
| 완료 (D1/D3) | 민트 fill |
| 오늘 (D7) | 골드 ring (`#F5C242`) + 라임 fill |
| 예정 (D14) | 회색 outline |

**StatsCard** (통계 카드 4종, `apps/web/src/shared/ui/stats-card.tsx`)
- 4-card 가로 (스트릭 / HP / 순공시간 / XP+등급)
- 모바일 2x2 wrap
- 아이콘 + 큰 숫자 + 작은 라벨

### 5.3 사용 룰
- 모든 hex는 `tailwind.config.ts` 토큰에서만 (직접 hex 금지, `pnpm lint:tokens` 게이트)
- import 경로: `apps/web/src/shared/ui/`
- TypeScript strict + `pr-review-toolkit:type-design-analyzer` 통과
- code snippet은 P5 sub-plan 구현 시 task 단위로 추가 (본 §은 사용 룰 + spec만 잠금)

---

## §6. 모션/인터랙션 spec

### 6.1 Framer Motion 패턴 카탈로그 4개
| 패턴 | 트리거 | 지속 | 스타일 |
|---|---|---|---|
| **XP 카운트업** | 결과 화면 진입 | 1000ms | ease-out, 0 → +N |
| **마스코트 mood 전환** | mood prop 변경 | 200ms | fade + scale 0.95 → 1 |
| **카드 호버** (web) | hover | 150ms | `translateY(-2px)` + shadow boost |
| **결과 confetti** | 정답 시 | 1500ms | 30 particle, 3색 (민트/골드/라임) |

### 6.2 인터랙션 시간 표
| 인터랙션 | 시간 | 비고 |
|---|---|---|
| CTA 시각 반응 | ≤ 50ms | haptic feedback simulation (visual only) |
| 모달 open/close | 250ms | ease-out / ease-in |
| 토스트 in/out | 300ms | slide + fade |
| 페이지 전환 | 200ms | fade |

### 6.3 게이트
- iPhone 13 simulator **60fps 유지** (Chrome DevTools Performance)
- Lighthouse **INP < 200ms** (Interaction to Next Paint)

### 6.4 fallback
tldraw + Framer Motion 동시 → 60fps 미달 → **confetti 제거**, XP 카운트업만 유지 (P0 sub-plan §0.1 위험 시나리오 일치).

---

## §7. 통합 게이트 + hook 지점

### 7.1 6 게이트 (모두 통과 시 UI master 본 spec 머지 가능)
| G | 게이트 | 기준 | 측정 | hook 지점 |
|---|---|---|---|---|
| **G1** | 상품화 | §1 정량 3 (≥85% / ≥80 / ≥70%) | pixelmatch + design-review + 베타 평가 | P5 종료 시 |
| **G2** | 디자인 토큰 lock | `pnpm lint:tokens` 통과 + 시안 정합 | `pnpm lint:tokens` + 수동 | **P0 Day 1 데드라인** |
| **G3** | 컴포넌트 14종 (shadcn 9 + 커스텀 5) type-safe + design-review pass | strict TS + design-review pass | `pnpm tsc` + design-review skill | P0 Day 7 / P5 |
| **G4** | 모션 60fps + INP < 200ms | iPhone 13 simulator | DevTools Performance + Lighthouse | P6 종료 시 |
| **G5** | 리서치 deck + 패턴 catalog | 5앱 deep-dive + 5패턴 정의 | Mike OK | **P0 Day 0-1** |
| **G6** | 캐릭터 v0.2 mood 5종 | §4.7 품질 체크 9/9 | §4.7 체크리스트 | 캐릭터 v0.2 마일스톤 |

### 7.2 Phase별 발동 게이트 매트릭스
| Phase | 발동 게이트 |
|---|---|
| P0 Day 0-1 | G2 (토큰 lock), G5 (리서치) |
| P0 Day 7 | G3 (컴포넌트), G4 일부 (E2E 모션 점검) |
| P5 진입 | G1 정성 5축 reference |
| P5 종료 | G1 정량 3, G3 |
| P6 종료 | G4 (60fps + INP) |
| 캐릭터 v0.2 | G6 |

---

## §8. Deprecate 마킹 (이관 안내)

본 spec 머지 후 다음 4건 처리 (별도 PR 또는 writing-plans 첫 milestone):

| 파일 | 처리 | 변경 내용 |
|---|---|---|
| `docs/superpowers/specs/2026-05-18-eval-review-ui-research-design.md` v1.1 | **v1.2 minor bump** | §4 첫 줄에 *"본 §은 UI master spec §3으로 흡수 이관됨"* 추가 + 변경 이력 v1.2 entry |
| `docs/visual-assets/2026-05-18-character-design-agent.md` | **deprecate stub** | 240줄 → ~30줄 stub. 상단에 *"본 문서는 UI master spec §4로 이관됨 (DEPRECATED)"* + 링크 + §8 진행 마일스톤 표만 유지 |
| `CLAUDE.md` §5 | **경로 갱신** | UI master spec 추가, 캐릭터 SSoT 옆 `DEPRECATED` 표시 + §9 변경 이력 v1.2 entry |
| `docs/agent-strategy/2026-05-14-agent-tracks.md` §11 (cross-link 섹션) | **링크 갱신** | 캐릭터 SSoT → UI master spec §4로 가는 link 추가 + §12 변경 이력 v1.3 entry |

---

## §9. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-18** | **초안. cross-cut UI master spec. 10 §. (a) 캐릭터 SSoT 240줄 흡수(§4) (b) spec v1.1 §4 UI 리서치 흡수(§3) (c) 신규: §1 상품화 기준(정량 3 + 정성 5) + §2 에이전트 dispatch 6단계 + §5 컴포넌트 가이드(shadcn 9 + 커스텀 5) + §6 모션 spec(Framer 4 패턴) + §7 통합 게이트 6종. UI 설계.md v2.3 + 시안 PNG는 cross-link.** |
| **v1.1** | **2026-05-18** | **main 2f3106d 정정 흡수: §4.4에 prompt 룰 4번(투명 배경 또는 `#F8FBF7` 명시) 추가, §4.8 매트릭스 전 슬롯 투명화 권장으로 정정(자산 `#F7F4F2` vs 앱 `#F8FBF7` G−7 B−4 미세 색차 근거), §4.9에 v0.1-alpha 자동 투명화 마일스톤 추가.** |
| **v1.2** | **2026-06-16** | **팔레트 SSoT 교체 반영: 디자인 토큰 색 팔레트 Ocean → v2 Teal/Mint(`#A8DCCB`/`#7BC4AE`/`#4CAF88`) 확정(SOO-260616-01, Mike 명시 승인). 상세는 `design-system-lock` v2.0 / `design-tokens.md` v1.1.** |

---

> **다음 단계**: Mike 검토 → `superpowers:writing-plans` 스킬로 implementation plan 작성. plan은 §8 deprecate 처리 + 리서치 deck 생성 + 토큰 매핑 + 캐릭터 v0.2 트리거 등을 task로 분해.
