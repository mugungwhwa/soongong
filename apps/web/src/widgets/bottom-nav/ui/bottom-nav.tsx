"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import { useUploadSheetStore } from "@/features/upload-source";
import type { ReactNode } from "react";

/**
 * 하단 탭바 (모바일 <lg) — SOO-128 P3 공통 셸 1:1 정합.
 *
 * 프로토타입(docs/prototypes/SOO-128-main/index.html `.tabbar`) 시각 SSoT를 그대로 렌더한다.
 * 순서: 회독 / 순공냅스 / [중앙 카메라 FAB] / 오답 / 내 정보.
 * 중앙 FAB = 원형 mint(56px) + 위로 -30px 돌출 + 흰 4px 보더 + 흰 카메라 아이콘 + "찍기" 라벨.
 * FAB → 업로드 시트 트리거(useUploadSheetStore.openSheet) 재사용 (데스크톱 floating FAB과 동일 액션).
 * 아이콘은 프로토타입 인라인 SVG(stroke 1.5, currentColor)를 그대로 옮겼다.
 */

const SVG_BASE = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ReviewIcon() {
  return (
    <svg {...SVG_BASE} className="h-[23px] w-[23px]">
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4" />
    </svg>
  );
}

function SynapseIcon() {
  return (
    <svg {...SVG_BASE} className="h-[23px] w-[23px]">
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.1 10.9 15.9 7.1M8.1 13.1 15.9 16.9" />
    </svg>
  );
}

function WrongNotesIcon() {
  return (
    <svg {...SVG_BASE} className="h-[23px] w-[23px]">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg {...SVG_BASE} className="h-[23px] w-[23px]">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg {...SVG_BASE} className="h-[26px] w-[26px]">
      <path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h7l1 2H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

type TabItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

// 좌 2 / 중앙 FAB / 우 2 — 2:2 대칭 유지.
const LEFT_ITEMS: TabItem[] = [
  { href: ROUTES.today, label: "회독", icon: <ReviewIcon /> },
  { href: ROUTES.journey, label: "순공냅스", icon: <SynapseIcon /> },
];
const RIGHT_ITEMS: TabItem[] = [
  { href: ROUTES.wrongNotes, label: "오답", icon: <WrongNotesIcon /> },
  { href: ROUTES.admin, label: "내 정보", icon: <ProfileIcon /> },
];

export function BottomNav() {
  const pathname = usePathname();
  const openSheet = useUploadSheetStore((s) => s.openSheet);

  const renderTab = (item: TabItem) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className="flex flex-1 flex-col items-center gap-[3px] text-[10.5px] font-bold"
        style={{ color: isActive ? "var(--color-mint-700)" : "var(--color-text-muted)" }}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-end justify-around border-t border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-1"
      style={{
        paddingTop: "8px",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
      }}
    >
      {LEFT_ITEMS.map(renderTab)}

      {/* 중앙 카메라 FAB = 메인 히어로 액션. 업로드 시트 트리거 재사용. */}
      <button
        type="button"
        onClick={openSheet}
        aria-label="카메라로 문제 출제하기"
        className="flex flex-none flex-col items-center"
      >
        <span className="grid h-14 w-14 -mt-[30px] place-items-center rounded-full border-4 border-[var(--color-bg-elevated)] bg-[var(--color-primary-cta)] text-[var(--color-text-inverse)] shadow-[var(--shadow-elevated)] active:scale-95 transition-transform">
          <CameraIcon />
        </span>
        <span className="mt-0.5 text-[10px] font-extrabold text-[var(--color-mint-700)]">
          찍기
        </span>
      </button>

      {RIGHT_ITEMS.map(renderTab)}
    </nav>
  );
}
