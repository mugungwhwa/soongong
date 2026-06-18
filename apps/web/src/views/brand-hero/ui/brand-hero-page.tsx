import Image from "next/image";
import Link from "next/link";

/**
 * 브랜드 히어로(랜딩) — 비로그인 첫 진입 화면 (SOO-73).
 *
 * 디자인 락 준수:
 * - Light-only (다크 변형 0). 모든 색은 tokens.css 시맨틱 토큰 참조 — raw hex 금지.
 * - 정본 마스코트 자산 `/brand/soongong-main.png` 직접 사용 (Mascot 컴포넌트의
 *   placeholder `/mascot/main.png` 회피 — DoD '플레이스홀더 금지').
 * - 게임성 강도 최소(브랜드 surface): HP/XP/리그 등 게이지 노출 없음.
 * - 카피 톤: 동반자·가치 기반 (fear/passive-aggressive 금지 — CLAUDE.md §8).
 */

const PILLARS = [
  {
    emoji: "📸",
    title: "올리면 끝",
    body: "문제 사진·인강 기록·캡처를 올리면 AI가 알아서 정리해요.",
  },
  {
    emoji: "🔁",
    title: "회독 퀘스트로",
    body: "1·3·7·14일, 까먹기 직전 타이밍에 다시 만나도록 짜드려요.",
  },
  {
    emoji: "🌱",
    title: "오래 남게",
    body: "막힘이 아니라 '까먹음'을 풀어, 공부한 게 진짜 내 것이 돼요.",
  },
] as const;

export function BrandHeroPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-default)]">
      {/* 상단 워드마크 */}
      <header className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 text-lg font-bold text-[var(--color-text-strong)]">
          <Image
            src="/brand/soongong_icon_main.png"
            alt=""
            width={32}
            height={32}
            className="rounded-[var(--radius-sm)]"
          />
          순공대장
        </span>
        <Link
          href="/login"
          className="text-sm font-medium text-[var(--color-text-default)] transition-colors hover:text-[var(--color-mint-700)]"
        >
          로그인
        </Link>
      </header>

      {/* 히어로 */}
      <section
        className="mx-auto grid w-full max-w-[1120px] items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-2 lg:gap-6 lg:pb-24 lg:pt-12"
        style={{ background: "var(--gradient-quest-map)" }}
      >
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-mint-100)] px-3 py-1 text-xs font-semibold text-[var(--color-mint-900)]">
            수능생 AI 회독 파트너
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-[var(--color-text-strong)] sm:text-4xl lg:text-5xl">
            공부한 건,
            <br />
            까먹지 않게.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--color-text-default)] lg:mx-0 lg:text-lg">
            순공이와 함께 어제 푼 문제를 오늘의 나에게 다시 연결해요. 막힘이
            아니라 <span className="font-semibold text-[var(--color-text-strong)]">까먹음</span>을 푸는 회독 엔진.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/today"
              className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-mint-700)] px-8 text-base font-semibold text-[var(--color-text-inverse)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-mint-900)] sm:w-auto"
            >
              순공이랑 시작하기
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] px-8 text-base font-semibold text-[var(--color-mint-900)] transition-colors hover:bg-[var(--color-mint-50)] sm:w-auto"
            >
              이미 계정이 있어요
            </Link>
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <Image
            src="/brand/soongong-main.png"
            alt="순공대장 마스코트 순공이"
            width={360}
            height={360}
            priority
            className="h-auto w-[220px] drop-shadow-[var(--shadow-elevated)] sm:w-[300px] lg:w-[360px]"
          />
        </div>
      </section>

      {/* 3단 가치 */}
      <section className="mx-auto grid w-full max-w-[1120px] gap-4 px-6 pb-20 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-card)] sm:text-left"
          >
            <span className="text-2xl" aria-hidden>
              {p.emoji}
            </span>
            <h2 className="mt-3 text-base font-bold text-[var(--color-text-strong)]">
              {p.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-default)]">
              {p.body}
            </p>
          </div>
        ))}
      </section>

      <footer className="mx-auto w-full max-w-[1120px] px-6 pb-10 text-center text-xs text-[var(--color-text-muted)]">
        © 순공대장 · 까먹음을 푸는 회독 엔진
      </footer>
    </main>
  );
}
