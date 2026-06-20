import Image from "next/image";
import Link from "next/link";

/**
 * 브랜드 히어로(랜딩) — 비로그인 첫 진입 마케팅 화면 (SOO-73).
 *
 * 비주얼 SSoT: 완성 브랜드 이미지 `/brand/main_concepting_.png` 한 장을 그대로
 * 히어로로 사용한다 (로고·헤드라인·플랫 아이콘 4종·순공이 마스코트가 한 장에 합쳐짐).
 * Mike 지시(2026-06-20): 개별 캐릭터 PNG 조립 중단, 이 완성 이미지로 대체.
 *
 * 디자인 락 준수:
 * - Light-only (다크 변형 0). 모든 색은 tokens.css 시맨틱 토큰 참조 — raw hex 0.
 * - 기능 카드 아이콘: 브랜드 플랫(소프트 라운드 민트) 인라인 SVG — 프로젝트 sidebar
 *   아이콘 컨벤션과 동일(stroke round, mint 토큰). emoji/lucide/외부 아이콘 미사용.
 * - 카피 톤: 동반자·가치 기반, "듀오링고의 다음 진화" 포지셔닝(카피캣 X — CLAUDE.md §8).
 * - 순공리그는 마케팅 소개 카드로만 노출 — in-app 라이브 라우트 미연결(락: MVP 1.5차).
 */

const SVG = {
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none" as const,
  stroke: "var(--color-mint-700)",
};

/** 회독 루프 */
function IconReview() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden {...SVG}>
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4" />
    </svg>
  );
}
/** 오답 회수(되돌리기 루프) */
function IconRecover() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden {...SVG}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
    </svg>
  );
}
/** 방패 + 체크(망각방어) */
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden {...SVG}>
      <path d="M12 3 5 6v6c0 4 3 6.5 7 9 4-2.5 7-5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
/** 트로피(리그) */
function IconTrophy() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden {...SVG}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5a2 2 0 0 0 0 4h1.5M16 6h3a2 2 0 0 1 0 4h-1.5" />
      <path d="M12 13v4M10 21h4l-.5-4h-3L10 21Z" />
    </svg>
  );
}

const FEATURES = [
  {
    Icon: IconReview,
    title: "오늘의 회독",
    body: "AI가 만든 나만의 회독 퀘스트. 매일 잊힐 만한 것부터 다시 만나요.",
  },
  {
    Icon: IconRecover,
    title: "오답회수 모드",
    body: "틀린 문제를 공부의 자산으로. 확실히 내 것이 될 때까지 회수해요.",
  },
  {
    Icon: IconShield,
    title: "망각방어전",
    body: "망각 곡선을 따라 약점을 정조준. 까먹기 직전에 방어해요.",
  },
  {
    Icon: IconTrophy,
    title: "순공리그",
    body: "순공러들과 함께 회독 습관을 겨뤄요. (곧 만나요)",
  },
] as const;

const STATS = [
  { value: "12,450", label: "누적 XP" },
  { value: "23일", label: "최대 스트릭" },
  { value: "1,248회", label: "획득 성공" },
  { value: "384회", label: "오답 회수" },
] as const;

export function BrandHeroPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-default)]">
      {/* 히어로 — 완성 브랜드 이미지 한 장 (full-bleed 반응형) */}
      <section className="mx-auto w-full max-w-[1280px] px-0 sm:px-6 sm:pt-6">
        <Image
          src="/brand/main_concepting_.png"
          alt="순공대장 — 다시 풀 때, 성적이 오른다. AI가 만든 나만의 회독 루틴"
          width={1536}
          height={1024}
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="h-auto w-full sm:rounded-[var(--radius-xl)]"
        />
      </section>

      {/* 진입 CTA */}
      <section className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-3 px-6 pt-8 sm:flex-row sm:justify-center">
        <Link
          href="/today"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-mint-700)] px-8 text-base font-semibold text-[var(--color-text-inverse)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-mint-900)] sm:w-auto"
        >
          무료로 시작하기 <span aria-hidden>→</span>
        </Link>
        <Link
          href="/demo"
          className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-8 text-base font-semibold text-[var(--color-mint-900)] transition-colors hover:bg-[var(--color-mint-50)] sm:w-auto"
        >
          데모 보기
        </Link>
      </section>

      {/* 기능 4종 — 브랜드 플랫 아이콘 */}
      <section
        id="features"
        className="mx-auto grid w-full max-w-[1280px] gap-4 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4"
      >
        {FEATURES.map(({ Icon, title, body }) => (
          <div
            key={title}
            className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-mint-50)]">
              <Icon />
            </span>
            <h2 className="mt-4 text-base font-bold text-[var(--color-text-strong)]">
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-default)]">
              {body}
            </p>
          </div>
        ))}
      </section>

      {/* 하단 통계 4종 */}
      <section className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-4 px-6 pb-16 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-4 py-6 text-center shadow-[var(--shadow-card)]"
          >
            <span className="text-2xl font-extrabold text-[var(--color-text-strong)]">
              {s.value}
            </span>
            <span className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">
              {s.label}
            </span>
          </div>
        ))}
      </section>

      <footer className="mx-auto w-full max-w-[1280px] px-6 pb-10 text-center text-xs text-[var(--color-text-muted)]">
        © 순공대장 · 까먹음을 푸는 회독 엔진
      </footer>
    </main>
  );
}
