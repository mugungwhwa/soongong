# 순공대장 사업소개서 Deck (SOO-78)

순공대장 IR/사업소개서 deck. soongong 디자인 시스템(v2 teal/mint)으로 빌드. **일반 IR로도 그대로 쓸 수 있는 독립 문서** — 특정 제출처/프로그램 지향 메시지는 본문에 넣지 않는다.

| 산출물 | 파일 | 슬라이드 | 성격 |
|---|---|---|---|
| Deck A | `순공대장_사업소개서.pdf` | 17 | 메인 사업소개서 (정체성→문제→솔루션→콴다·포지셔닝→제품/플랫폼→시장→BM→트랙션→팀→비전) |
| Deck B | `순공대장_에이전트_개발형태.pdf` | 9 | 보조 자료 — "순공을 어떻게 만드는가" (통제된 AI 엔지니어링) |

- 16:9(1280×720px→960×540pt) · Pretendard · 한국어(영문 tagline 병기).
- 디자인 SSoT = `apps/web/src/shared/styles/tokens.css`. 테마(`soongong-deck-theme.css`)는 그 토큰의 CSS 변수 복제 — 슬라이드 마크업은 raw hex 0건, 전부 `var(--*)` 참조.
- 캐릭터 = 현행 repo SSoT(`apps/web/src/shared/ui/mascot.tsx` → `apps/web/public/mascot/main.png`/`main-alpha.png`). 임의 생성 금지.

## ⏳ 대기 중 (placeholder)

1. **제품 화면** (Deck A #10) — Mike가 직접 개발한 실제 스크린샷 전달 예정. 현재 placeholder 칸. (예전 `app_UI.png`/`web_ui.png`는 v2에서 사용하지 않음.)
2. **시장 데이터 시각화** (Deck A #13) — 별도 딥리서치 트랙 결과 반영 예정. 현재 차트 placeholder + exam-agnostic 확장 흐름만.

자료 입수 시 해당 슬라이드의 `.ph` placeholder를 실제 이미지/차트로 교체 후 재렌더.

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

> Pretendard는 jsdelivr CDN으로 로드되므로 렌더 시 네트워크 필요. PPTX가 필요하면 동일 HTML을 디자이너 PPTX 파이프라인에 투입.
