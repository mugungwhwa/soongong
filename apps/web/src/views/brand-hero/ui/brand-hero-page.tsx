"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Logo } from "@/shared/ui/logo";

import { Reveal } from "./reveal";

/**
 * 브랜드 히어로(랜딩) — 비로그인 첫 진입 마케팅 화면 (SOO-73 → SOO-113 → SOO-128).
 *
 * 비주얼 SSoT:
 * - **메인 히어로(포스터)는 승인 v3 그대로 고정** — 변경 금지(SOO-128 오케스트레이션 제약).
 * - 히어로 **아래** 섹션만 SOO-127 승인 랜딩 재설계 프로토타입 v4로 교체·추가.
 *   변경분(콴다→"AI 문제 풀이" 카피 · 카메라 캡처 카드 확대 · floaty 모션)은 전부 히어로 아래에만.
 *   (프로토타입: docs/prototypes/SOO-127/index.html — Mike 승인) 토큰 미러·스캐폴딩은 버리고
 *   시각/모션/카피만 옮긴다.
 *
 * 디자인 락 준수:
 * - Light-only (다크 변형 0). 모든 색은 tokens.css 시맨틱 토큰 참조 — raw hex 0.
 * - 모션: SOO-96/97 계승 — ease-out-soft 스태거 페이드업(<Reveal/>), 캡처 카드 floaty,
 *   reduced-motion 존중. floaty는 마스코트(캡처 카드) 한정 차용.
 * - 플랫 인라인 SVG 아이콘(소프트 라운드 민트). emoji/식물 모티프 미사용.
 * - 카피 톤: 동반자·가치 기반. 다크패턴 거절. 포지셔닝 "막힘은 AI 문제 풀이가 풀고,
 *   까먹음은 순공대장이 푼다"(CLAUDE.md §1 · §8 카피캣/노골 경쟁사 표기 거절 — "AI 문제 풀이" 일반명).
 * - 앱·웹 미리보기는 승인 목업(SOO-96) 이미지 슬롯 — 실화면 완성 시 교체 가능한 자산 경로.
 */

/* ── 플랫 라인 아이콘 (stroke 1.8 / round / fill none) ──────────────────── */
const LINE = {
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none" as const,
};

/** 스파클(eyebrow badge) */
function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} stroke="currentColor" aria-hidden {...LINE} strokeWidth={2}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}
/** 화살표(CTA) */
function IconArrow({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" aria-hidden {...LINE} strokeWidth={2.4}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function IconCamera({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" aria-hidden {...LINE}>
      <path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h7l1 2H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}
function IconConvert({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" aria-hidden {...LINE}>
      <rect x="6" y="6" width="12" height="12" rx="3" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  );
}
function IconReturn({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" aria-hidden {...LINE}>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v4h-4" />
    </svg>
  );
}
function IconArrowDown({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" aria-hidden {...LINE} strokeWidth={2}>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}
function IconFlame({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" aria-hidden {...LINE}>
      <path d="M12 3c.5 3 2.5 4.3 3.7 5.8A6 6 0 1 1 6 12.5c0-1 .4-1.8 1-2.5.6 1 1.5 1.3 2 1.2C8.3 8.6 10 6 12 3Z" />
    </svg>
  );
}

/** 기억HP 0–5 정수 도트 (filled=risk-high 소프트, off=border) */
function HpDots({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span className="flex items-center gap-[3px]" aria-label={`기억HP ${filled} / ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            i < filled ? "bg-[var(--color-risk-high)]" : "bg-[var(--color-border-default)]",
          )}
        />
      ))}
    </span>
  );
}

/* ── 데이터 ──────────────────────────────────────────────────────────────── */
const QUEST_CHIPS = [
  { d: "1일", s: "내일" },
  { d: "3일", s: "모레+" },
  { d: "7일", s: "다음주" },
  { d: "14일", s: "2주" },
] as const;

const COMPANION_MOODS = [
  { src: "/mascot/main-half-cheer-alpha.png", alt: "응원하는 순공이", caption: "응원" },
  { src: "/mascot/main-half-good-alpha.png", alt: "기뻐하는 순공이", caption: "축하" },
  { src: "/mascot/main-half-comeon-alpha.png", alt: "다독이는 순공이", caption: "다독임" },
] as const;

const COMPANION_QUOTES = [
  "“오늘 회독 6개, 같이 해봐요!”",
  "“이만큼 했어요 — 잘하고 있어요.”",
  "“이 단원, 슬슬 흐려질 때예요.”",
] as const;

const SHELL = "mx-auto w-full max-w-[1080px] px-6";
const EYEBROW =
  "inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-mint-50)] px-[15px] py-[7px] text-[13px] font-bold tracking-[0.03em] text-[var(--color-mint-900)]";
const SECTION = "pt-[clamp(40px,7vh,80px)]";
const HEAD_H2 =
  "mb-3.5 mt-4 text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.22] tracking-[-0.03em] text-[var(--color-text-strong)]";
const HEAD_P = "text-[clamp(15px,2vw,17px)] leading-[1.65] text-[var(--color-text-default)]";

export function BrandHeroPage() {
  const [pane, setPane] = useState<"app" | "web">("app");

  return (
    <main className="min-h-screen break-keep bg-[var(--color-background)] text-[var(--color-text-default)] [overflow-wrap:break-word]">
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

      {/* ════════════════════════════════════════════════════════════════════
          메인 히어로 (포스터) — 승인 v3 그대로 고정. 변경 금지(SOO-128 제약).
          ════════════════════════════════════════════════════════════════════ */}
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
            문제 사진·인강 캡처·필기를 올리면 AI가 회독퀘스트로 바꿔 1·3·7·14일에 딱 맞춰 다시
            꺼내줘요. 망각이 시작되기 직전에요.
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

      {/* ════════════════════════════════════════════════════════════════════
          ↓↓ 여기서부터 히어로 아래 — SOO-128 v4 변경분 (재설계 프로토타입 포팅)
          ════════════════════════════════════════════════════════════════════ */}

      {/* ── A) 포지셔닝 + 카메라 캡처 카드 (콴다→AI 문제 풀이 · 이미지 확대 · 모션) ── */}
      <section id="capture" className={`${SHELL} ${SECTION}`}>
        <div className="grid items-center gap-[clamp(28px,5vw,56px)] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-[clamp(28px,4vw,52px)] shadow-[var(--shadow-card)] lg:grid-cols-[1.05fr_0.95fr]">
          {/* 카피 */}
          <div className="text-center lg:text-left">
            <Reveal>
              <span className={EYEBROW}>막힘 vs 까먹음</span>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-3.5 text-[clamp(26px,4vw,42px)] font-extrabold leading-[1.18] tracking-[-0.035em] text-[var(--color-text-strong)]">
                막힘은 AI 문제 풀이가 풀고,
                <br />
                <span className="rounded-[4px] bg-[linear-gradient(180deg,transparent_62%,var(--color-mint-100)_62%)] px-1 text-[var(--color-mint-900)]">
                  까먹음은 순공대장이
                </span>{" "}
                풉니다
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-[520px] text-[clamp(15px,2vw,18px)] leading-[1.6] text-[var(--color-text-default)] lg:mx-0">
                문제를 사진 한 장으로 올리면, AI가{" "}
                <b className="text-[var(--color-text-strong)]">1·3·7·14일 회독퀘스트</b>로 바꿔 까먹기
                직전에 다시 꺼내줍니다. 새로 외우지 마세요 — 잊지 않게 도와줄게요.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5 text-[14px] text-[var(--color-text-muted)] lg:justify-start">
                <span>
                  <b className="text-[var(--color-text-strong)]">가입은 나중에</b> · 먼저 회독부터
                </span>
                <span className="h-1 w-1 rounded-full bg-[var(--color-border-strong)]" />
                <span>
                  광고·압박 알림 <b className="text-[var(--color-text-strong)]">없음</b>
                </span>
              </div>
            </Reveal>
          </div>

          {/* 비주얼 — 카메라 캡처 카드 (확대 + floaty) */}
          <Reveal delay={120}>
            <div className="relative flex min-h-[380px] items-center justify-center lg:min-h-[440px]">
              <div className="absolute inset-0 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-mint-500)_28%,transparent),transparent_72%)] blur-[6px]" />

              <div className="absolute left-[-2%] top-[4%] z-[3] flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--color-text-strong)] shadow-[var(--shadow-elevated)]">
                <span className="text-[var(--color-risk-high)]">
                  <IconFlame />
                </span>
                7일 연속
              </div>
              <div className="absolute bottom-[7%] right-[-3%] z-[3] flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--color-text-strong)] shadow-[var(--shadow-elevated)]">
                <HpDots filled={4} /> 기억HP 4
              </div>

              <div className="animate-soongong-floaty relative z-[2] w-[min(420px,90%)] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-[26px] pb-6 pt-[26px] shadow-[var(--shadow-elevated)]">
                <Image
                  src="/mascot/camera-capture-alpha.png"
                  alt="순공이가 카메라로 문제를 담는 모습"
                  width={356}
                  height={356}
                  className="mx-auto mb-2 mt-[-80px] w-[178px] [filter:drop-shadow(0_12px_20px_color-mix(in_srgb,var(--color-mint-900)_18%,transparent))]"
                />
                <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-mint-50)] p-4">
                  <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[12px] bg-[var(--color-mint-700)] text-[var(--color-text-inverse)]">
                    <IconCamera size={24} />
                  </span>
                  <span className="text-left">
                    <b className="block text-[15px] text-[var(--color-text-strong)]">틀린 문제 한 장</b>
                    <span className="text-[13px] text-[var(--color-text-default)]">찍어서 올리면 끝</span>
                  </span>
                </div>
                <div className="my-2.5 flex items-center justify-center gap-1.5 text-[14px] font-bold text-[var(--color-mint-500)]">
                  <IconArrowDown />
                  AI가 회독퀘스트로 변환
                </div>
                <div className="flex gap-2">
                  {QUEST_CHIPS.map((q) => (
                    <div
                      key={q.d}
                      className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-mint-100)] px-1 py-[11px] text-center text-[14px] font-bold text-[var(--color-mint-900)]"
                    >
                      {q.d}
                      <span className="mt-0.5 block text-[11px] font-semibold text-[var(--color-text-default)]">
                        {q.s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── B) 왜 순공대장인가 — 막힘 vs 까먹음 ──────────────────────────── */}
      <section id="why" className={`${SHELL} ${SECTION}`}>
        <Reveal className="mx-auto mb-[clamp(28px,5vh,44px)] max-w-[640px] text-center">
          <span className={EYEBROW}>왜 순공대장인가</span>
          <h2 className={HEAD_H2}>
            공부의 진짜 적은 <span className="text-[var(--color-mint-700)]">막힘</span>이 아니라{" "}
            <span className="text-[var(--color-mint-700)]">까먹음</span>입니다
          </h2>
          <p className={HEAD_P}>
            이해는 한 번이면 되지만, 기억은 계속 새어 나갑니다. 에빙하우스 망각곡선은 하루만 지나도
            절반을 지워버리죠. 순공대장은 그 곡선을 거슬러, 까먹기 직전에 다시 만나게 합니다.
          </p>
        </Reveal>
        <Reveal>
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-[clamp(28px,5vw,52px)] shadow-[var(--shadow-card)]">
            <div className="grid items-center gap-[clamp(16px,3vw,36px)] sm:grid-cols-[1fr_auto_1fr]">
              <div className="text-center">
                <div className="text-[13px] font-bold tracking-[0.02em] text-[var(--color-text-muted)]">
                  지금 쓰는 도구
                </div>
                <h3 className="mb-2.5 mt-2 text-[clamp(20px,2.6vw,26px)] font-extrabold tracking-[-0.02em] text-[var(--color-text-strong)]">
                  막힘을 푼다
                </h3>
                <p className="text-[15px] leading-[1.55] text-[var(--color-text-default)]">
                  모르는 문제를 그 자리에서 해설해 줍니다. 좋습니다 —{" "}
                  <b className="text-[var(--color-text-strong)]">하지만 해설을 본 그 순간</b>에 끝나죠.
                </p>
              </div>
              <div className="rotate-90 text-[15px] font-extrabold text-[var(--color-border-strong)] sm:rotate-0">
                VS
              </div>
              <div className="rounded-[var(--radius-lg)] border-[1.5px] border-[var(--color-mint-300)] bg-[var(--color-mint-50)] px-[18px] py-6 text-center">
                <div className="text-[13px] font-bold tracking-[0.02em] text-[var(--color-text-muted)]">
                  순공대장
                </div>
                <h3 className="mb-2.5 mt-2 text-[clamp(20px,2.6vw,26px)] font-extrabold tracking-[-0.02em] text-[var(--color-mint-900)]">
                  까먹음을 푼다
                </h3>
                <p className="text-[15px] leading-[1.55] text-[var(--color-text-default)]">
                  맞힌 문제도 <b className="text-[var(--color-text-strong)]">시간이 지나면 잊습니다.</b>{" "}
                  잊기 직전마다 회독으로 다시 꺼내 — 진짜 내 것으로 굳혀줍니다.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── C) 작동 방식 — STEP 01·02·03 ─────────────────────────────────── */}
      <section id="how" className={`${SHELL} ${SECTION}`}>
        <Reveal className="mx-auto mb-[clamp(28px,5vh,44px)] max-w-[640px] text-center">
          <span className={EYEBROW}>어떻게 도와주나요</span>
          <h2 className={HEAD_H2}>찍고 → 맡기고 → 잊기 직전에 다시</h2>
          <p className={HEAD_P}>
            회독 하나는 1~2분. 하루 5분이면 충분합니다. 복습 일정은 순공이가 챙겨요.
          </p>
        </Reveal>
        <div className="grid gap-[clamp(16px,2.5vw,22px)] sm:grid-cols-3">
          {/* STEP 01 */}
          <Reveal delay={0}>
            <div className="h-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-[26px] py-[30px] shadow-[var(--shadow-card)]">
              <div className="text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-mint-500)]">
                STEP 01
              </div>
              <div className="my-[14px] grid h-14 w-14 place-items-center rounded-[16px] bg-[var(--color-mint-50)] text-[var(--color-mint-700)]">
                <IconCamera size={30} />
              </div>
              <h3 className="mb-2.5 text-[19px] font-extrabold tracking-[-0.02em] text-[var(--color-text-strong)]">
                문제를 찍어 올린다
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-[var(--color-text-default)]">
                틀린 문제·인강 캡처·필기 한 장이면 됩니다. 타이핑 없이 사진 한 장으로 공급.
              </p>
            </div>
          </Reveal>
          {/* STEP 02 */}
          <Reveal delay={70}>
            <div className="h-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-[26px] py-[30px] shadow-[var(--shadow-card)]">
              <div className="text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-mint-500)]">
                STEP 02
              </div>
              <div className="my-[14px] grid h-14 w-14 place-items-center rounded-[16px] bg-[var(--color-mint-50)] text-[var(--color-mint-700)]">
                <IconConvert size={30} />
              </div>
              <h3 className="mb-2.5 text-[19px] font-extrabold tracking-[-0.02em] text-[var(--color-text-strong)]">
                AI가 회독 일정으로 변환
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-[var(--color-text-default)]">
                개념과 유형을 읽고 망각 주기에 맞춘 회독 일정을 만들어 큐에 담아둡니다.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {["1일", "3일", "7일", "14일"].map((q) => (
                  <span
                    key={q}
                    className="rounded-[var(--radius-pill)] bg-[var(--color-mint-100)] px-[9px] py-[5px] text-[11.5px] font-bold text-[var(--color-mint-900)]"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          {/* STEP 03 */}
          <Reveal delay={140}>
            <div className="h-full rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] px-[26px] py-[30px] shadow-[var(--shadow-card)]">
              <div className="text-[13px] font-extrabold tracking-[0.08em] text-[var(--color-mint-500)]">
                STEP 03
              </div>
              <div className="my-[14px] grid h-14 w-14 place-items-center rounded-[16px] bg-[var(--color-mint-50)] text-[var(--color-mint-700)]">
                <IconReturn size={30} />
              </div>
              <h3 className="mb-2.5 text-[19px] font-extrabold tracking-[-0.02em] text-[var(--color-text-strong)]">
                잊기 직전에 다시 만난다
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-[var(--color-text-default)]">
                “오늘 회독 N개”가 또렷하게. 풀면{" "}
                <b className="text-[var(--color-text-strong)]">기억HP가 0–5로</b> 차오르고, 순공이가
                함께 기뻐해요.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--color-text-default)]">
                <HpDots filled={4} /> 기억HP 4 / 5
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── D) 순공냅스 — 망각맵 (컨셉 티저, /journey 연결) ──────────────── */}
      <section id="naps" className={`${SHELL} ${SECTION}`}>
        <Reveal>
          <div className="grid items-center gap-[clamp(24px,4vw,52px)] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[linear-gradient(180deg,var(--color-surface),color-mix(in_srgb,var(--color-mint-50)_40%,var(--color-surface)))] p-[clamp(28px,4vw,52px)] shadow-[var(--shadow-card)] sm:grid-cols-2">
            <div>
              <span className={EYEBROW}>차별점 · 순공냅스</span>
              <h2 className="mt-3.5 text-[clamp(22px,3.4vw,32px)] font-extrabold leading-[1.25] tracking-[-0.03em] text-[var(--color-text-strong)]">
                흩어진 개념을 <span className="text-[var(--color-mint-700)]">뇌처럼 잇는</span> 망각맵
              </h2>
              <p className="mt-3.5 text-[15.5px] leading-[1.7] text-[var(--color-text-default)]">
                회독한 개념들이 서로 이어지며 나만의 기억 지도가 자랍니다. 어디가 단단하고 어디가
                흐려졌는지 한눈에 — 다음에 무엇을 다시 볼지 순공이가 짚어줘요.
              </p>
              <Link
                href="/journey"
                className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-mint-100)] px-[13px] py-1.5 text-[13px] font-bold text-[var(--color-mint-900)] transition-colors hover:bg-[var(--color-mint-300)]"
              >
                순공냅스 둘러보기 <IconArrow size={15} />
              </Link>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-mint-50)] p-3.5">
              <svg viewBox="0 0 300 220" className="block h-auto w-full" role="img" aria-label="개념이 시냅스처럼 이어진 망각맵 — 단단한 개념은 진하게, 흐려진 개념은 옅게">
                <g stroke="var(--color-mint-300)" strokeWidth="1.6">
                  <line x1="80" y1="60" x2="150" y2="45" />
                  <line x1="150" y1="45" x2="225" y2="70" />
                  <line x1="80" y1="60" x2="110" y2="130" />
                  <line x1="110" y1="130" x2="180" y2="150" />
                  <line x1="150" y1="45" x2="180" y2="150" />
                  <line x1="225" y1="70" x2="180" y2="150" />
                  <line x1="110" y1="130" x2="70" y2="180" />
                  <line x1="180" y1="150" x2="235" y2="175" />
                </g>
                <g>
                  <circle cx="80" cy="60" r="14" fill="var(--color-mint-700)" />
                  <circle cx="150" cy="45" r="17" fill="var(--color-mint-700)" />
                  <circle cx="225" cy="70" r="12" fill="var(--color-mint-500)" />
                  <circle cx="110" cy="130" r="15" fill="var(--color-mint-500)" />
                  <circle cx="180" cy="150" r="16" fill="var(--color-mint-700)" />
                  <circle cx="70" cy="180" r="11" fill="var(--color-mint-100)" stroke="var(--color-mint-300)" strokeWidth="1.5" />
                  <circle cx="235" cy="175" r="10" fill="var(--color-mint-100)" stroke="var(--color-mint-300)" strokeWidth="1.5" />
                </g>
                <g fill="var(--color-text-inverse)" fontFamily="var(--font-body)" fontSize="9" fontWeight="700" textAnchor="middle">
                  <text x="80" y="63">극한</text>
                  <text x="150" y="48">미분</text>
                  <text x="180" y="153">적분</text>
                </g>
                <g fill="var(--color-text-default)" fontFamily="var(--font-body)" fontSize="8" fontWeight="600" textAnchor="middle">
                  <text x="70" y="183">수열</text>
                  <text x="235" y="178">벡터</text>
                </g>
              </svg>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── E) 동반자 — 순공이 mood ──────────────────────────────────────── */}
      <section id="companion" className={`${SHELL} ${SECTION}`}>
        <Reveal>
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-[clamp(30px,5vw,56px)] text-center shadow-[var(--shadow-card)]">
            <div className="mb-2 flex flex-wrap items-end justify-center gap-3">
              {COMPANION_MOODS.map((m) => (
                <figure key={m.caption} className="w-[104px]">
                  <Image
                    src={m.src}
                    alt={m.alt}
                    width={184}
                    height={184}
                    className="mx-auto w-[92px] [filter:drop-shadow(0_8px_14px_color-mix(in_srgb,var(--color-mint-900)_16%,transparent))]"
                  />
                  <figcaption className="mt-1 text-[12.5px] font-bold text-[var(--color-text-default)]">
                    {m.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
            <span className={EYEBROW}>순공이</span>
            <h2 className="mt-3.5 text-[clamp(22px,3.4vw,32px)] font-extrabold leading-[1.3] tracking-[-0.03em] text-[var(--color-text-strong)]">
              혼자 외우지 않아요. <span className="text-[var(--color-mint-700)]">순공이가 곁에 있어요.</span>
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {COMPANION_QUOTES.map((q) => (
                <div
                  key={q}
                  className="max-w-[330px] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-mint-50)] px-5 py-3.5 text-[15.5px] font-semibold text-[var(--color-mint-900)]"
                >
                  {q}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── F) 앱·웹 미리보기 — 승인 목업(SOO-96) 슬롯 ──────────────────── */}
      <section id="showcase" className={`${SHELL} ${SECTION}`}>
        <Reveal className="mx-auto mb-[clamp(28px,5vh,44px)] max-w-[640px] text-center">
          <span className={EYEBROW}>앱 · 웹 어디서나</span>
          <h2 className={HEAD_H2}>
            주머니 속 앱으로, <span className="text-[var(--color-mint-700)]">책상 위 웹으로</span>
          </h2>
          <p className={HEAD_P}>
            같은 회독, 같은 순공이. 아래는 <b className="text-[var(--color-text-strong)]">지난 승인 목업(SOO-96)</b>{" "}
            화면 그대로이며, 실앱 개발이 끝나면 실제 화면으로 자동 교체됩니다.
          </p>
        </Reveal>
        <Reveal>
          <div className="rounded-[var(--radius-xl)] bg-[linear-gradient(180deg,var(--color-mint-50),var(--color-background))] px-[clamp(18px,4vw,44px)] py-[clamp(32px,5vw,56px)]">
            <div className="mx-auto mb-8 flex w-fit gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-surface)] p-[5px] shadow-[var(--shadow-card)]">
              {(["app", "web"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPane(p)}
                  aria-pressed={pane === p}
                  className={cn(
                    "rounded-[var(--radius-pill)] px-[22px] py-[9px] text-[15px] font-bold transition-all duration-[var(--duration-fast)]",
                    pane === p
                      ? "bg-[var(--color-mint-700)] text-[var(--color-text-inverse)] shadow-[var(--shadow-card)]"
                      : "bg-transparent text-[var(--color-text-default)]",
                  )}
                >
                  {p === "app" ? "모바일 앱" : "데스크톱 웹"}
                </button>
              ))}
            </div>

            {pane === "app" ? (
              <div className="flex flex-col items-center">
                <div className="relative w-[262px] rounded-[38px] bg-[var(--color-text-strong)] p-[9px] shadow-[var(--shadow-elevated)]">
                  <span className="absolute left-1/2 top-2.5 z-[9] -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-pill)] bg-[var(--color-mint-900)] px-3 py-[5px] text-[11px] font-bold text-[var(--color-text-inverse)]">
                    승인 목업 SOO-96 · 개발 후 실화면 교체
                  </span>
                  <div className="overflow-hidden rounded-[30px] bg-[var(--color-background)]">
                    <Image
                      src="/brand/landing/preview-app.png"
                      alt="순공대장 앱 홈 — 스트릭·기억HP·오늘의 회독·회독퀘스트 (승인 목업 SOO-96)"
                      width={390}
                      height={990}
                      className="block w-full"
                    />
                  </div>
                </div>
                <div className="mt-3.5 text-[13px] font-semibold text-[var(--color-text-default)]">
                  지난 승인 목업(SOO-96) 홈 화면 그대로 · 하단 중앙 = 문제 촬영
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-[720px] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-elevated)]">
                  <span className="absolute left-1/2 top-2.5 z-[9] -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-pill)] bg-[var(--color-mint-900)] px-3 py-[5px] text-[11px] font-bold text-[var(--color-text-inverse)]">
                    승인 목업 SOO-96 · 개발 후 실화면 교체
                  </span>
                  <div className="flex items-center gap-1.5 border-b border-[var(--color-border-default)] bg-[var(--color-bg-sunken)] px-3.5 py-2.5">
                    <i className="h-[11px] w-[11px] rounded-full bg-[var(--color-border-strong)]" />
                    <i className="h-[11px] w-[11px] rounded-full bg-[var(--color-border-strong)]" />
                    <i className="h-[11px] w-[11px] rounded-full bg-[var(--color-border-strong)]" />
                    <span className="ml-2.5 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-surface)] px-3.5 py-1.5 text-[12px] text-[var(--color-text-muted)]">
                      soongong.app/today
                    </span>
                  </div>
                  <Image
                    src="/brand/landing/preview-web.png"
                    alt="순공대장 웹 데스크톱 홈 — 상단 네비·stats·오늘의 회독 (승인 목업 SOO-96)"
                    width={1087}
                    height={534}
                    className="block w-full"
                  />
                </div>
                <div className="mt-3.5 text-[13px] font-semibold text-[var(--color-text-default)]">
                  지난 승인 목업(SOO-96) 웹 데스크톱 화면 그대로 · 넓은 레이아웃
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </section>

      {/* ── G) 최종 CTA ──────────────────────────────────────────────────── */}
      <section id="final" className={`${SHELL} ${SECTION}`}>
        <Reveal>
          <div className="rounded-[var(--radius-xl)] bg-[linear-gradient(135deg,var(--color-mint-700),var(--color-mint-900))] px-[clamp(20px,5vw,40px)] py-[clamp(42px,7vw,72px)] text-center text-[var(--color-text-inverse)]">
            <Image
              src="/mascot/main-half-good-alpha.png"
              alt="기뻐하는 순공이"
              width={248}
              height={248}
              className="mx-auto mb-2 w-[124px] [filter:drop-shadow(0_10px_20px_color-mix(in_srgb,var(--color-text-strong)_18%,transparent))]"
            />
            <h2 className="text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.25] tracking-[-0.03em]">
              오늘 푼 한 문제,
              <br />
              내일도 기억하게.
            </h2>
            <p className="mx-auto mt-3.5 max-w-[500px] text-[clamp(15px,2vw,18px)] leading-[1.65] opacity-90">
              지금 문제 한 장만 찍어보세요. 가입은 첫 회독을 끝낸 뒤에 골라도 됩니다.
            </p>
            <Link
              href="/today"
              className="mt-7 inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] bg-[var(--color-surface)] px-[30px] py-[15px] text-[17px] font-bold text-[var(--color-mint-900)] shadow-[var(--shadow-elevated)] transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-soft)] hover:-translate-y-0.5"
            >
              <IconCamera size={22} /> 무료로 문제 찍어보기
            </Link>
            <div className="mt-4 text-[13px] opacity-80">
              신용카드 없이 시작 · 광고 없음 · 압박 알림 없음
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 푸터 (콴다→AI 문제 풀이 reframing) ──────────────────────────── */}
      <footer className={`${SHELL} pb-12 pt-[clamp(40px,7vh,80px)] text-center`}>
        <Reveal>
          <p className="mx-auto max-w-[460px] text-sm font-semibold leading-relaxed text-[var(--color-text-default)]">
            AI 문제 풀이는 학생의 ‘막힘’을 풀고, 순공대장은 학생의 ‘까먹음’을 풀어요.
          </p>
          <p className="mt-6 text-xs text-[var(--color-text-muted)]">
            © 순공대장 · 까먹음을 푸는 회독 엔진
          </p>
        </Reveal>
      </footer>
    </main>
  );
}
