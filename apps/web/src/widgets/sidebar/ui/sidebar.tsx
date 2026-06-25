"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import { Logo } from "@/shared/ui/logo";
import { useUploadSheetStore } from "@/features/upload-source";
import type { ReactNode } from "react";

/**
 * 좌측 네비 레일 (데스크톱 ≥lg) — SOO-128 P3 공통 셸 1:1 정합.
 *
 * 프로토타입(docs/prototypes/SOO-128-main/index.html `.rail`) 시각 SSoT를 그대로 렌더한다.
 * 구성: 로고 → "문제 찍기" 카메라 CTA(primary mint) → 네비 5개 → spacer → 사용자 푸터.
 * 활성 항목 = mint-50 배경 + mint-900 텍스트(아이콘 mint-700). 색/값은 tokens.css 변수만 사용.
 *
 * 아이콘은 프로토타입의 인라인 SVG(stroke 1.5, currentColor)를 그대로 옮겼다 — lucide 미사용으로
 * 프로토타입과 픽셀 정합을 맞춘다.
 */

const SVG_BASE = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function CameraIcon() {
  return (
    <svg {...SVG_BASE} className="h-5 w-5">
      <path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h7l1 2H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg {...SVG_BASE} className="h-[22px] w-[22px]">
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4" />
    </svg>
  );
}

function SynapseIcon() {
  return (
    <svg {...SVG_BASE} className="h-[22px] w-[22px]">
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.1 10.9 15.9 7.1M8.1 13.1 15.9 16.9" />
    </svg>
  );
}

function WrongNotesIcon() {
  return (
    <svg {...SVG_BASE} className="h-[22px] w-[22px]">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
    </svg>
  );
}

function LeagueIcon() {
  return (
    <svg {...SVG_BASE} className="h-[22px] w-[22px]">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5a2 2 0 0 0 0 4h1.5M16 6h3a2 2 0 0 1 0 4h-1.5" />
      <path d="M12 13v4M10 21h4l-.5-4h-3L10 21Z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg {...SVG_BASE} className="h-[22px] w-[22px]">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...SVG_BASE} className="h-2.5 w-2.5">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

type RailItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const NAV_ITEMS: RailItem[] = [
  { href: ROUTES.today, label: "회독", icon: <ReviewIcon /> },
  { href: ROUTES.journey, label: "순공냅스", icon: <SynapseIcon /> },
  { href: ROUTES.wrongNotes, label: "오답", icon: <WrongNotesIcon /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const openSheet = useUploadSheetStore((s) => s.openSheet);

  return (
    <aside className="hidden lg:flex w-[216px] flex-col gap-[3px] border-r border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-3 py-[18px]">
      {/* 로고 */}
      <Link
        href={ROUTES.today}
        aria-label="순공대장 홈"
        className="flex items-center justify-center px-2 pb-[22px] pt-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint-500)] focus-visible:ring-offset-2"
      >
        <Logo lang="ko" variant="light" className="h-auto w-full max-w-[180px]" priority />
      </Link>

      {/* "문제 찍기" 카메라 CTA = 메인 히어로 액션. 업로드 시트 트리거 재사용. */}
      <button
        type="button"
        onClick={openSheet}
        aria-label="문제 찍기 — 카메라로 새 회독 만들기"
        className="mb-2.5 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary-cta)] p-3 text-sm font-extrabold text-[var(--color-text-inverse)] shadow-[var(--shadow-card)] transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint-500)] focus-visible:ring-offset-2"
      >
        <span className="text-[var(--color-text-inverse)]">
          <CameraIcon />
        </span>
        문제 찍기
      </button>

      {/* 네비 5개 */}
      <nav className="flex flex-col gap-[3px]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-[11px] text-sm font-bold transition-colors"
              style={
                isActive
                  ? {
                      background: "var(--color-mint-50)",
                      color: "var(--color-mint-900)",
                    }
                  : { color: "var(--color-text-default)" }
              }
            >
              <span style={{ color: isActive ? "var(--color-mint-700)" : "var(--color-text-muted)" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* 리그/랭킹 — MVP 1차 잠금(게임화 SSoT: 순공리그 MVP 1.5차). 잠금 pill 표시. */}
        <div
          aria-disabled="true"
          className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-[11px] text-sm font-bold text-[var(--color-text-muted)]"
        >
          <span className="text-[var(--color-text-muted)]">
            <LeagueIcon />
          </span>
          <span>리그/랭킹</span>
          <span className="ml-auto inline-flex items-center gap-[3px] rounded-[var(--radius-pill)] bg-[var(--color-bg-sunken)] px-[7px] py-0.5 text-[10px] font-bold text-[var(--color-text-muted)]">
            <span className="text-[var(--color-text-muted)]">
              <LockIcon />
            </span>
            잠금
          </span>
        </div>

        {/* 내 정보 = 내 기록 페이지(/me). 어드민 AI 분석 검수(/admin)는 유저 네비에서 분리 —
            운영자는 /admin URL 로 직접 접근(역할 가드는 인증 인프라 도입 시 추가). */}
        {(() => {
          const isActive = pathname === ROUTES.me;
          return (
            <Link
              href={ROUTES.me}
              aria-current={isActive ? "page" : undefined}
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-[11px] text-sm font-bold transition-colors"
              style={
                isActive
                  ? {
                      background: "var(--color-mint-50)",
                      color: "var(--color-mint-900)",
                    }
                  : { color: "var(--color-text-default)" }
              }
            >
              <span style={{ color: isActive ? "var(--color-mint-700)" : "var(--color-text-muted)" }}>
                <ProfileIcon />
              </span>
              <span>내 정보</span>
            </Link>
          );
        })()}
      </nav>

      <div className="flex-1" />

      {/* 사용자 푸터 — 아바타 + 이름 + 등급/레벨. 등급(6단)·레벨 = 게임화 SSoT. */}
      <div className="mt-1.5 flex items-center gap-[9px] border-t border-[var(--color-border-default)] px-2.5 pb-1 pt-2.5">
        <span className="h-[30px] w-[30px] shrink-0 rounded-full bg-[var(--color-mint-100)]" />
        <span className="min-w-0 text-[12.5px] font-bold leading-[1.2] text-[var(--color-text-strong)]">
          민기
          <small className="block text-[11px] font-semibold text-[var(--color-text-muted)]">
            순공대장 · Lv.3
          </small>
        </span>
      </div>
    </aside>
  );
}
