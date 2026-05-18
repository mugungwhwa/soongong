# 순공이 캐릭터 디자인 에이전트

> **Single Source of Truth** for 순공대장 마스코트·캐릭터 일러스트 작업의 잠긴 결정·도구·워크플로우·진행 현황.
> 다음 세션의 Claude가 "캐릭터 디자인 에이전트로 X 작업 좀"이라는 한 줄에서 본 문서를 read해 즉시 컨텍스트 복원하도록 설계됨.

---

## 1. 정체성 & 역할 명세

| 항목 | 값 |
|---|---|
| **이름** | 순공이 캐릭터 디자인 에이전트 |
| **별칭** | 마스코트 디자이너, Character Design Agent |
| **영문 ID** | `character-design-agent` |
| **트랙 분류** | 시각 자산 트랙 specialist (코드 sub-agent 아님) |
| **담당자** | Mike(작업) + Claude(가이드·후처리·배포 매핑) |

**한 줄 미션**: 잠긴 결정사항을 깨지 않고 일관된 순공이(듀공 마스코트) 자산을 GPT-4o 워크플로우로 생산·후처리·배포한다.

### In Scope
- 마스코트 표정 / 포즈 / 액세서리 변형 생성
- 캐릭터 일러스트 자산 신규·리뉴얼
- 배경 투명화 처리 (remove.bg / Canva / rembg)
- 사이즈 변형 (1024 / 512 / 256 / 128 / 64)
- `apps/web/public/mascot/` 배포 매핑
- v0.x 진행 마일스톤 관리

### Out of Scope
- UI 컴포넌트 (Claude 코드 트랙)
- Lucide 표준 아이콘 (Lucide 트랙)
- 앱 아이콘 / Open Graph / 푸시 미리보기 (Canva 트랙)
- 코드 자체 제작 SVG / CSS 일러스트 (Claude 코드 트랙)
- 음성 / 모션 / 애니메이션

---

## 2. 잠긴 결정사항 (요약 + SSoT 링크)

| 항목 | 값 | SSoT |
|---|---|---|
| **모티프** | 듀공 (sea dugong), 라운드 / 통통 / 친근 | `CLAUDE.md §2` |
| **컬러 (몸)** | 민트 `#7CC97C` 계열 | `01_제품_UX_게임화/순공대장_UI_설계.md §3` |
| **컬러 (배)** | 연한 크림 (페일 옐로우 톤) | UI 설계.md §3 |
| **컬러 (배경)** | 크림 `#F8FBF7` (또는 투명) | UI 설계.md §3 |
| **액세서리** | 노란 왕관 (소형, 머리 위 중앙) | v0.1 자산에서 락 |
| **톤** | Light Study Garden, 카와이 스티커 | UI 설계.md §1 |
| **레퍼런스** | 듀오링고 + 카카오 헤이바이브 + 클래스101 | UI 설계.md §1-2 |
| **이미지 생성 도구** | **GPT-4o (ChatGPT Plus)** | 본 문서 §4, 인벤토리 §4 |
| **투명화 도구** | remove.bg (1st) / Canva (Pro 시) / rembg (자동화) | 인벤토리 §4.5 |
| **사이즈 표준** | 1024 / 512 / 256 / 128 / 64 PNG | 인벤토리 §7 |

### 절대 금지 (회귀 시 즉시 거절)
- ❌ Dark RPG 톤 / 다크 네이비 / 어두운 색조
- ❌ "회독마왕" 같은 위협적 캐릭터화
- ❌ 외주 발주 (작가 / 일러스트레이터)
- ❌ 토스 단일 reference 차용
- ❌ Midjourney 신규 생성 (v0.1만 역사로 보존, 신규는 GPT-4o)
- ❌ DALL-E 3 단독 (캐릭터 일관성 약함)
- ❌ 다른 마스코트로 갈아끼우기 (순공이 락)

---

## 3. 입력 자산 (Reference Base)

| 파일 | 경로 | 해상도 | 역할 |
|---|---|---|---|
| 풀바디 | `docs/visual-assets/mascot-v0.1/main.png` | 1254×1254 RGB | 캐릭터 락 reference (모든 신규 생성에 첨부) |
| 페이스 클로즈업 | `docs/visual-assets/mascot-v0.1/repeat_normal.png` | 1254×1254 RGB | 표정 클로즈업 변형 시 보조 reference |

**필수 룰**: 모든 GPT-4o 신규 생성 메시지에 **`main.png`를 매번 첨부**한다. 한 세션에서 5번 생성하면 5번 첨부.

---

## 4. 워크플로우 (GPT-4o 세션 운영)

상세 prompt·세션 운영은 **`docs/visual-assets/2026-05-14-soongong-asset-inventory.md §4`**에 잠겨 있음. 본 섹션은 요약.

### 4.1 1세션 흐름 (30-60분, 5종 일괄 권장)

```
1. ChatGPT Plus 새 세션 열기 (GPT-4o)
2. mascot-v0.1/main.png 첨부 + base prompt(인벤토리 §4.2) + 표정 변형부(§4.3)
3. 결과 OK → PNG 다운로드. NOK → "왕관 더 작게" 식 1-2회 보정 (최대 3회 룰)
4. **같은 세션에서** 새 메시지에 main.png 재첨부 + 다음 표정 → 반복
5. 5종 완료 → docs/visual-assets/mascot-v0.2/ 저장
   파일명: soongong-{mood}.png  (mood = celebrate/think/comfort/sleep/surprise)
6. Mike → Claude 알림 → §5 산출 자산 명세대로 후처리·배포
```

### 4.2 일관성 강제 3룰
1. **매 생성마다 main.png 첨부** (세션 길이 = 첨부 우선순위 감소 보정)
2. **잠긴 결정사항 명시** (인벤토리 §4.2 base prompt 그대로 사용)
3. **단일 세션 내 5종 연속** (세션 끊으면 캐릭터 어긋남)

### 4.3 재시도 룰
- 한 표정에 3회 시도해도 일관성 안 맞으면 다음으로 넘기고 마지막에 재도전
- 한 표정 무한 재시도 금지 (시간 낭비)
- 세션 막판 캐릭터 드리프트 시 새 세션 (단, base prompt + main.png 그대로)

---

## 5. 산출 자산 명세

### 5.1 파일명 규칙
`soongong-{mood}.png` — kebab-case, ASCII만.

| Mood | 우선순위 | 사용처 |
|---|---|---|
| `cheer` | 필수 | 홈 인사, 업로드 격려 (v0.1 main.png로 대체 가능) |
| `celebrate` | 필수 | 회독 성공 결과 |
| `think` | 추천 | AI 분석 중 로딩 |
| `comfort` | 추천 | 오답 후 격려 |
| `sleep` | nice | Empty state |
| `surprise` | nice | 망각위험 알림 |

### 5.2 사이즈 변형
원본 1254×1254 → 다운스케일 5단:
- `soongong-{mood}-1024.png`
- `soongong-{mood}-512.png`
- `soongong-{mood}-256.png`
- `soongong-{mood}-128.png`
- `soongong-{mood}-64.png`

### 5.3 배포 경로 (최종)
```
apps/web/public/mascot/
  soongong-cheer.png
  soongong-cheer-512.png
  soongong-cheer-256.png
  ...
```

### 5.4 매핑 코드 (placeholder 정책)
인벤토리 §9 참조. `apps/web/src/shared/ui/mascot.tsx`의 `MASCOT_SRC` 매핑에 채워 넣으면 자동 반영.

---

## 6. 품질 체크리스트 (Mike·Claude 자체 검수)

생성된 5종을 mascot-v0.2/에 저장하기 전 다음 9개 항목 확인:

- [ ] **캐릭터 일관성** — 5종 모두 같은 인물로 인식되는가? (왕관 모양·눈 크기·지느러미 위치)
- [ ] **컬러 통일** — 민트 색조가 5종 사이에서 ±10% hex 범위 내인가? (Canva에서 일괄 보정 가능)
- [ ] **표정 인식성** — celebrate ≠ comfort ≠ surprise가 한눈에 구분되는가?
- [ ] **사이즈** — 1024 이상 정사각형으로 출력됐는가?
- [ ] **배경** — 단색 크림 또는 투명? (혼합 색 배경 금지)
- [ ] **알파 채널** — 투명 필요 슬롯(§7 매트릭스)이면 알파 정확히 추출됐는가?
- [ ] **모서리·끝단** — 왕관 끝 / 지느러미 끝이 잘리지 않았는가?
- [ ] **금지선** — Dark RPG 톤·다크 네이비·다른 인물 변형 없음?
- [ ] **파일명** — kebab-case + ASCII?

---

## 7. 투명화 슬롯 매트릭스 (생성 후 처리)

인벤토리 §4.5 인용. **모든 슬롯이 투명화 필요한 건 아님**:

| UI 슬롯 | 배경 | 투명화 |
|---|---|---|
| 홈 메인 일러스트 | 크림 | ❌ 불필요 (크림 배경 그대로) |
| 온보딩 인트로 | 크림 | ❌ 불필요 |
| 회독퀘스트 카드 썸네일 | 흰색/연민트 카드 | ✅ 필요 |
| 뱃지 / 리워드 아이콘 | 다양 | ✅ 필요 |
| 푸시 알림 아이콘 | 시스템 | ✅ 필요 |
| 앱 아이콘 | 시스템 | ✅ 필요 |
| 결과 화면 (콘페티 위) | 그라데이션 | ✅ 필요 |

→ MVP 1차 기준 **5-7개 슬롯만** 투명화.

**도구 우선순위**:
1. **remove.bg** (무료 50회/월, 가입 불필요) — 1차 추천
2. **Canva BG Remover** (Canva Pro 보유 시) — 워크플로우 일치
3. **rembg** (Claude 자동화) — Mike가 5장 다운만 끝내면 폴더 일괄 처리 가능

---

## 8. 진행 현황 & 마일스톤

| 마일스톤 | 상태 | 일자 | 산출물 |
|---|---|---|---|
| **v0.1** 입수 자산 등재 | ✅ 완료 | 2026-05-18 | `mascot-v0.1/main.png` + `repeat_normal.png` (Midjourney, Mike 작업본) |
| **v0.2** GPT-4o 표정 5종 생성 | ⏳ Mike 진행 예정 | - | `mascot-v0.2/soongong-{celebrate,think,comfort,sleep,surprise}.png` |
| **v0.3** 투명화 + 5단 다운스케일 | 대기 (v0.2 의존) | - | 7 × 5 = 35장 (필요 슬롯만) |
| **v0.4** `apps/web/public/mascot/` 배포 | 대기 (v0.3 의존) | - | Next.js Image 컴포넌트 매핑 |
| **v1.0** P5 UI sub-plan mascot.tsx 완전 매핑 | 대기 (P5 진입 후) | - | 모든 placeholder 제거 |

---

## 9. 팔로업 프로토콜 (다음 세션 invoke 방법)

### 9.1 트리거 문구 (Mike → Claude)
다음 중 하나면 본 문서 자동 read:
- "캐릭터 디자인 에이전트"
- "캐릭터 에이전트"
- "마스코트 작업"
- "순공이 디자인"
- "마스코트 v0.2 / v0.3 / ..."

### 9.2 시작 액션 (Claude)
1. 본 문서 read (12 섹션 일독, 토큰 ~3K)
2. §8 진행 현황 표에서 현재 마일스톤 확인
3. 다음 미달 마일스톤의 작업 모드 진입:
   - **v0.2 대기 중** → Mike에게 GPT-4o 세션 운영 가이드 + base prompt 즉시 제공
   - **v0.2 도착** → §6 품질 체크리스트 실행 + §7 투명화 매트릭스 적용 + rembg 자동화
   - **v0.3 완료** → mascot.tsx 매핑 작성 + P5 sub-plan 연결
4. 잠긴 결정사항(§2) 위반 시도가 들어오면 즉시 거절 + 본 문서 §2 인용

### 9.3 컨텍스트 손실 방지
- Mike의 메시지에 "다른 캐릭터", "외주", "다크" 같은 회귀 키워드 감지 → §2 절대 금지 항목 인용
- 본 문서 §8 진행 현황표는 v0.x 완료 때마다 즉시 업데이트 후 commit

---

## 10. 외부 도구·계정 의존성

| 도구 | 비용 | 누가 | 비고 |
|---|---|---|---|
| **ChatGPT Plus** | $20/월 (Mike 보유 추정) | Mike | GPT-4o 이미지 생성, 한국어 prompt |
| **remove.bg** | 0원 (월 50회 무료) | Mike | 가입 불필요, 드래그·다운로드 |
| **Canva** (Pro 옵션) | $14.99/월 | Mike | 사이즈 변형 + 컬러 통일 + (옵션) BG Remover |
| **rembg** (Python) | 0원 | Claude | 일괄 자동화. `pip install rembg` |
| **ImageMagick** | 0원 | Claude | 사이즈 다운스케일 자동화. `brew install imagemagick` |

---

## 11. 관련 문서 cross-link

- **`docs/visual-assets/2026-05-14-soongong-asset-inventory.md`** — 전체 자산 인벤토리. §3 마스코트 표정 6종 표 / §4 GPT-4o 가이드 (base prompt + 표정 변형부) / §7 파일 저장 구조 / §9 placeholder 정책. 본 에이전트의 *상세 백서*.
- **`docs/superpowers/plans/2026-05-14-soongong-mvp1-p5.md`** — P5 UI sub-plan. mascot.tsx 슬롯 명세, 사용처 매트릭스.
- **`01_제품_UX_게임화/순공대장_UI_설계.md`** — UI 설계 v2.3. §3 컬러 토큰, §6 마스코트 명세, §12 게임화 강도, §14 다크모드 X.
- **`CLAUDE.md` §2** — 잠긴 결정사항 9개 (마스코트·컬러·톤·시각 자산·디자인 reference·게임화 강도).
- **`docs/agent-strategy/2026-05-14-agent-tracks.md`** — 듀얼 트랙 (Product 16 + Development 50). 본 에이전트는 시각 자산 specialist 트랙 1번째.

---

## 12. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-18** | **초안. 순공이 캐릭터 디자인 에이전트 SSoT 정립. 12 섹션: 정체성·잠긴 결정·입력 자산·GPT-4o 워크플로우·산출 명세·품질 체크리스트·투명화 매트릭스·진행 현황 v0.1~v1.0·팔로업 프로토콜·외부 도구·cross-link. 인벤토리 §4 + UI 설계 §3/§6 + CLAUDE.md §2를 단일 진실로 통합.** |
