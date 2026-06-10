# 머지 게이트 감사 (2026-06-10)

## 발견
- 머지 PR 33건 중 독립 리뷰(GitHub PR review) 0건, 전건 셀프머지
- 커밋 본문 내 "Tech Lead 리뷰" 자기서술 약 7건 — 절차 수행이 아닌 절차 서술
- 도메인 리드 브랜치(agent/*) 출신 PR 1건/33건

## 조치 (당일)
- main branch protection: PR 필수 + 승인 1건 + 관리자 우회 금지
- 코드래빗을 강제 리뷰 게이트로 설정 (request_changes_workflow)
- CLAUDE.md 머지 게이트 명문화 (agent/* 한정, PR review만 인정)

## 교훈
에이전트의 자기 보고는 통제가 아니다. 통제는 권한으로 강제한다.
