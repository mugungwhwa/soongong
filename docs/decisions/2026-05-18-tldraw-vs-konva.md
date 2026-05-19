# tldraw vs Konva 결정 (P0 Day 3 spike)

> 본 문서는 P0 plan Task 9의 결정 산출물. tldraw 상용 라이선스 필요 여부 + Konva 폴백 계획 잠금.

## 1. 설치된 tldraw 버전

- 버전: **`tldraw@5.0.1`** (plan에서 v3 가정했으나 latest 5.x 설치됨)
- 라이선스: [tldraw license](https://github.com/tldraw/tldraw/blob/main/LICENSE.md)
- node_modules/tldraw/LICENSE.md 확인: own license (MIT 아님)

## 2. tldraw 라이선스 룰 (v5 기준)

| 사용 | 워터마크 | 비용 |
|---|---|---|
| 개발 / 데모 / 학습 | 우측 하단 "made with tldraw" 표시 | $0 |
| 상용 출시 (워터마크 제거) | 제거 가능 | 유료 (회사 매출/직원 수 기준 차등) |

상용 라이선스 가격은 https://tldraw.dev 문의 — public pricing 없음.

## 3. 우리 상황

| 단계 | 결정 |
|---|---|
| **P0 와꾸 (현재)** | tldraw v5 그대로 사용, 워터마크 표시 OK (데모 단계) |
| **SparkClaw 데모** | 워터마크 OK (1인 창업 데모 트랙) |
| **MVP 1차 출시 (학생 100명 검증)** | 워터마크 그대로 또는 상용 라이선스 평가 |
| **본격 상용 (출시 후 매출)** | tldraw 상용 라이선스 구매 또는 Konva 전환 |

## 4. Konva 폴백 plan (B 옵션)

tldraw 상용 비용 부담 시 Konva로 전환:

| 비교 | tldraw | Konva |
|---|---|---|
| 즉시 사용 가능 컴포넌트 | ✅ `<Tldraw />` 한 줄 | ❌ Stage/Layer/Line 직접 그림 |
| 자유 그리기 (펜) | ✅ 기본 제공 | 직접 구현 (Pointer event + Line) |
| Undo/Redo | ✅ 기본 제공 | 직접 구현 |
| stroke JSON 저장 | ✅ `editor.store.getSnapshot()` | 직접 직렬화 |
| 비용 | 워터마크 또는 상용 | MIT 무료 |
| 전환 비용 | — | **1-2일 spike** (P6 와꾸에서 평가) |

전환 결정 시점: **MVP 출시 직전 비용 트레이드오프 + Konva 1일 spike 결과**.

## 5. 본 단계 결정 (Mike OK 받음)

- ✅ **tldraw v5 그대로 P0 와꾸 진행**
- ✅ 워터마크 표시 허용
- ⏳ Konva 1일 spike는 본격 상용 진입 시점 결정 (현재는 미정)

## 6. 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-18** | 초안. tldraw v5 워터마크 무료 사용 + Konva 폴백 plan + 본격 상용 시 재평가 |
