# SparkClaw 제출 Deck 2종 (SOO-78)

SparkClaw 1기(2026-06-28) 제출용 deck. soongong 디자인 시스템(v2 teal/mint)으로 빌드.

| 산출물 | 파일 | 슬라이드 | 본문 SSoT |
|---|---|---|---|
| Deck A | `순공대장_사업소개서.pdf` | 13 | SOO-76 본문 |
| Deck B | `순공대장_에이전트_개발형태.pdf` | 8 | SOO-76 코멘트 3/n |

- 16:9 (1280×720px → 960×540pt), Pretendard, 한국어(영문 tagline 병기).
- 디자인 SSoT = `apps/web/src/shared/styles/tokens.css`. 테마(`sparkclaw-theme.css`)는 그 토큰의 CSS 변수 복제 — 슬라이드 마크업은 raw hex 0건, 전부 `var(--*)` 참조.
- 캐릭터/시안 = 실재 repo 파일만 (`apps/web/public/mascot/main-alpha.png`, `web_ui.png`, `assets/app-home-thumb.png`(= `app_UI.png` 홈 화면 crop)).

## ⏳ 라이브 데모 링크 대기 (Deck A #6 · #12)

Mike 확정값 #4에 따라 제품 화면은 풀 목업 대신 **라이브 데모 링크(QR + 단축 URL) + 작은 썸네일 1컷**으로 처리.
현재 QR/단축 URL은 **placeholder**(“링크 대기”). Mike가 링크 제공 시:

1. `deck-a.html`에서 `데모 QR<br>(링크 대기)` / `단축 URL · QR는 Mike 제공 예정` 두 곳(#6, #12)을 실제 QR `<img>` + URL로 교체.
2. 아래 재렌더 명령 실행.

## 재렌더 (HTML → PDF)

```bash
cd docs/sparkclaw/decks
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # 또는 chromium
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=12000 --run-all-compositor-stages-before-draw \
  --print-to-pdf="순공대장_사업소개서.pdf" "file://$PWD/deck-a.html"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=12000 --run-all-compositor-stages-before-draw \
  --print-to-pdf="순공대장_에이전트_개발형태.pdf" "file://$PWD/deck-b.html"
```

> Pretendard는 jsdelivr CDN으로 로드되므로 렌더 시 네트워크 필요. PPTX가 필요하면 동일 HTML을 Marp/디자이너 PPTX 파이프라인에 투입.
