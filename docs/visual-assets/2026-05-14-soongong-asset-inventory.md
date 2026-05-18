# 순공대장 시각 자산 Inventory

> **외주 발주 없음.** 모든 시각 자산을 **Claude(코드) / Lucide(아이콘) / GPT-4o(이미지) / Canva(디자인)** 4개 트랙으로 분류해 잠근다.
> GPT-4o와 Canva 작업은 Mike가 직접 수행. 본 문서는 (1) 자산 분류 (2) GPT-4o prompt 가이드 (3) Canva 작업 가이드 (4) 우선순위를 잠근다.
> 시안 SSoT: `app_UI.png` / `web_ui.png`.

---

## 1. 트랙 분류 원칙

| 트랙 | 담당 | 산출 형식 | 사용처 | Lead time |
|---|---|---|---|---|
| **Claude (코드)** | claude/agent | SVG 인라인, Tailwind 클래스, shadcn 컴포넌트 | UI 컴포넌트, 추상 도형, 그래프, 진행률 게이지, 회독 타임라인 | 즉시 |
| **Lucide React** | npm `lucide-react` | TSX 아이콘 컴포넌트 | 표준 아이콘 (홈/캡처/통계/검색/알림/별/하트 등) | 즉시 |
| **GPT-4o** | Mike | PNG/WebP, 1024×1024 (투명 배경 권장) | 마스코트 캐릭터 + 표정 variants + 결과 일러스트 + Empty state | 1장당 5-10분 (Mike 작업) |
| **Canva** | Mike | PNG/SVG, 다양한 사이즈 | 앱 아이콘, Open Graph, 푸시 미리보기, 스토어 스크린샷, 랜딩 hero | 1개당 10-30분 (Mike 작업) |

**의도적으로 안 쓰는 트랙:**
- 외주 작가: lead time 4-6주 + 비용 50-300만원. MVP 단계에선 과한 투자.
- Figma 직접 제작: Mike가 디자이너 아니므로 GPT-4o+Canva가 더 빠름.

---

## 2. 화면별 자산 매트릭스

각 화면별로 어떤 자산을 어느 트랙에서 만들지 잠근다.

### 2.1 온보딩

| 자산 | 트랙 | 비고 |
|---|---|---|
| 배경 그라디언트 | Claude (CSS) | `bg-gradient-to-b from-bg to-accent-mintLight` |
| **마스코트 정면 (큰 사이즈)** | **GPT-4o** | 512×512 또는 1024×1024, 투명 배경 |
| 환영 문구 | Claude (텍스트) | "안녕! 같이 까먹기 전에 다시 풀어보자." |
| 옵션 카드 4개 | Claude (shadcn Card) | 수능 준비 중 / 독학재수 / 재학생 / 반수생 |
| CTA 버튼 | Claude (shadcn Button) | "📷 문제사진 1장 올리기" |

### 2.2 홈 (오늘의 회독퀘스트)

| 자산 | 트랙 | 비고 |
|---|---|---|
| 상단 로고 워드마크 | Canva (선택) 또는 Claude (텍스트) | "순공대장" |
| 통계 카드 4종 (🔥❤️⏱⭐) | Lucide | `Flame`, `Heart`, `Clock`, `Star` |
| **마스코트 인사 (작은, 응원 표정)** | **GPT-4o** | 128×128 또는 256×256 |
| 말풍선 카드 | Claude (shadcn Card) | "오늘 회독퀘스트 3개 같이 가볼까?" |
| 퀘스트 카드 × 3 | Claude (shadcn Card) | 위험도 배지 / 난이도 칩 / CTA |
| 위험도 배지 (원형 점) | Claude (CSS) | `rounded-full bg-danger` 등 |
| 하단 탭 아이콘 | Lucide | `Home`, `Camera`, `BarChart3` |

### 2.3 웹 대시보드

| 자산 | 트랙 | 비고 |
|---|---|---|
| 사이드바 아이콘 | Lucide | `Home`, `Calendar`, `FileText`, `Target`, `User`, `Trophy` |
| 통계 카드 4종 | Lucide + Claude | 모바일과 동일 |
| 과목별 숙련도 게이지 | Claude (CSS bar) | 그라디언트 fill |
| **마스코트 한마디 카드 (작은)** | **GPT-4o** | 64×64 또는 빠진 자리에 SVG placeholder |

### 2.4 업로드 모달 (시트)

| 자산 | 트랙 | 비고 |
|---|---|---|
| 시트 컴포넌트 | Claude (shadcn Sheet) | - |
| 3개 옵션 카드 | Claude (shadcn Card) | - |
| 옵션 아이콘 (📷🎥📝) | Lucide | `Camera`, `Video`, `StickyNote` |

### 2.5 AI 분석 결과 카드

| 자산 | 트랙 | 비고 |
|---|---|---|
| ✨ 아이콘 | Lucide | `Sparkles` |
| 카드 본체 | Claude | - |
| 분석 결과 dl 구조 | Claude | - |
| "맞아요/수정하기" 버튼 | Claude (shadcn Button) | - |

### 2.6 회독퀘스트 플레이

| 자산 | 트랙 | 비고 |
|---|---|---|
| 진행률 바 (1/3, 2/3, 3/3) | Claude (CSS) | - |
| 문제 영역 카드 | Claude | - |
| 선지 라디오/체크 | Claude (shadcn) | - |
| 풀이 캔버스 | 외부 라이브러리 | tldraw 또는 Konva |
| 도구바 아이콘 (펜/지우개/제출) | Lucide | `Pen`, `Eraser`, `Check` |

### 2.7 결과 화면 (보상)

| 자산 | 트랙 | 비고 |
|---|---|---|
| 🎉 이모지 또는 별 일러스트 | Lucide `PartyPopper` 또는 GPT-4o | - |
| **마스코트 축하 표정** | **GPT-4o** | 256×256 |
| Confetti 애니메이션 | Claude + `canvas-confetti` 라이브러리 | npm install |
| XP 카운트업 | Claude + Framer Motion | 0 → 40 카운트업 |
| 다음 회독/홈으로 버튼 | Claude | - |

### 2.8 오답회수 모드

| 자산 | 트랙 | 비고 |
|---|---|---|
| 단계 칩 (1/3, 2/3, 3/3) | Claude | - |
| **마스코트 응원 표정** | **GPT-4o** | 128×128 |
| V1-V5 변형 단계 표시 | Claude | - |

### 2.9 Empty State (빈 상태)

| 자산 | 트랙 | 비고 |
|---|---|---|
| **마스코트 잠/대기 표정** | **GPT-4o** | 256×256 |
| 안내 텍스트 + CTA | Claude | "아직 업로드한 문제가 없어요" |

### 2.10 로딩 상태

| 자산 | 트랙 | 비고 |
|---|---|---|
| Skeleton | Claude (shadcn Skeleton) | 옅은 그린 shimmer |
| Spinner | Lucide `Loader2` + `animate-spin` | - |

---

## 3. 마스코트 표정 Variants (이미지 생성 도구, v0.1 이후 GPT-4o)

MVP 1차에 필요한 표정 6종. 각각 PNG 1024×1024, 투명 배경.

| # | 표정 | 사용처 | 우선순위 |
|---|---|---|---|
| 1 | **응원/기본** (cheer) | 홈 인사, 업로드 격려 | 필수 |
| 2 | **축하** (celebrate) | 회독 성공 결과 | 필수 |
| 3 | **생각** (think) | AI 분석 중 로딩 | 추천 |
| 4 | **위로** (comfort) | 오답 후 격려 | 추천 |
| 5 | **잠/대기** (sleep) | Empty state | nice-to-have |
| 6 | **놀람** (surprise) | 망각위험 알림 | nice-to-have |

### 3.x 입수 자산 v0.1 (2026-05-18, Mike Midjourney 작업본)

위치: `docs/visual-assets/mascot-v0.1/`

| 파일 | 해상도 | 컬러/포맷 | 매핑(잠정) | 사용 가능 여부 |
|---|---|---|---|---|
| `main.png` | 1254×1254 | 8-bit RGB, 비인터레이스, **배경 크림 합성** (알파 없음) | 풀바디 마스코트 — 홈 메인, 온보딩, 리워드 화면 메인 일러스트 | ✅ 즉시 사용 가능 (스케일다운만) / ⚠️ 합성 시 배경 분리 필요 |
| `repeat_normal.png` | 1254×1254 | 8-bit RGB, 비인터레이스, **배경 크림 합성** (알파 없음) | 페이스 클로즈업 — 회독퀘스트 카드 썸네일, 뱃지 슬롯, 리액션 슬롯 | ✅ 즉시 사용 가능 / ⚠️ 합성 시 배경 분리 필요 |

**관찰 사항:**
- 듀공 모티프 + 민트 바디 + 크림 배경 + 노란 왕관 → §1 트랙 분류·`CLAUDE.md §2` 잠긴 결정 모두 정합.
- 표정은 1종(평온/기본)만 보유. §3 표 6종 중 **#1 응원 변형** 또는 **#5 잠/대기**에 가장 가깝다고 판단 (별도 응원 포즈/표정 변형 필요).
- 알파 채널 없음 → Canva BG Remover 또는 `rembg` 1회 처리 후 `apps/web/public/mascot/`에 배포.

**v0.1-alpha (2026-05-18, Claude 자동 처리):**

`docs/visual-assets/mascot-v0.1-alpha/`에 Pillow + 가장자리 floodfill로 알파 채널 추가 완료:

| 파일 | 상태 |
|---|---|
| `main-alpha.png` | ✅ 완벽 — production 즉시 사용 가능 |
| `repeat_normal-alpha.png` | ⚠️ 캐릭터·외곽 깔끔, belly 아래 1-2% 잔재 — reference 용도 OK, production 불가 |

알고리즘 한계: 자산의 *belly 옅은 크림* 색과 *그림자 베이지* 색이 너무 가까워 thresh 기반 floodfill로 안전하게 구분 불가. 더 정교한 처리는 ML 기반(`rembg`) 또는 v0.2 단계에서 GPT-4o가 처음부터 투명·단색 배경으로 생성.

**남은 TODO (다음 단계):**
1. Mike — **GPT-4o(ChatGPT)** 이미지 생성으로 표정 5종 추가 (celebrate / think / comfort / sleep / surprise). **§4.2 base prompt에 "투명 배경 또는 정확히 `#F8FBF7` 단색" 명시 필수**. 워크플로우는 §4 참조. *(2026-05-18 결정: Midjourney → GPT-4o 트랙 전환)*
2. Mike (Canva) — v0.2 자산 5단 다운스케일 export (1024 / 512 / 256 / 128 / 64).
3. Claude — `apps/web/src/shared/ui/mascot.tsx` placeholder를 `mascot-v0.1-alpha/main-alpha.png` 으로 1차 교체 (`#1 응원/기본` 슬롯).

---

## 4. GPT-4o 이미지 생성 가이드 (Mike용)

> **에이전트화 SSoT**: 본 §4 가이드 + §3/§5/§7/§9는 **`docs/visual-assets/2026-05-18-character-design-agent.md`** (순공이 캐릭터 디자인 에이전트)에 단일 진실로 통합됨. 다음 세션 팔로업·잠긴 결정 회귀 방지·진행 마일스톤 관리는 그쪽 문서 우선.

> **2026-05-18 결정**: Midjourney → **GPT-4o(ChatGPT) 이미지 생성** 트랙으로 전환. 이유: 한국어 친화 / ChatGPT Plus 외 추가 비용 0 / Discord 없이 진입장벽 최저. Mike의 AI Provider 결정 매트릭스에 GPT가 추가된 흐름과도 정합. 일관성은 §4.1 강제 프로토콜로 보완.

### 4.1 일관성 강제 프로토콜 (필수)

GPT-4o image generation은 Midjourney `--cref`처럼 시드 기반 강제 메커니즘이 약함 → 다음 3룰로 보완.

1. **매 표정마다 reference 이미지 첨부 필수** — `docs/visual-assets/mascot-v0.1/main.png`를 매 생성 메시지에 첨부.
2. **잠긴 결정사항을 프롬프트 마지막에 항상 명시** — 캐릭터/컬러/배경/왕관/사이즈/톤.
3. **표정 5종은 같은 ChatGPT 세션에서 연속 생성** — 세션 끊기면 컨텍스트 사라져서 캐릭터 어긋남.

### 4.2 기본 마스코트 prompt (한국어 base)

이 base를 표정별로 변형해서 사용. **매번 main.png 첨부 + 아래 프롬프트 + §4.3의 표정 변형부**를 한 메시지로 보냄.

```
첨부 이미지의 캐릭터(둥근 듀공 모티프 마스코트, 민트색 몸 #7CC97C 계열,
연한 크림색 배, 작은 점눈, 작은 지느러미, 노란 왕관)와
**완전히 동일한 외형·컬러·스타일**로 새 일러스트를 만들어줘.

- 표정/포즈: [표정별 변형부]
- 배경: **투명 PNG 우선**, 안 되면 정확히 `#F8FBF7` 단색 (앱 토큰과 일치 필수 — 미세 색차도 카드/그라데이션 위에서 사각형 노출됨)
- 사이즈: 1254×1254 정사각형
- 톤: Light Study Garden — 둥글고 친근한 카와이 스티커 스타일
- 한국 학습앱(수능생 대상) 마스코트. 듀오링고/카카오 헤이바이브 톤 참고.
- 다크 RPG 톤 금지. 어두운 색조 금지.

붙임 main.png가 캐릭터 reference. 절대 다른 인물처럼 변형 X.
```

### 4.3 표정별 변형부 (5종)

§3 표의 #2-6. (응원/기본은 v0.1 `main.png`로 대체 가능 → 우선 5종만 추가 생성)

**축하 (celebrate):**
```
큰 미소, 두 지느러미를 위로 들고 환호, 얼굴에 기쁨,
주변에 작은 색종이 콘페티, 한 손에 작은 노란 별
```

**생각 (think):**
```
지느러미 하나를 턱에 살짝 대고 사색하는 표정,
머리 옆에 작은 물음표 또는 반짝임, 눈을 살짝 옆으로
```

**위로 (comfort):**
```
부드러운 따뜻한 미소, 살짝 고개를 기울임,
한 지느러미에 작은 분홍 하트, 격려하는 자세
```

**잠/대기 (sleep):**
```
편안하게 잠든 표정, 눈 감고 머리 옆에 작은 "Z" 표시,
몸을 살짝 웅크리고 평화로운 자세
```

**놀람 (surprise):**
```
크게 놀란 표정, 눈 동그랗게,
머리 옆에 작은 느낌표, 한 지느러미로 가리키는 자세
```

### 4.4 ChatGPT 세션 운영 워크플로우

```
권장 1세션 흐름 (30-60분, 5종 일괄):

1. ChatGPT(Plus, GPT-4o) 새 세션 열기
2. main.png 첨부 + §4.2 base + §4.3 축하 변형부 → 생성
3. 결과 OK면 다운로드(PNG). 안 들면 "왕관 더 작게", "민트 더 진하게" 등 1-2회 보정
4. **같은 세션에서** 새 메시지로 main.png 재첨부 + 다음 표정(생각) → 생성
   (재첨부 이유: 세션 길어지면 첨부 우선순위 떨어져 캐릭터 어긋남)
5. 5종 모두 완료까지 반복
6. 5장을 `docs/visual-assets/mascot-v0.2/` 폴더에 저장
   파일명: soongong-celebrate.png, soongong-think.png, soongong-comfort.png,
            soongong-sleep.png, soongong-surprise.png
7. Mike → Claude에게 알림 → §4.5 투명화 후처리 진행
```

### 4.5 투명화 슬롯 매트릭스 (생성 후 처리)

GPT-4o 출력도 완전 투명 PNG는 불안정. 또한 **자산 배경이 앱 토큰과 정확히 일치하지 않으면 모든 슬롯에서 사각형이 미세하게 노출**됨 (v0.1 측정값: 자산 `#F7F4F2` vs 앱 토큰 `#F8FBF7` → G −7, B −4 차이로 시각 식별 가능). 그래서 **전 슬롯 투명화 권장**:

| UI 슬롯 | 배경 | 투명화 |
|---|---|---|
| 홈 메인 일러스트 | 크림 | 권장 (자산 배경과 미세 색차) |
| 온보딩 인트로 | 크림 | 권장 (자산 배경과 미세 색차) |
| 회독퀘스트 카드 썸네일 | 흰색/연민트 카드 | ✅ 필수 |
| 뱃지/리워드 아이콘 | 다양 | ✅ 필수 |
| 푸시 알림 아이콘 | 시스템 | ✅ 필수 |
| 앱 아이콘 | 시스템 | ✅ 필수 |
| 결과 화면 (콘페티 위) | 그라데이션 | ✅ 필수 |

→ MVP 1차 기준 **전 슬롯 투명화 1회**. GPT-4o prompt에서 **"투명 배경 또는 정확히 `#F8FBF7` 단색 배경"**을 명시하면 후처리 부담이 감소. 권장 도구:

| 도구 | 비용 | Mike 적합도 | 비고 |
|---|---|---|---|
| **remove.bg** (무료) | 0원, 월 50회 | ⭐⭐⭐ 추천 | 가입 불필요, 드래그·다운로드 |
| Canva BG Remover | Canva Pro $14.99/월 | ⭐⭐⭐ Pro 보유 시 | 인벤토리 §5 워크플로우 일치 |
| Claude `rembg` 일괄 | 0원 | ⭐⭐⭐ 자동화 | Mike가 5장 다운만 끝내면 Claude가 폴더 일괄 처리 |

### 4.6 작업 팁 (Mike)

- **세션 끊지 말 것** — 다른 GPT 세션 갔다 오면 캐릭터 어긋남. 5종 한 세션에서 끝내기.
- **첨부는 매번** — 한 번만 첨부하고 5장 생성하면 후반 갈수록 캐릭터 드리프트.
- **재시도 3회 룰** — 한 표정에 3회 시도해도 안 맞으면 다음으로 넘어가고 마지막에 재도전. 무한 재시도 금지.
- **PNG 원본 다운로드** — JPG로 받으면 알파 사라지고 압축 손실. 항상 "Download image" → PNG 확인.
- **컬러 미세 차이는 마지막에 Canva 일괄 통일** — 5종이 미묘하게 다른 민트로 나올 수 있음.
- **세션 막판에 캐릭터가 어긋나기 시작하면 새 세션** — 단, 새 세션에서도 §4.2 base + main.png 첨부 그대로.

---

## 5. Canva 작업 항목

### 5.1 필수 (출시 전)

| 자산 | 사이즈 | 비고 |
|---|---|---|
| **앱 아이콘** | 1024×1024 | iOS/Android 스토어 등록용. 마스코트 정면 + 크림 배경 + 모서리 라운드 22% |
| **Favicon** | 32×32 / 16×16 | 웹 브라우저 탭 |
| **Open Graph 이미지** | 1200×630 | SNS 공유 카드 |

### 5.2 추천 (MVP 1.5)

| 자산 | 사이즈 | 비고 |
|---|---|---|
| 푸시 알림 미리보기 | 다양 | 토스/카카오 알림처럼 깔끔 |
| 스토어 스크린샷 6장 | 1242×2688 (iOS) / 1080×1920 (Android) | 홈/플레이/결과/리그/오답던전/통계 |
| 랜딩 페이지 hero 비주얼 | 1920×1080 | 마스코트 + 카피 |

### 5.3 Canva 작업 팁 (Mike)

- **Brand Kit 등록**: 컬러 토큰 9개(`#F8FBF7`, `#7CC97C`, `#5BAE6E`, `#E85C5C`, `#F5A85E`, `#6FA9E8`, `#F5C242`, `#2E2E2E`, `#6E6E6E`)를 Canva Brand Kit에 등록 → 모든 디자인에서 일관 사용
- **Pretendard 폰트 업로드**: Canva Pro면 커스텀 폰트 업로드 가능
- **템플릿 활용**: "Mobile App Icon" / "App Store Screenshot" / "Social Media Post" 템플릿 검색 → 컬러만 교체
- **Magic Resize**: 1개 디자인을 여러 사이즈로 자동 변환 (Canva Pro)

---

## 6. Claude (코드) 자체 제작 항목

agent가 코드로 직접 만드는 자산:

| 자산 | 구현 | 비고 |
|---|---|---|
| 통계 카드 4종 | Tailwind + Lucide | 카드 + 아이콘 + 큰 숫자 |
| 퀘스트 카드 | shadcn Card 커스텀 | UI 설계.md §7-1 spec |
| 망각위험 배지 | Tailwind pill | `bg-danger-bg text-danger rounded-pill` |
| 회독 타임라인 | SVG 직접 | `●──●──●──○` 패턴 |
| 진행률 게이지 (60분 순공) | Tailwind div + width % | - |
| 과목별 숙련도 바 | 동일 | - |
| Confetti | `canvas-confetti` 라이브러리 | npm |
| XP 카운트업 | Framer Motion `<motion.span>` | - |
| Skeleton 로딩 | shadcn Skeleton | - |
| 풀이 캔버스 격자 | SVG pattern | dot-grid 또는 line-grid |
| 그라디언트 배경 | Tailwind `bg-gradient-to-b` | - |

**원칙**: 5분 안에 코드로 만들 수 있으면 코드. 그 이상이면 GPT-4o/Canva.

---

## 7. 파일 저장 구조

```
apps/web/public/
├── mascot/
│   ├── soongong-cheer.png       (응원, 1024×1024 + 512 + 256 + 128 + 64)
│   ├── soongong-celebrate.png   (축하)
│   ├── soongong-think.png       (생각)
│   ├── soongong-comfort.png     (위로)
│   ├── soongong-sleep.png       (잠)
│   └── soongong-surprise.png    (놀람)
├── icons/
│   ├── app-icon-1024.png
│   ├── app-icon-512.png
│   ├── favicon-32.png
│   ├── favicon-16.png
│   └── apple-touch-icon.png
├── og/
│   └── og-image.png             (1200×630)
└── store/                       (출시 직전)
    ├── screenshot-1.png
    └── ...
```

`next.config.ts`에 `images.domains` 설정 + `<Image>` 컴포넌트로 lazy load.

---

## 8. 우선순위 (Mike 작업 순서)

| 우선순위 | 자산 | 트랙 | 시점 |
|---|---|---|---|
| 🔥 1 | **마스코트 응원** | GPT-4o | W1 시작 시 |
| 🔥 2 | **마스코트 축하** | GPT-4o | W1 시작 시 |
| 🔥 3 | **앱 아이콘** | Canva | W1 |
| 🔥 4 | Favicon | Canva | W1 |
| ⭐ 5 | 마스코트 생각 | GPT-4o | W2 |
| ⭐ 6 | 마스코트 위로 | GPT-4o | W2 |
| ⭐ 7 | Open Graph | Canva | W2-3 |
| 8 | 마스코트 잠 | GPT-4o | W4 |
| 9 | 마스코트 놀람 | GPT-4o | W4 |
| 10 | 스토어 스크린샷 | Canva | 출시 직전 |
| 11 | 랜딩 hero | Canva | 출시 직전 |

🔥 4개가 W1 안에 끝나야 P5(W4-5)에 빠지지 않음.

---

## 9. 중간 placeholder 정책

마스코트가 아직 안 나온 시점(P1-P4 작업 중)의 임시 처리:

```tsx
// apps/web/src/shared/ui/mascot.tsx
import Image from "next/image";

type Mood = "cheer" | "celebrate" | "think" | "comfort" | "sleep" | "surprise";

const MASCOT_SRC: Record<Mood, string | null> = {
  cheer: "/mascot/soongong-cheer.png",       // 채워지면 자동 사용
  celebrate: null,                            // 미구현 — placeholder 사용
  think: null,
  comfort: null,
  sleep: null,
  surprise: null,
};

export function Mascot({ mood = "cheer", size = 128 }: { mood?: Mood; size?: number }) {
  const src = MASCOT_SRC[mood];
  if (!src) {
    return (
      <div
        className="rounded-full bg-accent-mintLight flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-2xl">🦕</span>
      </div>
    );
  }
  return <Image src={src} alt={`순공이 ${mood}`} width={size} height={size} priority />;
}
```

이렇게 하면 자산이 준비되는 대로 `MASCOT_SRC` 매핑만 추가하면 자동 반영.

---

## 10. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-14** | **초안. 외주 트랙 폐기. Claude/Lucide/Midjourney/Canva 4트랙 분류. 마스코트 6종 + 앱 아이콘 + 푸시/OG/스토어 자산 inventory + Midjourney prompt 가이드 + Canva 작업 가이드.** |
| **v1.1** | **2026-05-18** | **§3.x 입수 자산 v0.1 섹션 신설. Mike Midjourney 작업본 2종(`main.png` 풀바디 + `repeat_normal.png` 페이스 클로즈업, 1254×1254) 등재. 폴더 `charcter image/` → `docs/visual-assets/mascot-v0.1/`로 이동, `repeat_nomal.png` 오타 수정.** |
| **v1.2** | **2026-05-18** | **§4 Midjourney 가이드 → GPT-4o(ChatGPT) 이미지 생성 가이드로 전면 재작성. §4.1 일관성 강제 프로토콜 + §4.2 한국어 base prompt + §4.3 표정 5종 변형부 + §4.4 ChatGPT 세션 운영 워크플로우 + §4.5 투명화 슬롯 매트릭스(remove.bg/Canva/rembg) + §4.6 작업 팁. §3 헤딩과 §3.x TODO도 GPT-4o 트랙으로 갱신.** |
| **v1.3** | **2026-05-18** | **§3.x에 v0.1-alpha 자동 처리 결과 추가 (`mascot-v0.1-alpha/main-alpha.png` 완벽 + `repeat_normal-alpha.png` 부분 잔재). §4.2 base prompt에 투명 배경 우선 명시. §4.5 매트릭스 "❌ 불필요(배경 색 일치)" 행을 "권장"으로 강등 — 자산 #F7F4F2 vs 앱 토큰 #F8FBF7 미세 차이 측정값 근거.** |
