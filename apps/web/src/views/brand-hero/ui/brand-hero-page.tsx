"use client";

import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/shared/ui/logo";

import { Reveal } from "./reveal";

/**
 * 브랜드 히어로(랜딩) — 비로그인 첫 진입 마케팅 화면 (SOO-73 → SOO-113 재정비).
 *
 * 비주얼 SSoT: 완성 브랜드 이미지 `/brand/main_concepting_.png` 한 장을 **"포스터"**로
 * 취급한다 — 이미지 자체는 Mike 소유 브랜드 자산(불변, 재생성·교체 금지). SOO-113은
 * 이 포스터를 SOO-96 룩&필 + SOO-103 랜딩 시안의 디자인·모션 언어로 재배치·재연출하고,
 * 랜딩 전반(가치제안·작동방식·기능·전환 동선)을 가이드라인에 정합시킨다.
 *
 * 디자인 락 준수:
 * - Light-only (다크 변형 0). 모든 색은 tokens.css 시맨틱 토큰 참조 — raw hex 0.
 * - 모션: SOO-96/97 계승 — 기본 ease-out-soft 스태거 페이드업(<Reveal/>), reduced-motion 존중.
 * - 플랫 인라인 SVG 아이콘(소프트 라운드 민트, sidebar 컨벤션 동일). emoji/식물 모티프 미사용
 *   (마스코트=듀공 단일 락, 씨앗/새싹류 금지). 망각곡선·badge도 플랫 SVG로.
 * - 카피 톤: 동반자·가치 기반. "카드 등록 없이 시작 · 자동결제 OFF 기본" 명시(다크패턴 거절).
 *   포지셔닝: "콴다는 막힘을 풀고, 순공대장은 까먹음을 푼다" — 듀오링고 카피캣 X(CLAUDE.md §8).
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
/** 화살표(CTA) */
function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
/** 스파클(badge) — 식물/씨앗 모티프 대체용 플랫 아이콘 */
function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
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

const STEPS = [
  { n: "1", title: "올리기", body: "사진·캡처·PDF·필기 무엇이든" },
  { n: "2", title: "회독퀘스트로", body: "AI가 개념·위험도로 정리" },
  { n: "3", title: "제때 회독", body: "잊기 직전에 순공이가 톡" },
] as const;

const STATS = [
  { value: "12,450", label: "누적 XP" },
  { value: "23일", label: "최대 스트릭" },
  { value: "1,248회", label: "획득 성공" },
  { value: "384회", label: "오답 회수" },
] as const;

const SHELL = "mx-auto w-full max-w-[1180px] px-6";

export function BrandHeroPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-default)]">
      {/* 상단 네비 — 로고 + 전환 CTA (동선 강화) */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border-default)] bg-[color-mix(in_srgb,var(--color-surface)_80%,transparent)] backdrop-blur-md">
        <div className={`${SHELL} flex h-16 items-center justify-between`}>
          <Logo lang="ko" variant="light" className="h-8 w-auto" priority />
          <Link
            href="/today"
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-mint-700)] px-4 text-sm font-bold text-[var(--color-text-inverse)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-mint-900)]"
          >
            무료로 시작
          </Link>
        </div>
      </header>

      {/* ── 1) 히어로 포스터 ─────────────────────────────────────────── */}
      <section className={`${SHELL} flex flex-col items-center pt-10 pb-4 text-center sm:pt-14`}>
        <Reveal>
          <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-mint-50)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-mint-900)]">
            <span className="text-[var(--color-mint-700)]">
              <IconSpark />
            </span>
            수능생 AI 회독 리텐션 엔진
          </span>
        </Reveal>

        <Reveal delay={60}>
          <h1 className="mt-5 text-[1.7rem] font-extrabold leading-[1.28] tracking-[-0.035em] text-[var(--color-text-strong)] sm:text-[2.4rem]">
            푼 문제, <b className="text-[var(--color-mint-700)]">까먹지 않게</b>
            <br />
            순공이가 회독을 챙겨요
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="mx-auto mt-4 max-w-[480px] text-sm font-medium leading-relaxed text-[var(--color-text-default)] sm:text-base">
            문제 사진·인강 캡처·필기를 올리면 AI가 회독퀘스트로 바꿔 1·3·7·14일에 딱 맞춰
            다시 꺼내줘요. 망각이 시작되기 직전에요.
          </p>
        </Reveal>

        {/* 포스터 — Mike 소유 브랜드 자산 1장(불변). 프레임·등장 연출만 SOO-96 언어로. */}
        <Reveal delay={180} className="w-full">
          <div className="mx-auto mt-9 w-full max-w-[920px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface)] shadow-[var(--shadow-elevated)]">
            <Image
              src="/brand/main_concepting_.png"
              alt="순공대장 — 푼 문제를 까먹지 않게, 순공이가 1·3·7·14일 회독을 챙기는 AI 회독 리텐션 엔진"
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 920px) 100vw, 920px"
              className="h-auto w-full"
            />
          </div>
        </Reveal>

        {/* 진입 CTA + 안심 카피(다크패턴 거절) */}
        <Reveal delay={240} className="w-full">
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/today"
              className="inline-flex h-12 w-full max-w-[320px] items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-mint-700)] px-8 text-base font-semibold text-[var(--color-text-inverse)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-mint-900)] sm:w-auto"
            >
              무료로 시작하기 <IconArrow />
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 w-full max-w-[320px] items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-8 text-base font-semibold text-[var(--color-mint-900)] transition-colors hover:bg-[var(--color-mint-50)] sm:w-auto"
            >
              데모 보기
            </Link>
          </div>
          <p className="mt-3 text-xs font-semibold text-[var(--color-text-muted)]">
            카드 등록 없이 시작 · 자동결제 OFF가 기본
          </p>
        </Reveal>
      </section>

      {/* ── 2) 왜 — 망각곡선 ─────────────────────────────────────────── */}
      <section className={`${SHELL} pt-12`}>
        <Reveal className="mx-auto max-w-[620px]">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--color-text-strong)]">
              <span className="text-[var(--color-risk-high)]">
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 6l6 6 4-4 8 8" />
                  <path d="M21 16v-5M21 16h-5" />
                </svg>
              </span>
              그냥 두면 — 망각 곡선
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-mint-50)] px-2 py-0.5 text-[0.65rem] font-extrabold text-[var(--color-mint-900)]">
                에빙하우스
              </span>
            </div>
            <svg viewBox="0 0 320 96" preserveAspectRatio="none" fill="none" className="mt-3 block h-24 w-full" aria-hidden>
              <defs>
                <linearGradient id="forget-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--color-mint-300)" stopOpacity="0.5" />
                  <stop offset="1" stopColor="var(--color-mint-300)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M6 14 C 40 70, 90 84, 314 90" stroke="var(--color-risk-high)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 5" />
              <path d="M6 14 C 30 40, 50 46, 70 46 C 110 46, 110 26, 140 26 C 190 26, 190 18, 230 18 C 280 18, 280 14, 314 13" stroke="var(--color-mint-700)" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M6 14 C 30 40, 50 46, 70 46 C 110 46, 110 26, 140 26 C 190 26, 190 18, 230 18 C 280 18, 280 14, 314 13 L314 96 L6 96 Z" fill="url(#forget-fill)" />
              <circle cx="70" cy="46" r="3.5" fill="var(--color-mint-700)" />
              <circle cx="140" cy="26" r="3.5" fill="var(--color-mint-700)" />
              <circle cx="230" cy="18" r="3.5" fill="var(--color-mint-700)" />
            </svg>
            <div className="mt-1 flex justify-between text-[0.65rem] font-bold text-[var(--color-text-muted)]">
              <span>오늘</span>
              <span className="text-[var(--color-mint-700)]">1일 · 3일 · 7일 · 14일 회독</span>
              <span>시험날</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 3) 어떻게 — 3-step ───────────────────────────────────────── */}
      <section className={`${SHELL} pt-8`}>
        <div className="mx-auto grid max-w-[820px] gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 70}>
              <div className="flex h-full items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
                <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-mint-50)] text-sm font-extrabold text-[var(--color-mint-900)]">
                  {s.n}
                </span>
                <div className="text-left">
                  <div className="text-sm font-extrabold text-[var(--color-text-strong)]">
                    {s.title}
                  </div>
                  <div className="mt-0.5 text-xs font-medium leading-snug text-[var(--color-text-muted)]">
                    {s.body}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 4) 무엇을 — 기능 4종 ─────────────────────────────────────── */}
      <section id="features" className={`${SHELL} grid gap-4 pt-14 sm:grid-cols-2 lg:grid-cols-4`}>
        {FEATURES.map(({ Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 60}>
            <div className="h-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
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
          </Reveal>
        ))}
      </section>

      {/* ── 5) 성과 — 통계 4종 ───────────────────────────────────────── */}
      <section className={`${SHELL} grid grid-cols-2 gap-4 pt-12 lg:grid-cols-4`}>
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 60}>
            <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-4 py-6 text-center shadow-[var(--shadow-card)]">
              <span className="text-2xl font-extrabold text-[var(--color-text-strong)]">
                {s.value}
              </span>
              <span className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">
                {s.label}
              </span>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── 6) 포지셔닝 + 푸터 ───────────────────────────────────────── */}
      <footer className={`${SHELL} pt-14 pb-12 text-center`}>
        <Reveal>
          <p className="mx-auto max-w-[460px] text-sm font-semibold leading-relaxed text-[var(--color-text-default)]">
            콴다는 학생의 ‘막힘’을 풀고, 순공대장은 학생의 ‘까먹음’을 풀어요.
          </p>
          <p className="mt-6 text-xs text-[var(--color-text-muted)]">
            © 순공대장 · 까먹음을 푸는 회독 엔진
          </p>
        </Reveal>
      </footer>
    </main>
  );
}
