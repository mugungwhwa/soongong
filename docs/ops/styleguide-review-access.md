# Styleguide 리뷰 URL 접근 가이드

**작성**: 2026-06-17 (SOO-54)  
**갱신**: 2026-06-22 (SOO-106 — 공개 프로덕션 URL 전환)  
**담당**: UI·디자인 리드 / 플랫폼·인프라 리드

---

## 현행 (SOO-106) — 공개 프로덕션 URL

`/styleguide`는 **통합 UI·디자인 + 플랫폼 개발 가이드라인 라이브 사이트**이자 Mike 체크포인트 열람 수단이다. 따라서 **프로덕션 공개 URL로 직접 열린다**:

```text
https://soongong-web.vercel.app/styleguide
```

- ✅ 모든 환경(production 포함)에서 렌더 — `page.tsx` 의 env 게이트 제거(SOO-106).
- ✅ 검색엔진 비노출 — `metadata.robots = { index: false, follow: false }` 유지(unlisted). 토큰·브랜드 자산만 포함, PII/사업 기밀 없음.
- 토큰·매번 다른 PR URL·Vercel 로그인 없이 북마크 한 번으로 접근.

> 아래 "preview 고정 URL(SOO-54)" 섹션은 production 이 404였을 때의 우회책이었다. 현행에선 위 공개 프로덕션 URL을 기본 열람 수단으로 쓴다. preview 별 빌드 확인이 필요할 때만 참고.

---

## (구) preview 고정 URL — SOO-54 (production 404 시절 우회책)

> ⚠️ **이 섹션은 SOO-106 이전 상태 기준.** 당시 `/styleguide`는 preview 전용(production 404)이라, Mike가 매번 다른 PR URL·Vercel 로그인 없이 접근하도록 main preview 고정 URL을 구성했다. 지금은 공개 프로덕션 URL이 있으므로 보조 수단이다.

당시 상태:
- ✅ 앱 로그인 차단 면제 — middleware `isPublic` 목록 (SOO-48)
- ✅ production 404 — `page.tsx` `isStyleguideVisible()` env 게이트 (**SOO-106에서 제거**)
- ❌ Vercel Deployment Protection — 브라우저에서 401 반환 (이 문서가 해결)
- ❌ PR마다 URL 변경 — main 브랜치 고정 alias로 해결 (이 문서가 해결)

---

## 고정 URL (변경 없음)

Vercel은 모든 브랜치에 대해 고정 preview URL을 자동 생성한다. `main` 브랜치:

```text
https://soongong-web-git-main-mikeikhoonkim1208-2196s-projects.vercel.app
```

이 URL은 PR과 무관하게 항상 **최신 main 빌드**를 가리키며 `VERCEL_ENV=preview`이므로 `/styleguide` 환경 게이트를 통과한다.

---

## 설정 단계 (Vercel Dashboard — 1회만)

### 1. Protection Bypass 토큰 생성

1. [Vercel Dashboard](https://vercel.com) → **soongong-web** 프로젝트
2. **Settings** → **Deployment Protection**
3. **Protection Bypass for Automation** 섹션 → **Generate Secret** 클릭
4. 표시되는 시크릿 값을 복사 (재표시 불가 — 즉시 저장)

> ⚠️ 이 토큰을 코드/커밋/이슈에 평문으로 절대 기록하지 않는다. Vercel 설정 내에서만 관리.

### 2. 북마크 URL 조합

아래 URL에서 `<BYPASS_SECRET>` 자리에 1단계에서 복사한 토큰을 붙여넣는다:

```text
https://soongong-web-git-main-mikeikhoonkim1208-2196s-projects.vercel.app/styleguide?x-vercel-protection-bypass=<BYPASS_SECRET>&x-vercel-set-bypass-cookie=samesitenone;secure
```

이 URL을 브라우저에서 **최초 1회 방문**하면 쿠키가 자동 설정되어, 이후에는 토큰 없이 아래 URL만으로 접근 가능:

```text
https://soongong-web-git-main-mikeikhoonkim1208-2196s-projects.vercel.app/styleguide
```

> 이 URL을 북마크한다. 쿠키 만료(기본 2주) 또는 브라우저 초기화 시 토큰 URL로 재방문.

---

## 보안 트레이드오프

| 항목 | 내용 |
|---|---|
| 공개 범위 | 프로덕션 URL을 아는 누구나 접근 가능 (unlisted — 검색 비노출) |
| 검색 노출 | `robots noindex/nofollow` 로 차단 — 색인되지 않음 |
| 민감 데이터 | styleguide는 디자인 토큰·브랜드 자산만 포함 (PII/사업 기밀 없음) |
| 토큰 노출 대응 | (preview 우회책 한정) Vercel Dashboard에서 bypass 토큰 재생성으로 즉시 차단 |

결론: 민감 데이터 없음 + 검색 비노출(unlisted) → 공개 열람 허용 범위 내 (SOO-106, Mike 결정).

---

## 검증 체크리스트

현행 (SOO-106):
- [ ] `https://soongong-web.vercel.app/styleguide` (production) → 로그인 없이 styleguide 렌더 (404 아님)
- [ ] 시크릿 창(앱 로그인 세션 없음) → 접근 가능
- [ ] 페이지 응답 헤더/메타에 `noindex` 유지 (검색 비노출)

(구) preview 우회책:
- [ ] main preview 고정 URL → 토큰 1회 방문 후 토큰 없이 접근 가능
