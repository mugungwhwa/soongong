# 순공대장 시각 자산 Inventory

> **외주 발주 없음.** 모든 시각 자산을 **Claude(코드) / Lucide(아이콘) / Midjourney(이미지) / Canva(디자인)** 4개 트랙으로 분류해 잠근다.
> Midjourney와 Canva 작업은 Mike가 직접 수행. 본 문서는 (1) 자산 분류 (2) Midjourney prompt 가이드 (3) Canva 작업 가이드 (4) 우선순위를 잠근다.
> 시안 SSoT: `app_UI.png` / `web_ui.png`.

---

## 1. 트랙 분류 원칙

| 트랙 | 담당 | 산출 형식 | 사용처 | Lead time |
|---|---|---|---|---|
| **Claude (코드)** | claude/agent | SVG 인라인, Tailwind 클래스, shadcn 컴포넌트 | UI 컴포넌트, 추상 도형, 그래프, 진행률 게이지, 회독 타임라인 | 즉시 |
| **Lucide React** | npm `lucide-react` | TSX 아이콘 컴포넌트 | 표준 아이콘 (홈/캡처/통계/검색/알림/별/하트 등) | 즉시 |
| **Midjourney** | Mike | PNG/WebP, 1024×1024 (투명 배경 권장) | 마스코트 캐릭터 + 표정 variants + 결과 일러스트 + Empty state | 1장당 5-10분 (Mike 작업) |
| **Canva** | Mike | PNG/SVG, 다양한 사이즈 | 앱 아이콘, Open Graph, 푸시 미리보기, 스토어 스크린샷, 랜딩 hero | 1개당 10-30분 (Mike 작업) |

**의도적으로 안 쓰는 트랙:**
- 외주 작가: lead time 4-6주 + 비용 50-300만원. MVP 단계에선 과한 투자.
- Figma 직접 제작: Mike가 디자이너 아니므로 Midjourney+Canva가 더 빠름.

---

## 2. 화면별 자산 매트릭스

각 화면별로 어떤 자산을 어느 트랙에서 만들지 잠근다.

### 2.1 온보딩

| 자산 | 트랙 | 비고 |
|---|---|---|
| 배경 그라디언트 | Claude (CSS) | `bg-gradient-to-b from-bg to-accent-mintLight` |
| **마스코트 정면 (큰 사이즈)** | **Midjourney** | 512×512 또는 1024×1024, 투명 배경 |
| 환영 문구 | Claude (텍스트) | "안녕! 같이 까먹기 전에 다시 풀어보자." |
| 옵션 카드 4개 | Claude (shadcn Card) | 수능 준비 중 / 독학재수 / 재학생 / 반수생 |
| CTA 버튼 | Claude (shadcn Button) | "📷 문제사진 1장 올리기" |

### 2.2 홈 (오늘의 회독퀘스트)

| 자산 | 트랙 | 비고 |
|---|---|---|
| 상단 로고 워드마크 | Canva (선택) 또는 Claude (텍스트) | "순공대장" |
| 통계 카드 4종 (🔥❤️⏱⭐) | Lucide | `Flame`, `Heart`, `Clock`, `Star` |
| **마스코트 인사 (작은, 응원 표정)** | **Midjourney** | 128×128 또는 256×256 |
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
| **마스코트 한마디 카드 (작은)** | **Midjourney** | 64×64 또는 빠진 자리에 SVG placeholder |

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
| 🎉 이모지 또는 별 일러스트 | Lucide `PartyPopper` 또는 Midjourney | - |
| **마스코트 축하 표정** | **Midjourney** | 256×256 |
| Confetti 애니메이션 | Claude + `canvas-confetti` 라이브러리 | npm install |
| XP 카운트업 | Claude + Framer Motion | 0 → 40 카운트업 |
| 다음 회독/홈으로 버튼 | Claude | - |

### 2.8 오답회수 모드

| 자산 | 트랙 | 비고 |
|---|---|---|
| 단계 칩 (1/3, 2/3, 3/3) | Claude | - |
| **마스코트 응원 표정** | **Midjourney** | 128×128 |
| V1-V5 변형 단계 표시 | Claude | - |

### 2.9 Empty State (빈 상태)

| 자산 | 트랙 | 비고 |
|---|---|---|
| **마스코트 잠/대기 표정** | **Midjourney** | 256×256 |
| 안내 텍스트 + CTA | Claude | "아직 업로드한 문제가 없어요" |

### 2.10 로딩 상태

| 자산 | 트랙 | 비고 |
|---|---|---|
| Skeleton | Claude (shadcn Skeleton) | 옅은 그린 shimmer |
| Spinner | Lucide `Loader2` + `animate-spin` | - |

---

## 3. 마스코트 표정 Variants (Midjourney 작업)

MVP 1차에 필요한 표정 6종. 각각 PNG 1024×1024, 투명 배경.

| # | 표정 | 사용처 | 우선순위 |
|---|---|---|---|
| 1 | **응원/기본** (cheer) | 홈 인사, 업로드 격려 | 필수 |
| 2 | **축하** (celebrate) | 회독 성공 결과 | 필수 |
| 3 | **생각** (think) | AI 분석 중 로딩 | 추천 |
| 4 | **위로** (comfort) | 오답 후 격려 | 추천 |
| 5 | **잠/대기** (sleep) | Empty state | nice-to-have |
| 6 | **놀람** (surprise) | 망각위험 알림 | nice-to-have |

---

## 4. Midjourney Prompt 가이드 (Mike용)

### 4.1 기본 마스코트 prompt (Base)

```
mascot character, round chubby dugong sea creature,
mint green body color, light pastel mint belly,
small dot eyes, small fins, kawaii Korean app mascot,
soft pastel illustration style, sticker design,
transparent background, clean and friendly,
high quality, vector style --ar 1:1 --v 6 --style raw
```

### 4.2 표정별 variant prompt

**응원 (cheer):**
```
[BASE] + cheerful smile, one fin raised waving hello,
holding a small book, encouraging expression
```

**축하 (celebrate):**
```
[BASE] + big happy smile, confetti around,
holding a gold star, eyes closed in joy
```

**생각 (think):**
```
[BASE] + thoughtful expression, one fin on chin,
small question mark or sparkle near head
```

**위로 (comfort):**
```
[BASE] + gentle warm smile, soft eyes, slightly tilted head,
holding small heart, supportive pose
```

**잠/대기 (sleep):**
```
[BASE] + sleeping peacefully, closed eyes "Z" symbol,
curled up small, peaceful expression
```

**놀람 (surprise):**
```
[BASE] + surprised expression, eyes wide,
small exclamation mark near head, fin pointing
```

### 4.3 Midjourney 작업 팁 (Mike)

- `--ar 1:1` 정사각형 비율 강제 (다른 사이즈로 출력되면 잘리거나 비율 깨짐)
- `--style raw` 옵션은 prompt에 더 충실 (생략하면 Midjourney 스타일 강하게 적용됨)
- `--v 6` (최신 버전, 2026년 5월 기준)
- 4개 variant 한꺼번에 생성 → 가장 마음에 드는 1개를 U버튼으로 업스케일
- **배경 제거**: Midjourney는 완전 투명 배경 어려움 → 결과를 `remove.bg` 또는 Canva의 "배경 제거" 기능으로 처리
- **컬러 통일**: 6종 표정이 컬러가 미묘하게 다를 수 있음 → Canva에서 마지막에 컬러 통일

### 4.4 6종 일괄 작업 워크플로우

```
1. 응원(cheer) prompt 입력 → 4 variant 생성 → 1개 선택 → U버튼 업스케일
2. 응원 결과를 reference로 사용 (--cref 옵션) → 다른 5개 표정 생성
   예: /imagine prompt: [축하 prompt] --cref <응원_url> --cw 50
   → 캐릭터 일관성 유지
3. remove.bg 일괄 처리 → 투명 PNG 6장
4. Canva에서 컬러 통일 + 사이즈 변형 (1024/512/256/128)
5. apps/web/public/mascot/ 에 저장
```

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

**원칙**: 5분 안에 코드로 만들 수 있으면 코드. 그 이상이면 Midjourney/Canva.

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
| 🔥 1 | **마스코트 응원** | Midjourney | W1 시작 시 |
| 🔥 2 | **마스코트 축하** | Midjourney | W1 시작 시 |
| 🔥 3 | **앱 아이콘** | Canva | W1 |
| 🔥 4 | Favicon | Canva | W1 |
| ⭐ 5 | 마스코트 생각 | Midjourney | W2 |
| ⭐ 6 | 마스코트 위로 | Midjourney | W2 |
| ⭐ 7 | Open Graph | Canva | W2-3 |
| 8 | 마스코트 잠 | Midjourney | W4 |
| 9 | 마스코트 놀람 | Midjourney | W4 |
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
