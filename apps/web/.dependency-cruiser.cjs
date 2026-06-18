/**
 * soongong FSD 2.1 architecture lint (Tech Lead 소유, SOO-67)
 *
 * Treenod arch-guard(외부 스킬) 의존을 끊기 위한 네이티브 FSD 레이어 가드.
 * 레이어 단방향 의존만 강제한다(아키텍처 한정). 디자인/토큰/다크모드는
 * 별도 자체 가드(lint:tokens / lint:no-dark / lint:images)가 담당.
 *
 * FSD 2.1 레이어 위계 (상위 → 하위):
 *   app → views(pages) → widgets → features → entities → shared
 * 규칙:
 *   1) 상위 레이어만 하위 레이어를 import 한다. 역방향(하위→상위) 금지.
 *      - 이 규칙이 "features → widgets 역참조 금지"도 포함한다
 *        (widgets 가 features 보다 상위이므로 widgets → features 는 정상).
 *   2) 같은 레이어의 슬라이스끼리 교차 참조 금지(슬라이스 격리).
 *      더 낮은 레이어를 거쳐 의존하라.
 *   3) shared 는 최하위 — 어떤 상위 레이어도 import 금지.
 *
 * 실행: pnpm lint:arch  (== depcruise src --config .dependency-cruiser.cjs)
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "fsd-no-views-to-app",
      comment:
        "views(pages)는 app 을 import 할 수 없다 (역방향). app 이 views 를 라우팅으로 소비한다.",
      severity: "error",
      from: { path: "^src/views/" },
      to: { path: "^src/app/" },
    },
    {
      name: "fsd-no-widgets-upward",
      comment:
        "widgets 는 app/views 를 import 할 수 없다 (역방향). " +
        "예외: widgets/sidebar 는 signOut 서버 액션(@/app/actions/auth)을 임시 참조 — " +
        "서버 액션을 shared/api 또는 features 로 이전하는 후속 정리 티켓에서 제거 예정.",
      severity: "error",
      from: {
        path: "^src/widgets/",
        pathNot: "^src/widgets/sidebar/ui/sidebar\\.tsx$",
      },
      to: { path: "^src/(app|views)/" },
    },
    {
      name: "fsd-no-features-upward",
      comment:
        "features 는 app/views/widgets 를 import 할 수 없다 (역방향). " +
        "여기에 'features → widgets 역참조 금지'가 포함된다.",
      severity: "error",
      from: { path: "^src/features/" },
      to: { path: "^src/(app|views|widgets)/" },
    },
    {
      name: "fsd-no-entities-upward",
      comment:
        "entities 는 app/views/widgets/features 를 import 할 수 없다 (역방향).",
      severity: "error",
      from: { path: "^src/entities/" },
      to: { path: "^src/(app|views|widgets|features)/" },
    },
    {
      name: "fsd-no-shared-upward",
      comment:
        "shared 는 최하위 레이어 — 어떤 상위 레이어(app/views/widgets/features/entities)도 import 금지.",
      severity: "error",
      from: { path: "^src/shared/" },
      to: { path: "^src/(app|views|widgets|features|entities)/" },
    },
    {
      name: "fsd-no-cross-slice",
      comment:
        "같은 레이어의 다른 슬라이스끼리 교차 참조 금지(FSD 슬라이스 격리). " +
        "공유가 필요하면 더 낮은 레이어로 내려라.",
      severity: "error",
      from: { path: "^src/(entities|features|widgets|views)/([^/]+)/" },
      to: {
        // 같은 레이어($1)의 다른 슬라이스로 가는 import 만 위반.
        // 자기 슬라이스($1/$2)와 배럴(@/<layer>/<slice>)은 허용.
        path: "^src/$1/([^/]+)/",
        pathNot: "^src/$1/$2/",
      },
    },
    {
      name: "no-circular",
      comment: "순환 의존 금지 — 레이어 위계가 무너지는 신호.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    // @/* → ./src/* 별칭 + 타입 import 도 의존으로 인식하기 위해 tsconfig 사용.
    tsConfig: { fileName: "tsconfig.json" },
    // 타입 전용 import(import type ...)도 아키텍처 의존으로 계산한다.
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    },
  },
};
