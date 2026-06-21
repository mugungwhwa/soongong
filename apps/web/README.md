This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 아키텍처 린트 (FSD 레이어 가드)

이 앱은 [Feature-Sliced Design 2.1](https://feature-sliced.design/) 구조를 따른다. 레이어 위계는 상위 → 하위 순으로 `app → views(pages) → widgets → features → entities → shared` 이며, **상위 레이어만 하위 레이어를 import** 할 수 있다. 이 단방향 의존은 [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) 기반 네이티브 린트(`apps/web/.dependency-cruiser.cjs`)로 강제되며, 위반 시 `pnpm lint:arch` 가 실패하고 `.github/workflows/arch-lint.yml` 을 통해 PR에서 자동 차단된다. 강제 규칙은 ① 레이어 역방향 import 금지(여기에 `features → widgets` 역참조 금지 포함), ② shared의 상위 레이어 import 금지, ③ 같은 레이어 슬라이스 간 교차 참조 금지(슬라이스 격리), ④ 순환 의존 금지다. 단, `widgets/sidebar` → `@/app/actions/auth`(signOut 서버 액션)는 서버 액션 이전 전까지 명시적 화이트리스트 예외다(후속 정리 티켓에서 제거 예정).

```bash
pnpm lint:arch          # FSD 레이어 위반 검사 (CI 게이트)
pnpm lint:arch:graph    # 의존 그래프를 Graphviz DOT 으로 출력
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
