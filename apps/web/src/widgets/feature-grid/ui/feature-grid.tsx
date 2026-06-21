import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";
import {
  CalendarCheck,
  RotateCcw,
  Brain,
  Trophy,
  Lock,
  ChevronRight,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

/**
 * 홈 기능 진입 카드 그리드 (SOO-81).
 *
 * 마케팅 랜딩(SOO-73)의 게임화 디자인 언어를 인앱 메인에 차용한 핵심 IA 요소.
 * mockup(ui example.png)의 기능 카드 4종을 실제 라우트로 매핑한다.
 *
 * 디자인 검수 준수:
 * - 홈 게임성 강도 50% 캡(2026-06-20 Mike, 30→50): 활기 OK이되 미등록 네온/glow 남발·다크 금지.
 * - 순공리그는 MVP 1.5차(CLAUDE.md §2) → 잠금(disabled) 상태로만 노출.
 * - 색은 tokens.css 시맨틱 토큰만(raw hex 0). light-only.
 * - 카피는 동반자 톤(fear/passive-aggressive 금지).
 */

type Feature = {
  key: string;
  title: string;
  desc: string;
  href: string;
  Icon: ComponentType<LucideProps>;
  locked?: boolean;
  lockNote?: string;
};

const FEATURES: Feature[] = [
  {
    key: "today",
    title: "오늘의 회독",
    desc: "까먹기 직전 타이밍에 다시 만나요",
    href: "#today-quests",
    Icon: CalendarCheck,
  },
  {
    key: "recovery",
    title: "오답 회수",
    desc: "틀린 문제를 내 것으로 되돌려요",
    href: ROUTES.wrongNotes,
    Icon: RotateCcw,
  },
  {
    key: "forgetting",
    title: "순공냅스",
    desc: "기억이 옅어지기 전에 지켜내요",
    href: ROUTES.journey,
    Icon: Brain,
  },
  {
    key: "league",
    title: "순공리그",
    desc: "곧 만나요",
    href: "#",
    Icon: Trophy,
    locked: true,
    lockNote: "준비 중",
  },
];

const ICON_STYLE: LucideProps = {
  size: 22,
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function FeatureCardInner({ feature }: { feature: Feature }) {
  const { title, desc, Icon, locked, lockNote } = feature;
  return (
    <>
      <div className="flex items-start justify-between">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)]"
          style={{
            background: locked
              ? "var(--color-bg-sunken)"
              : "var(--color-mint-100)",
          }}
        >
          <Icon
            {...ICON_STYLE}
            color={
              locked ? "var(--color-text-muted)" : "var(--color-mint-700)"
            }
          />
        </span>
        {locked ? (
          <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-warning-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-muted)]">
            <Lock size={11} strokeWidth={2} aria-hidden="true" />
            {lockNote}
          </span>
        ) : (
          <ChevronRight
            size={18}
            strokeWidth={1.5}
            color="var(--color-text-muted)"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-bold text-[var(--color-text-strong)]">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{desc}</p>
      </div>
    </>
  );
}

export function FeatureGrid() {
  return (
    <section aria-label="바로가기" className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        오늘 뭐부터 할까요?
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {FEATURES.map((feature) =>
          feature.locked ? (
            <div
              key={feature.key}
              aria-disabled="true"
              className="cursor-not-allowed rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4 opacity-70 shadow-[var(--shadow-card)]"
            >
              <FeatureCardInner feature={feature} />
            </div>
          ) : (
            <Link
              key={feature.key}
              href={feature.href}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-mint-300)] hover:bg-[var(--color-mint-50)]"
            >
              <FeatureCardInner feature={feature} />
            </Link>
          ),
        )}
      </div>
    </section>
  );
}
