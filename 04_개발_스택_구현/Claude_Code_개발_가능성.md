---
title: "Claude Code 개발 가능성"
source_file: "Claude Code 개발 가능성.txt"
category: "개발 스택·구현"
project: "순공대장"
converted_at: "2026-05-13 08:56:36"
usage: "개발 지침 / 기획 소스 / Agent 설계 참고"
---

# Claude Code 개발 가능성

> 원본 소스: `Claude Code 개발 가능성.txt`  
> 분류: **개발 스택·구현**

---

가능해. 다만 **“순공대장 전체를 Claude Code로 만든다”는 가능**하고, **“패드 풀이과정 인식까지 완전 자동화한다”는 단계별로 봐야 해.**

내 판단은 이거야.

> **Claude Code로 MVP 개발 가능 영역: 70~80%**  
> **전문 개발/외부 API/네이티브 작업이 필요한 영역: 20~30%**

Claude Code는 코드베이스를 이해하고 여러 파일을 수정하며 빌드·검색·명령 실행까지 도와주는 터미널 기반 코딩 에이전트라, 순공대장처럼 Next.js/Expo/Supabase 구조의 MVP를 빠르게 만드는 데는 잘 맞아. ([code.claude.com](https://code.claude.com/docs/en/overview?utm_source=chatgpt.com)) 기존 순공대장 기술 방향도 웹은 Next.js, 앱은 Expo React Native, 백엔드는 Supabase/PostgreSQL/Storage/RLS/pgvector로 잡아둔 상태라 Claude Code와 궁합이 좋다. fileciteturn0file14

## 결론부터

### 1. 충분히 Claude Code로 가능한 것

| 영역 | Claude Code 개발 가능성 | 설명 |
|---|---:|---|
| 웹 MVP | 매우 높음 | Next.js + Tailwind + Supabase |
| 앱 MVP | 높음 | Expo React Native 기반 |
| 문제사진 업로드 | 높음 | 카메라/이미지 업로드 |
| 오늘의 회독 UI | 매우 높음 | 경로형 홈, 퀘스트 카드 |
| 오답회수 모드 UI | 매우 높음 | 히트 UX 구현 가능 |
| 풀이과정 캔버스 | 중~높음 | 웹/iPad 기준 가능 |
| 스트로크 저장 | 높음 | 좌표 데이터 JSON 저장 |
| 풀이 리플레이 | 높음 | “학생이 어떻게 풀었는지” 재생 |
| AI 분석 파이프라인 | 중~높음 | LLM API + Supabase Edge Function |
| RAG 기본 구조 | 중~높음 | pgvector + 유형 카드 검색 |
| 관리자/검수 화면 | 높음 | 웹으로 빠르게 가능 |

### 2. Claude Code만으로 어려운 것

| 영역 | 난이도 | 이유 |
|---|---:|---|
| 손글씨 수식 인식 | 높음 | 직접 만들기 어렵고 Mathpix/MyScript 같은 API 필요 |
| Apple Pencil 네이티브 최적화 | 중~높음 | iOS PencilKit 브릿지 필요 가능성 |
| 전과목 문제 자동 생성·검증 | 높음 | RAG, 검수, 법무, 품질관리 필요 |
| 국어/영어 지문형 자동 생성 | 높음 | 저작권·품질 리스크 큼 |
| 수학 자동 풀이 검증 | 중~높음 | Solver/검증 로직 별도 필요 |
| OCR 정확도 고도화 | 중~높음 | 외부 OCR/API 조합 필요 |

## 패드 풀이과정 기능은 이렇게 만들면 됨

핵심은 처음부터 “손글씨를 완벽히 수식으로 인식”하려고 하면 안 돼.

초기 MVP는 이렇게 가야 해.

```text id="u4o333"
문제사진 업로드
→ 학생이 패드에서 풀이 작성
→ 풀이 스트로크 저장
→ 풀이 이미지 저장
→ AI가 풀이 흐름 일부 분석
→ 오답 원인 태깅
→ 오답회수 모드로 연결
```

즉, 처음에는 **풀이과정 인식 앱**이 아니라 **풀이과정 기록 + 오답회수 앱**으로 가는 게 맞아.

## 구현 옵션

### 옵션 A. 웹/iPad 우선: tldraw 사용

웹에서 iPad Safari까지 고려하면 `tldraw`가 가장 현실적이야. tldraw는 React 기반 infinite canvas SDK이고, 화이트보드·드로잉·커스텀 도구·실시간 협업까지 지원하는 구조라 풀이과정 캔버스의 베이스로 쓰기 좋다. ([tldraw.dev](https://tldraw.dev/?utm_source=chatgpt.com))

```text id="hd7wic"
Next.js 웹
+ tldraw
+ Apple Pencil/터치 입력
+ stroke JSON 저장
+ PNG export
+ Supabase Storage 저장
```

이 방식이면 Claude Code로 꽤 많이 만들 수 있어.

### 옵션 B. 간단한 오픈소스 화이트보드: Excalidraw

Excalidraw도 오픈소스 화이트보드이고, 자유 드로잉, 도형, 이미지, PNG/SVG export를 지원한다. ([excalidraw.com](https://excalidraw.com/?utm_source=chatgpt.com))  
다만 순공대장 풀이과정처럼 **문제 위에 풀이를 쓰고, 스트로크 단위로 저장·분석**하려면 tldraw가 더 유연할 가능성이 높아.

### 옵션 C. 모바일 앱: React Native Skia

Expo/React Native 앱에서 직접 필기 캔버스를 만들려면 `React Native Skia + gesture-handler` 조합이 가능하다. React Native Skia는 제스처와 결합한 드로잉 튜토리얼을 제공하고 있어, 앱 내 손글씨 캔버스 구현에 쓸 수 있다. ([shopify.github.io](https://shopify.github.io/react-native-skia/docs/animations/gestures/?utm_source=chatgpt.com))

```text id="h1biel"
Expo React Native
+ React Native Skia
+ react-native-gesture-handler
+ stroke capture
+ PNG render
+ Supabase upload
```

이건 Claude Code로 구현 가능하지만, 웹보다 디버깅 난이도는 높아.

### 옵션 D. iOS 고품질: PencilKit

iPad/Apple Pencil 경험을 제대로 가져가려면 Apple의 PencilKit이 가장 정석이야. PencilKit은 iOS 앱에 Apple Pencil 또는 손가락 입력 기반 드로잉 환경을 제공한다. ([developer.apple.com](https://developer.apple.com/documentation/pencilkit?utm_source=chatgpt.com))  
다만 Expo만으로 바로 쓰기는 애매하고, 네이티브 모듈/Swift 브릿지가 필요할 수 있어. 이 부분은 Claude Code가 도와줄 수는 있지만, 1인 개발 난이도는 올라가.

## 손글씨 수식 인식은 외부 API가 현실적

여기서 가장 중요한 판단.

**수학 풀이 손글씨를 직접 OCR/인식하는 건 Claude Code로 자체 개발할 영역이 아님.**  
MVP에서는 외부 API를 붙이는 게 맞아.

| 선택지 | 역할 |
|---|---|
| Mathpix | 손글씨 수학, STEM OCR, LaTeX 변환 |
| MyScript iink SDK | 디지털 잉크/손글씨/수식 인식 |
| 자체 오픈소스 모델 | 연구용 가능, 제품용은 난이도 높음 |

Mathpix는 이미지, stroke data, PDF에서 인쇄·손글씨 STEM 콘텐츠와 수학을 인식한다고 설명하고, LaTeX/Mathpix Markdown 등으로 변환할 수 있다. ([docs.mathpix.com](https://docs.mathpix.com/?utm_source=chatgpt.com)) MyScript iink SDK도 handwriting recognition과 interactive ink 기능을 제공하고, 수식 인식까지 지원하는 방향의 SDK다. ([developer.myscript.com](https://developer.myscript.com/docs/interactive-ink?utm_source=chatgpt.com))

## 내가 추천하는 MVP 개발 순서

### 1단계: Claude Code로 충분히 가능

```text id="vetg8t"
Next.js 웹
Supabase Auth
문제사진 업로드
오늘의 회독 홈
오답회수 모드 UI
풀이 캔버스
stroke JSON 저장
풀이 이미지 저장
AI 분석 결과 카드
```

이 단계의 목표는:

> “학생이 문제를 올리고, 패드로 풀고, 틀리면 오답회수 모드로 넘어간다.”

여기까지는 Claude Code로 충분히 가능.

### 2단계: AI 분석 붙이기

```text id="f002ip"
OCR API
LLM 분석 Agent
과목/단원/유형 태깅
오답 원인 후보
복습 예약
오늘의 회독 생성
```

순공대장 구조상 외부 데이터는 문제사진·인강기록·캡처·메모를 받아 “회독 가능한 학습 객체”로 바꾸는 Source-to-Quest Engine으로 가야 한다. fileciteturn0file11 이 정도는 Claude Code + API 조합으로 가능.

### 3단계: 패드 풀이과정 고도화

```text id="287rpw"
풀이 스트로크 리플레이
풀이 단계별 시간 분석
지운 횟수/막힌 구간 분석
Mathpix/MyScript 연동
수식 LaTeX 변환
오답 원인 자동 추론
```

이 단계부터는 “Claude Code로 개발”은 가능하지만, **외부 API와 품질 검수**가 핵심이야.

## 순공대장에 맞는 최종 판단

나는 이렇게 가는 게 제일 좋다고 봐.

> **처음부터 네이티브 앱의 완벽한 패드 필기 인식으로 가지 말고, 웹/iPad에서 tldraw 기반 풀이 캔버스를 먼저 만든다.**  
> 학생 풀이를 stroke JSON + 이미지로 저장하고, AI는 그걸 문제사진·오답·회독 데이터와 연결한다.  
> 손글씨 수식 인식은 Mathpix/MyScript를 나중에 붙인다.

즉, Claude Code 개발 가능 영역은 충분히 넓어.

**MVP 이름으로는 이렇게 잡으면 좋음:**

```text id="q3pe7v"
풀이흔적 캡처
```

또는 순공대장식으로:

```text id="im18iu"
풀이회수
```

기능 정의는 이거야.

> **학생이 패드에 푼 풀이과정을 저장하고, AI가 오답 원인과 회독 퀘스트로 바꾸는 기능.**

이건 순공대장의 차별점이 될 수 있어. 단순 문제사진 앱이 아니라, **학생이 실제로 어떻게 풀었는지까지 회독 자산으로 만드는 구조**니까.
