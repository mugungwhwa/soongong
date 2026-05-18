# 순공이 캐릭터 디자인 에이전트 — DEPRECATED

> ⚠️ **DEPRECATED (2026-05-18)**: 본 SSoT 240줄 전체는 `docs/superpowers/specs/2026-05-18-ui-master-design.md` v1.0 **§4**로 흡수 이관됨. 신규 작업은 UI master spec §4 참조.
>
> **본 stub의 역할:** 진행 마일스톤 표만 history 보존 + UI master 진입점 링크.

---

## 신규 진입점

- **워크플로우 / 잠긴 결정 / 절대 금지 / 품질 체크리스트** → [`ui-master-design.md §4`](../superpowers/specs/2026-05-18-ui-master-design.md#§4-마스코트캐릭터-production-워크플로우-캐릭터-ssot-흡수-)
- **트리거 문구 (Mike → Claude)**: "캐릭터 디자인 에이전트", "캐릭터 에이전트", "마스코트 작업", "순공이 디자인", "마스코트 v0.x" → UI master spec §4 자동 read

---

## 진행 마일스톤 (보존)

| 마일스톤 | 상태 | 일자 | 산출물 |
|---|---|---|---|
| **v0.1** 입수 자산 등재 | ✅ 완료 | 2026-05-18 | `mascot-v0.1/main.png` + `repeat_normal.png` |
| **v0.2** GPT-4o 표정 5종 생성 | ⏳ Mike 진행 예정 | - | `mascot-v0.2/soongong-{celebrate,think,comfort,sleep,surprise}.png` |
| **v0.3** 투명화 + 5단 다운스케일 | 대기 (v0.2 의존) | - | 7 슬롯 × 5 사이즈 = 35장 |
| **v0.4** `apps/web/public/mascot/` 배포 | 대기 (v0.3 의존) | - | Next.js Image 매핑 |
| **v1.0** P5 sub-plan `mascot.tsx` 완전 매핑 | 대기 (P5 진입 후) | - | 모든 placeholder 제거 |

마일스톤 갱신은 본 stub에 직접 commit (UI master spec §4.9도 동기 갱신).

---

## 변경 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| **v1.0** | **2026-05-18** | 초안 240줄. 정체성 / 잠긴 결정 11 / 금지 7 / GPT-4o 워크플로우 / 산출 명세 / 품질 체크 9 / 투명화 슬롯 7 / 진행 마일스톤 / 팔로업 프로토콜. |
| **DEPRECATED** | **2026-05-18** | UI master spec §4로 흡수. 본 파일은 마일스톤 표만 보존하는 stub로 축소 (240줄 → ~30줄). |
