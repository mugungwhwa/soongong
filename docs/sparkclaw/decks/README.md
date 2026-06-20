# 순공대장 사업소개서 Deck (SOO-78)

순공대장 IR/사업소개서 deck. soongong 디자인 시스템(v2 teal/mint)으로 빌드. **일반 IR로도 그대로 쓸 수 있는 독립 문서** — 특정 제출처/프로그램 지향 메시지는 본문에 넣지 않는다.

| 산출물 | 파일 | 슬라이드 | 성격 |
|---|---|---|---|
| Deck A | `순공대장_사업소개서.pdf` | 19 | 메인 사업소개서 (정체성→문제→솔루션→콴다·포지셔닝→제품/플랫폼→**시장 4장: 망각곡선#5→듀오링고#13→한국TAM#14→경쟁 포지셔닝맵#15**→BM→트랙션→팀→비전) |
| Deck B | `순공대장_에이전트_개발형태.pdf` | 9 | 보조 자료 — "순공을 어떻게 만드는가" (통제된 AI 엔지니어링) |

- 16:9(1280×720px→960×540pt) · Pretendard · 한국어(영문 tagline 병기).
- 디자인 SSoT = `apps/web/src/shared/styles/tokens.css`. 테마(`soongong-deck-theme.css`)는 그 토큰의 CSS 변수 복제 — 슬라이드 마크업은 raw hex 0건, 전부 `var(--*)` 참조.
- deck 비주얼 = 승인 자산만 사용: 히어로 `apps/web/public/brand/main_concepting_.png`(Deck A 표지), 로고 `apps/web/public/brand/soongong_icon_main.png`(footer·로고 락업), 반신 마스코트 `apps/web/public/mascot/main-half*.png`(표정 4종: 기본·cheer·comeon·good 누끼 — Deck B 표지=cheer, Deck A 클로징=기본). **`mascot/main-alpha.png`(왕관 듀공 전신)은 Mike가 "안 쓰는 마스코트"로 지정 — deck에서 제거·계속 금지**(SOO-260619-06). 임의 마스코트·예전 캐릭터 생성 금지.

## ⏳ 대기 중 (placeholder)

1. **게임 · 회독 플레이 화면** (Deck A #10) — Mike가 직접 개발한 실제 게임 화면 스크린샷 전달 예정. 현재 `.ph` 칸. (예전 `app_UI.png`/`web_ui.png`는 v2에서 사용하지 않음.)
2. **‘시냅스’ — 기억 연결 시각화** (Deck A #10) — Mike가 시냅스 화면 전달 예정. 현재 `.ph` 칸.

자료 입수 시 해당 슬라이드의 `.ph` placeholder를 실제 이미지/차트로 교체 후 재렌더.

## 📊 시장 데이터 (딥리서치 반영 완료 — SOO-260619-06)

시장 슬라이드 4장 구성으로 확정 + Orchestration 딥리서치 수치 반영. 전부 공개 출처 + 신뢰도 표기, **효과수치 주장이 아니라 시장·학술 근거**.

- **#5 망각곡선(문제)** — 1일 ~70% 망각(업계 통용치·2차) + 인출연습 1주 뒤 회상 2배+(80%/36%, K&R *Science* 2008·1차). ⚠️ 기존 "4배"는 원논문과 충돌해 "2배 이상"으로 교정.
- **#13 듀오링고(검증된 모델)** — DAU 5,000만 / 유료 1,090만 / 연매출 $748M(83% 구독) [Duolingo IR·SEC 8-K·1차]. 인과(스트릭→리텐션 N%) 단정 금지 → "규모=작동 증거"로만.
- **#14 한국 TAM(깔때기)** — 사교육 29.2조 → 고등 8.1조 → 수능 지원자 52.3만(522,670) [통계청 2024 사교육비조사·평가원·1차]. ⚠️ 구 수치(27.5조/7.8조/55만) 갱신.
- **#15 경쟁 포지셔닝 맵(2x2)** — X: 막힘 해결↔까먹음 해결 / Y: 수동 소비↔습관·게이미피케이션. 좌하 군집 콴다(누적 1억+·MAU 500만+)·메가스터디·밀크티·뤼이드/산타, 상단-좌 ZEP QUIZ(교실 게임화·B2B 학교, 다른 맥락) → 우상 빈 사분면 = 순공대장(까먹음×개인 습관, 참조점 듀오링고). 메시지: "풀어주거나·가르쳐주거나·맞춰주거나·교실서 게임화하지만, 개인의 '까먹지 않게+매일 하게'는 순공뿐." 규모=공개자료·추정 범위, 콴다 계승 톤. (ZEP=JEP QUIZ 확정, Mike 2026-06-20)
- 출처 원문: Orchestration 보유 `시장리서치-망각곡선-듀오링고.md`.
- ⚠️ **타 문서 잔존 구 수치**(`docs/sparkclaw/2026-05-14-sparkclaw-submission.md`, `slide-deck-draft.md`, 루트 `2026-05-19-순공대장_전략_정리.md`, 루트 `README.md`)는 본 deck 범위 밖 — 전략 SSoT 갱신은 Orchestration 라우팅 필요.

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
