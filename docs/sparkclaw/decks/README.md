# 순공대장 사업소개서 Deck (SOO-78)

순공대장 IR/사업소개서 deck. soongong 디자인 시스템(v2 teal/mint)으로 빌드. **일반 IR로도 그대로 쓸 수 있는 독립 문서** — 특정 제출처/프로그램 지향 메시지는 본문에 넣지 않는다.

| 산출물 | 파일 | 슬라이드 | 성격 |
|---|---|---|---|
| Deck A | `순공대장_사업소개서.pdf` | 17 | 메인 사업소개서 (정체성→문제→솔루션→콴다·포지셔닝→제품/플랫폼→시장→BM→트랙션→팀→비전) |
| Deck B | `순공대장_에이전트_개발형태.pdf` | 9 | 보조 자료 — "순공을 어떻게 만드는가" (통제된 AI 엔지니어링) |

- 16:9(1280×720px→960×540pt) · Pretendard · 한국어(영문 tagline 병기).
- 디자인 SSoT = `apps/web/src/shared/styles/tokens.css`. 테마(`soongong-deck-theme.css`)는 그 토큰의 CSS 변수 복제 — 슬라이드 마크업은 raw hex 0건, 전부 `var(--*)` 참조.
- deck 비주얼 = 승인 브랜드 자산만 사용: 히어로 `apps/web/public/brand/main_concepting_.png`(Deck A 표지), 로고 `apps/web/public/brand/soongong_icon_main.png`(Deck A 클로징·Deck B 표지·footer). **`mascot/main-alpha.png`(왕관 듀공 전신)은 Mike가 "안 쓰는 마스코트"로 지정 — deck에서 제거됨**(SOO-260619-06). 임의 마스코트·예전 캐릭터 생성 금지.

## ⏳ 대기 중 (placeholder)

1. **게임 · 회독 플레이 화면** (Deck A #10) — Mike가 직접 개발한 실제 게임 화면 스크린샷 전달 예정. 현재 `.ph` 칸. (예전 `app_UI.png`/`web_ui.png`는 v2에서 사용하지 않음.)
2. **‘시냅스’ — 기억 연결 시각화** (Deck A #10) — Mike가 시냅스 화면 전달 예정. 현재 `.ph` 칸.
3. **시장 데이터 시각화** (Deck A #13) — 와꾸 확정: 망각곡선·인출연습 학술근거 → 듀오링고형 리텐션 대규모 작동 → 한국 사교육·수능 시장 적용의 3단 직관 차트. 핵심 정량 수치(망각곡선/듀오링고 리텐션/한국 시장 규모)는 딥리서치 트랙 결과로 교체 예정 — 현재 3-컬럼 차트 placeholder.

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
