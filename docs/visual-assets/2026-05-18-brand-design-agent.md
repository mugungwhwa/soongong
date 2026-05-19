# 순공대장 — 브랜드 디자인 에이전트 (Brand Agent) SSoT v0.0

> 본 문서는 순공대장 브랜드 식별 자산(로고·OG image·favicon·앱 아이콘)을 일관되게 생성·운영하기 위한 단일 진실 공급원(SSoT). Mike + Claude 협업 시 다음 세션이 한 줄 트리거로 즉시 작업 모드 진입 가능하도록 설계.

> 자매 에이전트: `2026-05-18-character-design-agent.md` (마스코트/캐릭터 전담). 본 문서는 캐릭터 외 모든 브랜드 식별 자산을 담당.

---

## 1. 정체성 & 역할 명세

**"브랜드 에이전트" = 순공대장의 브랜드 식별 자산을 디자인·관리하는 협업 역할**

- **호출자**: Mike (전체 결정), Claude (도구·문서·자동화)
- **도구**: GPT-4o(ChatGPT Plus) + Canva (Free), 외주 0
- **산출 톤**: Light Study Garden — `tokens.css` + UI 설계.md §1-3 정합
- **연계 에이전트**: `[[character-design-agent]]` (마스코트 자산 공급), `[[design-review]]` (적용 후 일관성 검증)

### In Scope

- **로고** (메인 식별, 한글+영문)
- **OG image** (SNS 공유 카드 1200x630)
- **Favicon** (32/64/96 ico/png)
- **앱 아이콘** (PWA 192/512)
- **README 헤더** (선택, GitHub repo 첫인상)
- **소셜 미디어 프로필 이미지** (Twitter/Instagram 400x400, 추후)
- **간이 브랜드 가이드 1-pager** (컬러/타이포/로고 사용 규칙)

### Out of Scope

- 캐릭터(순공이) 자체 디자인 → `character-design-agent`
- UI 컴포넌트 디자인 → 코드 + `design-review` 스킬
- 게임화 일러스트 (배지/메달/스티커) → P5+ 별도 트랙
- 인쇄물·굿즈 → MVP 이후

---

## 2. 잠긴 결정사항 (요약 + SSoT 링크)

| 항목 | 값 | 근거 |
|---|---|---|
| 로고 구성 | 마스코트(순공이) + 텍스트 | Mike 2026-05-18 결정 (Duolingo 패턴 차용) |
| 텍스트 메인 | "순공대장" (한글 Pretendard SemiBold/Bold) | 수능생 시장 명확, SparkClaw 심사관 직관 |
| 텍스트 보조 | "Soongong" (영문, 작게 또는 1-line below) | 글로벌 확장 여지 |
| 톤 | Light Study Garden (Dark 폐기) | UI 설계.md §1, character-design-agent §2 |
| 베이스 컬러 | `#F8FBF7` 크림 (배경) | tokens.css `--color-bg-default` |
| 강조 컬러 | `#7CC97C` 민트 (primary) | tokens.css `--color-mint-500` |
| 텍스트 컬러 | `#1A2A1A` (한글), `#2D3F2D` (영문) | tokens.css `--color-text-strong/default` |
| XP/포인트 컬러 | `#F2C94C` (soft golden) | tokens.css `--color-xp` (Duolingo `#ffc800` 차별) |
| 폰트 (로고·브랜드 헤딩) | **Rockon Ultra Bold 둥근체** | Mike 지정 (2026-05-19). 듀오링고/한국 학습앱 톤의 라운드 굵은 한글 디스플레이 폰트 |
| 폰트 (본문·UI) | Pretendard (한글+영문) | tokens.css 등록, P0 와꾸 코드 wiring 완료. 로고에는 사용 X |
| 자산 SSoT 파일명 | `master/logo-{variant}.png` 1024x1024 | 본 문서 §5 |

### 절대 금지 (회귀 시 즉시 거절)

- **다크모드/네이비 로고**: 라이트 단일 잠금 (lint:no-dark 게이트 동일 원칙)
- **토스 anchor 디자인**: 단순 미니멀리즘 차용 금지 (feedback_design_anchoring 룰)
- **외주 발주**: Mike GPT-4o + Canva 직접 (feedback_no_outsourcing 룰)
- **다른 마스코트 캐릭터**: 순공이(듀공) 단일
- **회독마왕/Dark RPG**: 폐기된 방향 (CLAUDE.md §2 잠긴 결정)
- **로고에 Pretendard 사용**: 로고/브랜드 헤딩 = Rockon Ultra Bold 둥근체 단독. Pretendard는 본문·UI 전용.
- **본문에 Rockon 사용**: 본문·UI = Pretendard 단독. Rockon은 로고/대형 헤딩 전용.
- **그 외 폰트 패밀리 도입**: Inter/Noto/Roboto/G마켓산스 등 X

---

## 3. 입력 자산 (Reference Base)

### 3.1 캐릭터 자산
- `apps/web/public/mascot/main.png` (1254x1254, 본 SSoT 캐릭터)
- `docs/visual-assets/mascot-v0.1/main.png` (작업본 원본)
- 향후 6 mood PNG (character-design-agent §5)

### 3.2 디자인 토큰
- `apps/web/src/shared/styles/tokens.css` (컬러 21종, gradient 1종, shadow, radius)

### 3.3 톤 SSoT
- `01_제품_UX_게임화/순공대장_UI_설계.md` (v2.3, §1-3 톤·컬러·게임화)
- `docs/superpowers/specs/2026-05-18-ui-master-design.md` (UI master)

### 3.4 시안 reference
- `app_UI.png`, `web_ui.png` (홈/모바일 시안)
- 듀오링고 로고 (mascot+text), 클래스101 워드마크, 헤이바이브 톤

---

## 4. 워크플로우 (GPT-4o 세션 운영)

### 4.1 1세션 흐름 (30-60분, 시안 3종 → 1개 선택 → 파생물)

1. **Mike**: ChatGPT Projects "순공대장 브랜드" 세션 생성 (캐릭터 트랙과 별도)
2. **Mike**: base prompt (§4.4) + 캐릭터 main.png + tokens 색상값 첨부
3. **GPT-4o**: 로고 시안 3종 (수평 / 정사각 / 심볼-only)
4. **Mike**: 1개 선택 또는 재시도 (§4.3 룰)
5. **Mike → Canva**: 선택 시안 vector trace + 사이즈 변형 일괄
6. **Mike**: PNG export → `docs/visual-assets/brand-v0.X/` 적재
7. **Claude**: §6 품질 체크리스트 + §7 적용 슬롯 매트릭스 실행, `apps/web/public/`에 배포

### 4.2 일관성 강제 3룰

1. **컬러 토큰 외 도입 금지** — GPT-4o가 자체 컬러 사용 시 거절 + tokens.css 컬러로 재시도
2. **Pretendard 외 폰트 금지** — 영문 폰트도 Pretendard 단일
3. **캐릭터 변경 금지** — 입력으로 받은 main.png 그대로, 신규 캐릭터 안 생성

### 4.3 재시도 룰

- 시안 1라운드 = 3종. 1종도 OK 안 나오면 base prompt 보정 후 2라운드.
- 2라운드 OK 안 나오면 reference 한 가지 추가(특정 듀오링고 로고 변형 등)
- 3라운드까지 → 다음 세션으로 분할

### 4.4 Base Prompt (GPT-4o 시작용 템플릿)

```
순공대장 (Soongong) 로고 시안 3종을 만들어줘.

순공대장은 수능생 듀오링고형 AI 회독 학습 앱이야. 듀공 마스코트 "순공이"가 PRIMARY 식별점.

요구사항:
- 마스코트 "순공이"(첨부 이미지) + "순공대장"(한글 메인) + "Soongong"(영문 보조)
- 톤: Light Study Garden — 크림 배경 #F8FBF7, 민트 강조 #7CC97C
- 폰트(한글): Rockon Ultra Bold 둥근체 (라운드 굵은 한글 디스플레이 폰트, 듀오링고 톤)
- 폰트(영문 보조 Soongong): Rockon이 영문 지원 안 하면 Pretendard ExtraBold round 풍 (라운드 캡 권장)
- 텍스트 컬러: #1A2A1A (한글), #2D3F2D (영문)
- 다크/네이비 톤 금지, 그라디언트 과용 금지, 다른 캐릭터 추가 금지

시안 3종 변형:
1. 수평 (가로 긴, 헤더용)
2. 정사각 (1:1, 앱 아이콘/소셜 프로필용)
3. 심볼-only (마스코트 + "순공" 1글자, favicon용 작은 사이즈 대비)

각 시안은 흰 배경 + 크림 배경 두 버전으로 제시.
```

---

## 5. 산출 자산 명세

### 5.1 파일명 규칙

```
docs/visual-assets/brand-v0.X/master/
├── logo-horizontal.png     1920x500   (마스터, 헤더용)
├── logo-square.png         1024x1024  (마스터, 정사각)
├── logo-symbol.png         1024x1024  (심볼-only)
├── logo-horizontal-cream.png   배경 크림 변형
└── logo-square-cream.png       배경 크림 변형
```

### 5.2 사이즈 변형 (Canva 출력)

| 용도 | 파일명 | 사이즈 |
|---|---|---|
| 앱 헤더 (web) | `logo-header.png` | 480x120 (2x: 960x240) |
| 앱 헤더 (mobile) | `logo-header-mobile.png` | 240x60 (2x: 480x120) |
| PWA 아이콘 small | `icon-192.png` | 192x192 |
| PWA 아이콘 large | `icon-512.png` | 512x512 |
| Favicon ico | `favicon.ico` | 16+32+48 multi-size |
| Favicon png | `favicon-32.png` | 32x32 |
| Favicon png | `favicon-64.png` | 64x64 |
| OG image | `og-image.png` | 1200x630 |
| Apple touch icon | `apple-touch-icon.png` | 180x180 |

### 5.3 배포 경로 (최종)

```
apps/web/public/
├── logo-header.png
├── logo-header-mobile.png
├── icon-192.png
├── icon-512.png
├── favicon.ico
├── favicon-32.png
├── favicon-64.png
├── apple-touch-icon.png
└── og-image.png
```

### 5.4 매핑 코드 (적용)

- **헤더 로고**: `apps/web/src/widgets/sidebar/ui/sidebar.tsx` + `bottom-nav` (현재 텍스트 → Image)
- **HTML metadata**: `apps/web/src/app/layout.tsx`
  ```tsx
  export const metadata: Metadata = {
    title: "순공대장",
    description: "수능생 듀오링고형 AI 회독 학습 앱",
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: "순공대장",
      description: "다시 풀게 만드는 AI 회독 엔진",
      images: ["/og-image.png"],
    },
    manifest: "/manifest.json",
  };
  ```
- **PWA manifest** (P1+ 옵션): `apps/web/public/manifest.json`

---

## 6. 품질 체크리스트 (Mike·Claude 자체 검수)

### 6.1 컬러 검수

- [ ] 등록 외 hex 0건 (Claude `lint:tokens` 자동 검증 대상은 코드만이지만 자산도 토큰 5종 외 사용 금지)
- [ ] 다크 톤 0건 (#1A2A1A 텍스트 외 어두운 색상 X)
- [ ] 민트 강조의 채도가 tokens.css `--color-mint-500` (#7CC97C) 와 일치

### 6.2 타이포 검수

- [ ] 한글 "순공대장" = **Rockon Ultra Bold 둥근체** (Pretendard 아님)
- [ ] 영문 "Soongong" = Rockon 영문 지원 시 Rockon, 미지원 시 Pretendard ExtraBold (라운드 캡)
- [ ] 작은 사이즈(favicon 32px)에서 한글 식별 가능 (Rockon Ultra Bold의 두께 덕에 유리)
- [ ] 영문 "Soongong" 줄바꿈/위치 자연스러움
- [ ] 코드(`apps/web` UI)에 Rockon이 leak 되지 않음 — 본문/UI는 Pretendard 유지

### 6.3 마스코트 검수

- [ ] 입력 main.png 그대로 (신규 캐릭터 X)
- [ ] 마스코트와 텍스트 시각 위계 — 텍스트가 메인, 마스코트가 작은 보조
- [ ] 정사각 변형에서 마스코트가 1/3 이상 차지하지 않음 (텍스트 우위)

### 6.4 사이즈 검수

- [ ] favicon 32px에서 식별 가능 (심볼-only 변형이 이 케이스 대응)
- [ ] og-image 1200x630에 텍스트 여백 충분 (safe zone 100px)
- [ ] 모든 사이즈가 1:1 또는 명시된 비율 정확

### 6.5 적용 후 검수

- [ ] 헤더 적용 시 sidebar / bottom-nav 양쪽 자연스러움
- [ ] `design-review` 스킬 재실행 — 점수 변동 ±2 이내
- [ ] Vercel preview에서 OG image 실제 SNS 공유 미리보기 정상

---

## 7. 적용 슬롯 매트릭스 (생성 후 처리)

| 자산 | 우선순위 | 적용 시점 | 코드 변경 위치 |
|---|---|---|---|
| logo-header.png | P0 (Vercel deploy 전 권장) | v0.1 도착 즉시 | sidebar.tsx + bottom-nav |
| favicon.ico | P0 (브라우저 탭 식별) | v0.1 도착 즉시 | app/layout.tsx metadata |
| og-image.png | P0 (SNS 공유 시) | v0.1 도착 즉시 | app/layout.tsx openGraph |
| apple-touch-icon.png | P1 (iOS Safari 홈 추가 시) | v0.1 + Canva 파생 | app/layout.tsx metadata |
| icon-192/512.png | P2 (PWA 도입 시) | v0.2 PWA spike | manifest.json |
| Social profile 400x400 | P3 (마케팅 진입 시) | v0.3 | 외부 (Twitter/Instagram) |

---

## 8. 진행 현황 & 마일스톤

| 버전 | 상태 | 산출 | 일자 |
|---|---|---|---|
| **v0.0** | ✅ SSoT doc 완성 | 본 문서 | 2026-05-18 |
| **v0.1** | ⏳ 로고 1종 | logo-horizontal/square/symbol + favicon + og-image | Mike GPT-4o 작업 대기 |
| v0.2 | ⏳ PWA 아이콘 | icon-192/512 + manifest.json | P1+ 진입 시 |
| v0.3 | ⏳ 소셜 + 브랜드 가이드 | profile 이미지 + brand-guide.md | 마케팅 진입 시 |

---

## 9. 팔로업 프로토콜 (다음 세션 invoke 방법)

### 9.1 트리거 문구 (Mike → Claude)

- "브랜드 에이전트"
- "로고 작업"
- "로고 v0.X" (v0.1, v0.2, …)
- "OG image 만들자"
- "favicon 작업"

### 9.2 시작 액션 (Claude)

1. 본 문서(`2026-05-18-brand-design-agent.md`) 즉시 read (12 섹션 ~5K 토큰)
2. §8 현황 표에서 현재 마일스톤 확인
3. 다음 미달 마일스톤의 작업 모드 진입:
   - **v0.1 대기 중** → §4.4 base prompt 즉시 제시 + Canva 변형 가이드 안내
   - **v0.1 도착** → §6 품질 체크리스트 실행 + §7 매트릭스대로 `apps/web/public/` 배포 + `app/layout.tsx` metadata 업데이트
   - **v0.2/v0.3 대기** → 해당 산출 가이드 제시
4. 잠긴 결정사항(§2) 위반 시도 감지 시 즉시 거절 + 본 문서 §2 인용

### 9.3 컨텍스트 손실 방지

Mike의 메시지에 "다크 로고", "다른 폰트", "외주", "회독마왕" 같은 회귀 키워드 감지 → §2 절대 금지 항목 인용 + 거절.

---

## 10. 외부 도구·계정 의존성

| 도구 | 계정 | 용도 | 비용 |
|---|---|---|---|
| ChatGPT Plus | Mike 개인 | GPT-4o 시안 생성 | 월 $20 (캐릭터와 공용) |
| Canva | Mike 개인 (Free) | vector trace + 사이즈 변형 + svg export | 무료 |
| **Rockon Ultra Bold 둥근체** | 라이선스 확인 필요 (Mike) | 로고·브랜드 헤딩 단독 | TBD |
| Pretendard | OFL 라이선스 | 본문·UI 한글+영문 | 무료 |
| 이미지 변환 (rembg/Pillow) | 로컬 Python | 투명화 + 사이즈 변형 자동화 | 무료 |
| Vercel | Mike mugungwhwa | OG image 호스팅 | 무료 (취미 플랜) |

---

## 11. 관련 문서 cross-link

- 자매 에이전트: [character-design-agent.md](./2026-05-18-character-design-agent.md)
- 자산 인벤토리: [2026-05-14-soongong-asset-inventory.md](./2026-05-14-soongong-asset-inventory.md)
- 디자인 토큰 SSoT: `apps/web/src/shared/styles/tokens.css`
- 톤 SSoT: `01_제품_UX_게임화/순공대장_UI_설계.md` (v2.3)
- UI master: `docs/superpowers/specs/2026-05-18-ui-master-design.md`
- 프로젝트 CLAUDE.md: 잠긴 결정 §2, 위험 게이트 §4
- 메모리: [[project-soongong-mvp1]], [[feedback-no-outsourcing]], [[feedback-design-anchoring]]

---

## 12. 변경 이력

| 버전 | 일자 | 작성자 | 내용 |
|---|---|---|---|
| v0.0 | 2026-05-18 | Mike + Claude | 초안 SSoT 12 섹션 — 로고 + OG + favicon + 앱 아이콘 + 브랜드 가이드 통합 운영 룰. 캐릭터 에이전트 doc 패턴 동일 차용. |
| **v0.1** | **2026-05-19** | **Mike + Claude** | **로고 폰트 정정: Pretendard 단일 → Rockon Ultra Bold 둥근체(로고·브랜드 헤딩) + Pretendard(본문·UI) 분리. §2 / §4.4 / §6.2 / §10 일괄 갱신. Mike 지적: v0.0의 Pretendard 단일 잠금이 잘못된 정보.** |

---

> **이 문서는 단일 진실 공급원이다.** 본 문서를 거치지 않은 브랜드 자산은 일관성 검증 외 채택 금지.
