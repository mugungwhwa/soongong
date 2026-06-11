# 머지 게이트 라이브 검증 (2026-06-10)

`docs/audits/2026-06-10-merge-gate-audit.md`(감사) 후속. branch protection(Ruleset) + 코드래빗
강제 리뷰 게이트가 **실제로 머지를 막는지** end-to-end로 검증한 기록.

## Purpose
"에이전트의 자기 보고는 통제가 아니다. 통제는 권한으로 강제한다"는 감사 결론을 권한(Ruleset)
과 외부 독립 리뷰어(CodeRabbit)로 구현하고, 위반 경로는 거부·정상 경로는 통과함을 실측한다.

## Verification Procedure
검증에 사용한 PR/브랜치:

| 용도 | 브랜치 | PR | 비고 |
|---|---|---|---|
| 게이트 설정 deliverable + 코드래빗 연결 probe | `agent/techlead/merge-gate-001` | #38 | `.coderabbit.yaml`+CLAUDE.md v1.8+감사 노트 |
| T2 위반 경로 (무승인 머지) | `feat/gate-test` | #39 | 검증 후 close+삭제 |
| T4 사전 (config 미안착 상태) | `agent/techlead/gate-test-001` | #40 | 검증 후 close+삭제 |
| 라이브 루프 (config 안착 후) | `agent/techlead/gate-live-001` | #41 | 본 문서 |

절차: ① `gh api .../rulesets`로 보호 설정 확인 → ② 무승인 머지 시도 → ③ main 직접 push 시도
→ ④ #38 머지로 `.coderabbit.yaml`을 main에 안착 → ⑤ 신규 agent/* PR로 코드래빗 자동 리뷰
→ 변경 요청 해결 → 재승인 → 머지.

## Results

| 테스트 | 기대 | 실제 | 판정 |
|---|---|---|---|
| T1 보호 설정 | 활성 | Ruleset `main-protection`=active, target=main, 승인 1 필수, bypass 0명 | ✅ |
| T2 무승인 머지 | 거부 | `not mergeable: the base branch policy prohibits the merge` | ✅ |
| T3 직접 push | 거부 | `GH013: ...Changes must be made through a pull request` `[remote rejected]` | ✅ |
| T4 정상 경로 | 코드래빗 승인 후 머지 | 본 PR(#41) — 변경 요청 → 해결 → 재승인 → 머지 | ✅ |

## Gate Ruleset Compliance
`main-protection` ruleset(enforcement=active)이 충족한 규칙:
- **Require a pull request before merging** — T3 직접 push가 `GH013`으로 거부됨으로 확인.
- **Require approvals: 1** — T2 무승인 머지가 base branch policy로 거부됨으로 확인.
- **Do not allow bypassing (bypass_actors=[])** — 소유자도 우회 불가.
- **non_fast_forward / deletion 금지** — main 강제 갱신·삭제 차단.
- 코드래빗 approve가 `required_approving_review_count: 1`로 **카운트됨**(#38에서 reviewDecision=APPROVED + mergeStateStatus=CLEAN로 확인).

## Findings & Recommendations
1. **config-on-main 의존성**: `.coderabbit.yaml`(`request_changes_workflow: true`)이 main에 있어야
   코드래빗이 정식 approve/changes 리뷰를 제출한다. #40(main에 config 부재)은 코멘트만 달고 approve
   미제출 → BLOCKED. #38 머지 후 #41부터 정상 동작. → **게이트 활성화의 전제는 #38 머지였음.**
2. **`request_changes_workflow`가 실질 통제로 작동**: #41에서 코드래빗이 "문서-구현 불일치"를 잡아
   CHANGES_REQUESTED로 머지를 차단. 셀프머지 시절엔 통과했을 결함을 외부 리뷰어가 게이트로 차단함.
3. **봇 승인 throughput**: 무료 플랜에서 다수 PR 연속 생성 시 리뷰가 순차 처리되어 승인이 지연될 수
   있음. 게이트 결함이 아니라 서비스 특성.
4. **권장**: 향후 모든 기능 PR은 `agent/<role>/<id>` 브랜치 + 코드래빗 approve 게이트를 표준 경로로.
