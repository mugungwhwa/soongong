import Image from "next/image";
import Link from "next/link";

/**
 * 브랜드 히어로(랜딩) — 비로그인 첫 진입 마케팅 화면 (SOO-73).
 *
 * 비주얼 SSoT: Mike 첨부 타깃 mockup `ui example.png`(2026-06-19) 구조를 따른다.
 * 디자인 락 준수:
 * - Light-only (다크 변형 0). 모든 색은 tokens.css 시맨틱 토큰 참조 — raw hex 0.
 * - 정본 캐릭터 자산 `/brand/{soongong-main,sub-boy,sub-girl}.png` 직접 사용
 *   (구버전 `/mascot/*` 금지 — 07:36 핸드오프).
 * - 카피 톤: 동반자·가치 기반 (fear/passive-aggressive 금지 — CLAUDE.md §8).
 * - 순공리그는 마케팅 소개 카드/앵커로만 노출 — in-app 진입(라이브 라우트) 미연결
 *   (락: 순공리그 MVP 1.5차, §2/§8).
 */

const NAV = [
  { label: "오늘의 회독", href: "#features" },
  { label: "오답회수", href: "#features" },
  { label: "망각방어전", href: "#features" },
  { label: "순공리그", href: "#features" },
] as const;

const FEATURES = [
  {
    emoji: "📅",
    title: "오늘의 회독",
    body: "AI가 만든 나만의 회독 퀘스트. 매일 잊힐 만한 것부터 다시 만나요.",
  },
  {
    emoji: "🔁",
    title: "오답회수 모드",
    body: "틀린 문제를 공부의 자산으로. 확실히 내 것이 될 때까지 회수해요.",
  },
  {
    emoji: "🛡️",
    title: "망각방어전",
    body: "망각 곡선을 따라 약점을 정조준. 까먹기 직전에 방어해요.",
  },
  {
    emoji: "🏆",
    title: "순공리그",
    body: "순공러들과 함께 회독 습관을 겨뤄요. (곧 만나요)",
  },
] as const;

const STATS = [
  { emoji: "⚡", value: "12,450", label: "누적 XP" },
  { emoji: "🔥", value: "23일", label: "최대 스트릭" },
  { emoji: "🏅", value: "1,248회", label: "획득 성공" },
  { emoji: "🎯", value: "384회", label: "오답 회수" },
] as const;

const PATH_STEPS = [true, true, true, false, false];

export function BrandHeroPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-default)]">
      {/* 상단 네비게이션 */}
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
        <span className="flex items-center gap-2 text-lg font-extrabold text-[var(--color-text-strong)]">
          <Image
            src="/brand/soongong_icon_main.png"
            alt=""
            width={32}
            height={32}
            className="rounded-[var(--radius-sm)]"
          />
          순공대장
        </span>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="text-sm font-medium text-[var(--color-text-default)] transition-colors hover:text-[var(--color-mint-700)]"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <Link
          href="/today"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-mint-700)] px-5 text-sm font-semibold text-[var(--color-text-inverse)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-mint-900)]"
        >
          시작하기
        </Link>
      </header>

      {/* 히어로 */}
      <section
        className="mx-auto grid w-full max-w-[1200px] items-center gap-10 rounded-[var(--radius-xl)] px-6 py-10 lg:grid-cols-2 lg:gap-8 lg:py-16"
        style={{ background: "var(--gradient-quest-map)" }}
      >
        {/* 좌: 카피 + CTA */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[var(--color-text-strong)] sm:text-5xl">
            까먹기 전에
            <br />
            <span className="text-[var(--color-mint-700)]">다시 풀자.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--color-text-default)] lg:mx-0 lg:text-lg">
            문제사진과 오답을 AI가 매일 회독 퀘스트로 바꿔주는
            <span className="font-semibold text-[var(--color-text-strong)]">
              {" "}
              듀오링고의 다음 진화, 수능 회독 학습 앱
            </span>
            .
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
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
          </div>

          {/* 미니 스탯 — 오늘의 회독 진행 + 스트릭 */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-default)] shadow-[var(--shadow-card)]">
              <span aria-hidden>📅</span> 오늘의 회독
              <span className="flex items-center gap-1" aria-hidden>
                {PATH_STEPS.map((done, i) => (
                  <span
                    key={i}
                    className={`h-2 w-5 rounded-[var(--radius-pill)] ${
                      done
                        ? "bg-[var(--color-mint-500)]"
                        : "bg-[var(--color-bg-sunken)]"
                    }`}
                  />
                ))}
              </span>
              <span className="font-semibold text-[var(--color-text-strong)]">
                3/5
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text-strong)] shadow-[var(--shadow-card)]">
              <span aria-hidden>🔥</span> 연속 7일
            </span>
          </div>
        </div>

        {/* 우: 캐릭터 클러스터 + 회독 맵 */}
        <div className="relative order-1 mx-auto w-full max-w-md lg:order-2">
          {/* 플로팅 배지 */}
          <span className="absolute left-1 top-2 z-10 inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-xp-soft)] px-3 py-1 text-sm font-bold text-[var(--color-text-on-warm)] shadow-[var(--shadow-card)]">
            <span aria-hidden>⚡</span> XP +120
          </span>
          <span className="absolute right-1 top-2 z-10 inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-surface)] px-3 py-1 text-sm font-bold text-[var(--color-text-strong)] shadow-[var(--shadow-card)]">
            <span aria-hidden>🔥</span> 연속 7일
          </span>

          {/* 캐릭터 3종 */}
          <div className="flex items-end justify-center gap-1 sm:gap-2">
            <Image
              src="/brand/sub-boy.png"
              alt=""
              width={180}
              height={180}
              className="h-auto w-[28%] max-w-[150px] drop-shadow-[var(--shadow-card)]"
            />
            <Image
              src="/brand/soongong-main.png"
              alt="순공대장 마스코트 순공이"
              width={280}
              height={280}
              priority
              className="h-auto w-[40%] max-w-[220px] drop-shadow-[var(--shadow-elevated)]"
            />
            <Image
              src="/brand/sub-girl.png"
              alt=""
              width={180}
              height={180}
              className="h-auto w-[28%] max-w-[150px] drop-shadow-[var(--shadow-card)]"
            />
          </div>

          {/* 회독 맵 스텝 (체크 노드) */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {PATH_STEPS.map((done, i) => (
              <span
                key={i}
                aria-hidden
                className={`flex h-7 w-7 items-center justify-center rounded-[var(--radius-pill)] text-xs font-bold ${
                  done
                    ? "bg-[var(--color-mint-500)] text-[var(--color-text-inverse)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] shadow-[var(--shadow-card)]"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 4종 */}
      <section
        id="features"
        className="mx-auto grid w-full max-w-[1200px] gap-4 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4"
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-mint-50)] text-xl" aria-hidden>
              {f.emoji}
            </span>
            <h2 className="mt-4 text-base font-bold text-[var(--color-text-strong)]">
              {f.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-default)]">
              {f.body}
            </p>
          </div>
        ))}
      </section>

      {/* 하단 통계 4종 */}
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-4 px-6 pb-16 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-4 py-6 text-center shadow-[var(--shadow-card)]"
          >
            <span className="text-2xl" aria-hidden>
              {s.emoji}
            </span>
            <span className="mt-2 text-2xl font-extrabold text-[var(--color-text-strong)]">
              {s.value}
            </span>
            <span className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">
              {s.label}
            </span>
          </div>
        ))}
      </section>

      <footer className="mx-auto w-full max-w-[1200px] px-6 pb-10 text-center text-xs text-[var(--color-text-muted)]">
        © 순공대장 · 까먹음을 푸는 회독 엔진
      </footer>
    </main>
  );
}
