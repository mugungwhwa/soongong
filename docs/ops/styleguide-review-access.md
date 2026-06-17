# Styleguide 고정 리뷰 URL 설정 가이드

**작성**: 2026-06-17 (SOO-54)  
**담당**: 플랫폼·인프라 리드

---

## 배경

`/styleguide`는 preview 환경 전용 (production은 404 유지). Mike가 Vercel 로그인·매번 다른 PR URL 없이 북마크 한 번으로 접근할 수 있도록 고정 리뷰 URL을 구성한다.

현재 상태:
- ✅ 앱 로그인 차단 면제 — middleware.ts `isPublic` 목록 (SOO-48)
- ✅ production 404 — `page.tsx` `isStyleguideVisible()` env 게이트
- ❌ Vercel Deployment Protection — 브라우저에서 401 반환 (이 문서가 해결)
- ❌ PR마다 URL 변경 — main 브랜치 고정 alias로 해결 (이 문서가 해결)

---

## 고정 URL (변경 없음)

Vercel은 모든 브랜치에 대해 고정 preview URL을 자동 생성한다. `main` 브랜치:

```
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

```
https://soongong-web-git-main-mikeikhoonkim1208-2196s-projects.vercel.app/styleguide?x-vercel-protection-bypass=<BYPASS_SECRET>&x-vercel-set-bypass-cookie=samesitenone;secure
```

이 URL을 브라우저에서 **최초 1회 방문**하면 쿠키가 자동 설정되어, 이후에는 토큰 없이 아래 URL만으로 접근 가능:

```
https://soongong-web-git-main-mikeikhoonkim1208-2196s-projects.vercel.app/styleguide
```

> 이 URL을 북마크한다. 쿠키 만료(기본 2주) 또는 브라우저 초기화 시 토큰 URL로 재방문.

---

## 보안 트레이드오프

| 항목 | 내용 |
|---|---|
| 공개 범위 | 토큰을 아는 누구나 preview styleguide 접근 가능 |
| 민감 데이터 | styleguide는 디자인 토큰·브랜드 자산만 포함 (PII/사업 기밀 없음) |
| production 격리 | `VERCEL_ENV === "production"` 시 `notFound()` — 회귀 불가 |
| 토큰 노출 대응 | Vercel Dashboard에서 토큰 재생성으로 즉시 차단 |

결론: 민감 데이터 없음 + production 격리 유지 → 허용 범위 내.

---

## 검증 체크리스트

- [ ] `https://soongong.vercel.app/styleguide` (production) → 404
- [ ] `https://soongong-web-git-main-mikeikhoonkim1208-2196s-projects.vercel.app/styleguide` → 로그인 없이 styleguide 렌더
- [ ] 쿠키 설정 후 토큰 파라미터 제거한 URL → 여전히 접근 가능
- [ ] 앱 로그인 세션 없는 시크릿 창 → styleguide 접근 가능
