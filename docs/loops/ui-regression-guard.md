# UI 회귀 가드 플레이북 (기계 DoD 게이트)

> **소유**: UI·디자인 리드 · **파일럿**: SOO-166 UI 디자인 회귀 가드 자율 루프 · **Stage 1** 산출물
> **목적**: 오토파일럿에 배정된 UI 에이전트가 **사람 없이 그대로 실행**할 수 있는, 매일 UI 회귀 자동 스캔·판정 절차. 검사 항목·명령·통과 기준을 전부 기계 검증 가능하게 못박는다.
>
> **범위 경계**: 스캔·판정·수정 서브티켓 **생성**까지. 코드 자동 수정은 이 파일럿 범위 밖(후속 논의). 스코프 확대 금지.

---

## 0. 실행 전제 (에이전트가 매 실행 시작 시)

```bash
# 레포 루트 기준. 게이트 스크립트는 pnpm workspace 루트 스크립트로 노출돼 있다.
pnpm install --frozen-lockfile   # node_modules 없으면 필수 (tsx/depcruise 실행에 필요)
```

- 모든 `pnpm lint:*` 게이트는 **레포 루트에서** 실행한다(루트 `package.json`이 `--filter web`으로 위임).
- 판정 기준 SSoT 우선순위: **픽셀(`app_UI.png`/`web_ui.png`) > `순공대장_UI_설계.md` > `design-review` 스킬**. 충돌 시 픽셀이 이긴다.
- 검수 잣대는 워크스페이스 바인딩 `design-review` 스킬(§2~§3)이 유일 기준. **Treenod/전역/플러그인의 동명 `design-review`(8대 패턴 점수제)는 쓰지 않는다** — 근거는 §4 참조.

---

## 1. 스캔 대상 (어떤 diff를 검사할지)

기본은 **최근 병합/변경된 UI 관련 파일**만 검사한다(전체 재스캔은 비용 과다·노이즈).

### 1-1. 스캔 윈도우 결정
- **일일 루프(스케줄 트리거)**: 직전 판정 이후 `main`에 병합된 커밋 범위.
  ```bash
  # 마지막 성공 판정 커밋 SHA를 부모 이슈 metadata(last_scanned_sha)에서 읽어 diff.
  # 최초 실행 등으로 값이 없으면 최근 24h로 폴백.
  BASE="${LAST_SCANNED_SHA:-$(git rev-list -1 --before='24 hours ago' main)}"
  git diff --name-only "$BASE"...main
  ```
- **PR 단위 검사**: `git diff --name-only origin/main...HEAD`.

### 1-2. UI 관련 파일 필터
아래 경로에 걸리는 변경이 **하나라도 있으면** 이 루프를 돌린다. 없으면 "UI 변경 없음 — 스킵"으로 판정하고 종료(위반 아님).

```bash
git diff --name-only "$BASE"...main | grep -qE \
  '^apps/web/src/(app|views|widgets|features|entities|shared)/.*\.(tsx|css)$|^apps/web/src/shared/styles/tokens\.css$|^docs/visual-assets/|\.(png|jpg|jpeg|webp)$' \
  && echo "UI diff detected — run gates" \
  || echo "No UI diff — skip (not a violation)"
```

> `apps/web/src/**`의 `.tsx`/`.css`, 토큰 SSoT(`tokens.css`), 시각 자산(png/jpg류)이 검사 대상. 순수 서버/유틸/문서 변경만 있으면 스킵.

---

## 2. 기계 게이트 목록 + 정확한 명령

> 전부 **레포 실존 명령**으로 검증됨(2026-07-02, 이 파일 작성 시 실행 확인). **exit code 0 = pass, 0 아님 = fail.**

| # | 게이트 | 정확한 명령 | 실체 | pass 기준 | 자동화 |
|---|---|---|---|---|---|
| G1 | 디자인 토큰 (등록 외 hex 차단) | `pnpm lint:tokens` | `apps/web/scripts/check-tokens.ts` (화이트리스트를 `apps/web/src/shared/styles/tokens.css`에서 런타임 추출) | exit 0 | 완전 |
| G2 | 다크모드 위반 | `pnpm lint:no-dark` | `apps/web/scripts/check-no-dark.ts` (`\bdark:[a-z0-9-]+` 정규식, `src/**` `.ts`/`.tsx`) | exit 0 | 완전 |
| G3 | FSD 아키텍처 린트 | `pnpm lint:arch` | `depcruise src --config .dependency-cruiser.cjs` (레이어 단방향 의존) | exit 0 (`no dependency violations found`) | 완전 |
| G4 | design-review 합성검사 | `design-review` 스킬 로드 후 변경 화면 판정 | 워크스페이스 바인딩 스킬 §2~§3 | **blocking ❌ 0건** (§4 참조) | 반자동(에이전트 판정) |

### 보조 게이트 (권장, 환경 가용 시)
| # | 게이트 | 명령 | 비고 |
|---|---|---|---|
| G5 | 이미지 폐기어 OCR (PNG 속 "회독마왕/해마왕" 등) | `pnpm lint:images` | `scripts/check-image-deprecated.sh --all`. **tesseract + kor 언어팩 필요**(`brew install tesseract tesseract-lang`). 미설치 시 스킵하고 결과에 `skipped(no tesseract)` 명시 — false-pass로 처리 금지. |
| G6 | 서브브랜드 스코프 | `pnpm lint:sub-scope` | `check-sub-brand-scope.ts`. 서브브랜드 토큰 유출 검사. |

### 폐기항목 회귀 grep — **정본 게이트가 우선, grep은 보조**
`design-review` §2-4의 grep은 **참고용 휴리스틱**이다. 단독 판정 기준으로 쓰지 마라:
- **다크 네이비 hex(`#1a1a2e`/`#16213e`류)**: 별도 grep 불필요 — **G1(`lint:tokens`)이 화이트리스트 외 모든 hex를 이미 차단**한다. 다크 네이비는 34개 토큰에 없으므로 자동 fail 처리됨.
- **`dark:` 클래스**: **G2(`lint:no-dark`)가 정본**. naive `grep -rn "dark:"`는 `/styleguide` 쇼케이스 페이지가 규칙 자체를 문서화한 텍스트(예: 백틱 `` `dark:` ``, `dark:</code>`)를 오탐한다(실측: raw grep 6건 hit이나 G2는 0건 통과). **정밀 정규식을 쓰는 G2를 신뢰하라.**
- **"회독마왕"/"RPG" 텍스트**: 코드 텍스트는 아래 grep, **이미지 속 글자는 G5(OCR)**로만 잡힌다. 코드 grep도 `/styleguide`가 폐기어를 "인용·표시"하므로 오탐 존재 → hit 시 **styleguide 인용인지 신규 도입인지 사람/에이전트 확인** 후 판정.
  ```bash
  # styleguide 쇼케이스(규칙 문서화) 제외 후 신규 도입만 탐지
  grep -rEin "회독마왕|dark study rpg" apps/web/src \
    | grep -v 'src/views/styleguide/' || echo "no new deprecated-keyword introduction"
  ```

---

## 3. 판정 규칙

1. **각 게이트 독립 판정**: G1~G4 각각 pass/fail. 하나라도 fail → 이번 스캔은 **위반(FAIL)**.
2. **G1/G2/G3**: exit code로 자동 판정. 비-0 = fail.
3. **G4(design-review)**: 워크스페이스 `design-review` 스킬을 로드해 §2 항목별(✅/△/❌) + §3 매트릭스 판정 실행.
   - **blocking ❌ 1건 이상 → G4 fail.**
   - **△(경미) → pass(백로그 후보로 기록)**, fail 아님.
   - §3 "거절" 패턴(잦은 푸시·빨강 하트·아이템샵·passive-aggressive)을 따라 했으면 ❌.
4. **G5**: tesseract 가용 시 exit code 판정. 미가용 시 `skipped` — **pass로 간주하지 않고 결과에 그대로 노출**.
5. **최종 판정**: `G1 && G2 && G3 && G4(0 blocking) == PASS`. 하나라도 fail → **FAIL**, §4 액션 실행.

---

## 4. design-review 게이트를 "≥70점"이 아니라 "0 blocking ❌"로 정의하는 이유 (편차 명시)

- 부모 티켓·레거시 `CLAUDE.md` §4는 "design-review ≥ 70점(8대 패턴)"을 게이트로 적었다.
- 그러나 **워크스페이스 바인딩 `design-review` 스킬은 숫자 점수를 산출하지 않는다** — §2~§3 항목별 ✅/△/❌ 합성검사다.
- "8대 패턴 점수제"는 **Treenod 사내 스킬(`design-system:design-review`)**로, soongong 비주얼 SSoT와 무관하며 UI·디자인 리드 Agent Identity + `design-review` 스킬 §0이 **사용을 금지**한다.
- 따라서 이 루프의 G4 통과 기준은 **`design-review` 합성검사 blocking ❌ 0건**으로 정의한다(Instruction Precedence상 Agent Identity 우선).
- ⚠️ **후속 정리 필요**: 레거시 `CLAUDE.md` §4의 "design-review ≥70 8대 패턴" 표기는 이 루프 기준과 불일치 → 별도 티켓에서 표기 정합화 권장(이 문서 범위 밖).

---

## 5. 위반 시 액션 — 수정 서브티켓 생성 템플릿

> 자동 **생성**까지만. 자동 수정은 범위 밖. 위반 게이트마다 서브티켓 1개.

- **부모**: 해당 일일 UI 회귀 스캔 이슈(스케줄 오토파일럿이 생성).
- **assignee**: UI·디자인 리드(`d6045fd0-a675-4901-9143-1acdc6a1bc5e`).
- **status**: `todo`(즉시 착수) — 단, 파일럿 범위 준수를 위해 코드 자동 수정 금지, 사람 확인 후 진행.
- **중복 방지**: 같은 파일·같은 게이트 조합의 열린 서브티켓이 이미 있으면 생성 대신 코멘트로 갱신.

**제목**: `[UI회귀] {게이트ID} 위반 — {파일 또는 화면}`

**본문 템플릿**:
```markdown
## UI 회귀 게이트 위반
- **게이트**: {G1 lint:tokens | G2 lint:no-dark | G3 lint:arch | G4 design-review | G5 이미지OCR}
- **탐지 스캔**: {일일 스캔 이슈 링크 / PR 링크}
- **diff 범위**: {BASE_SHA}...{HEAD_SHA}
- **위반 위치**: {파일:라인 또는 화면명}
- **게이트 출력**:
  ```
  {명령 stderr/stdout 발췌 — 예: "❌ src/....tsx: 등록 외 hex \"#1a1a2e\""}
  ```
- **위반 유형**: {등록 외 hex / dark: 클래스 / FSD 레이어 역방향 / design-review §{n} blocking ❌ / 폐기어 회귀}
- **SSoT 근거**: {tokens.css / 순공대장_UI_설계.md / design-review §x}
- **제안 방향(수정은 별도)**: {예: hex를 var(--token)으로 교체 / dark: 제거 / 데사처드 pill로 변경}

## DoD
해당 게이트 재실행 시 pass(exit 0 또는 blocking ❌ 0건). 수정은 `agent/ui-design/<id>` 브랜치 PR + 코드래빗 승인.
```

**생성 명령 예**(본문은 파일로 작성 후 `--description-file`):
```bash
multica issue create \
  --title "[UI회귀] G1 lint:tokens 위반 — apps/web/src/views/foo.tsx" \
  --description-file /tmp/ui_regression_ticket.md \
  --parent <일일-스캔-이슈-id> \
  --assignee-id d6045fd0-a675-4901-9143-1acdc6a1bc5e \
  --status todo
```

---

## 6. 취합 출력 포맷 (부모 이슈 / 취합 오토파일럿이 읽음)

일일 스캔 이슈에 **정확히 1개 결과 코멘트**를 남긴다. SOO-165 취합 오토파일럿이 파싱하도록 아래 고정 포맷 준수.

```markdown
## UI 회귀 가드 결과 — {YYYY-MM-DD}
- **판정**: PASS | FAIL | SKIPPED(UI 변경 없음)
- **diff 범위**: {BASE_SHA}...{HEAD_SHA} ({N} files)
- **게이트 판정표**:

| 게이트 | 명령 | 결과 |
|---|---|---|
| G1 tokens | `pnpm lint:tokens` | ✅ pass / ❌ fail |
| G2 no-dark | `pnpm lint:no-dark` | ✅ / ❌ |
| G3 arch | `pnpm lint:arch` | ✅ / ❌ |
| G4 design-review | 합성검사 | ✅ (0 blocking) / ❌ (n건) |
| G5 image-OCR | `pnpm lint:images` | ✅ / ❌ / ⏭ skipped(no tesseract) |

- **위반 상세**: {없음 | 게이트별 위치 목록}
- **생성한 수정 서브티켓**: {없음 | SOO-xxx 목록}
- **경미(△, 백로그 후보)**: {없음 | 목록}
```

**머신 파싱용 메타**(취합 오토파일럿이 롤업 시 사용, 스캔 이슈 metadata에 pin):
- `verdict`: `pass|fail|skipped`
- `gates_failed`: 콤마 구분(예: `G1,G4`) 또는 빈 값
- `regression_tickets`: 생성한 서브티켓 키 콤마 구분
- `last_scanned_sha`: 이번에 검사한 HEAD SHA(다음 일일 diff 베이스)

---

## 7. 검증 로그 (이 문서 DoD)

작성 시점(2026-07-02) 레포에서 게이트 명령 실행 확인:

| 명령 | 결과 |
|---|---|
| `pnpm lint:tokens` | exit 0 — `✅ 모든 hex가 토큰 화이트리스트 안에 있음 (34개 토큰)` |
| `pnpm lint:no-dark` | exit 0 — `✅ 다크모드 0건 (라이트 단일)` |
| `pnpm lint:arch` | exit 0 — `✔ no dependency violations found (306 modules, 718 dependencies cruised)` |
| `pnpm lint:sub-scope` / `pnpm lint:images` | 스크립트 실존(`check-sub-brand-scope.ts` / `check-image-deprecated.sh`); `lint:images`는 tesseract 필요 |
| `design-review` 스킬 | 워크스페이스 바인딩 스킬 로드 가능, §2~§3 합성검사 프레임 |

**존재하지 않는 명령 없음.** 모든 G1~G3는 CI(`arch-lint.yml`은 G3만)·pre-commit(`scripts/hooks/pre-commit`은 G5 이미지 게이트만) 외에도 이 루프가 명시 실행한다.
