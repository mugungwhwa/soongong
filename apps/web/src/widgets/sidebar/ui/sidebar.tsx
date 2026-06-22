"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import {
  Home,
  LayoutDashboard,
  Calendar,
  NotebookPen,
  BarChart3,
  Brain,
  BookOpen,
  ShieldCheck,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/shared/lib/cn";
import { Logo } from "@/shared/ui/logo";

const ICON_STYLE: LucideProps = {
  size: 18,
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<LucideProps>;
};

// 순공냅스(/journey)는 평범한 목록 행에서 빼 상단 고정 아이콘 엔트리로 승격한다 (SOO-90, Mike 2026-06-20).
const MAIN_ITEMS: NavItem[] = [
  { href: ROUTES.today, label: "오늘의 회독", Icon: Home },
  { href: ROUTES.dashboard, label: "내 현황", Icon: LayoutDashboard },
  { href: ROUTES.calendar, label: "회독 캘린더", Icon: Calendar },
  { href: ROUTES.wrongNotes, label: "오답노트", Icon: NotebookPen },
  { href: ROUTES.graph, label: "그래프", Icon: BarChart3 },
  { href: ROUTES.diary, label: "순공일지", Icon: BookOpen },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: ROUTES.admin, label: "검수", Icon: ShieldCheck },
];

// 활성/비활성 nav row 공통 스타일. 활성: o100 배경 + o900 텍스트 + 700 (design-lock §3-1).
// 비활성: hover 시 o50 배경으로 affordance (design-lock §3-1 hover 규칙).
function navRowClass(isActive: boolean) {
  return cn(
    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition",
    isActive
      ? "font-bold"
      : "hover:bg-[var(--color-mint-50)]",
  );
}

function navRowStyle(isActive: boolean) {
  return isActive
    ? {
        background: "var(--color-mint-100)",
        color: "var(--color-mint-900)",
      }
    : { color: "var(--color-text-default)" };
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[220px] flex-col gap-2 border-r border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-6">
      {/* 브랜드 — SOO-105 확정 로고(공식 SVG)를 단일 <Logo>로 슬롯인. 옛 하드코딩 SOONGONG 텍스트 폐기 (SOO-120). */}
      <Link
        href={ROUTES.today}
        aria-label="순공대장 홈"
        className="mb-6 inline-flex w-fit items-center rounded-[var(--radius-md)] transition hover:opacity-80"
      >
        <Logo lang="ko" variant="light" className="h-12" priority />
      </Link>

      {/* 순공냅스 = 리텐션 엔진 시그니처 — 목록에서 빼 상단 고정 아이콘 엔트리로 승격 (SOO-90). */}
      <Link
        href={ROUTES.journey}
        aria-label="순공냅스 — 뉴럴 망각맵"
        aria-current={pathname === ROUTES.journey ? "page" : undefined}
        className="mb-3 flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 transition"
        style={{
          borderColor:
            pathname === ROUTES.journey
              ? "var(--color-mint-500)"
              : "var(--color-mint-300)",
          background:
            pathname === ROUTES.journey
              ? "var(--color-mint-100)"
              : "var(--color-mint-50)",
        }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-mint-100)]">
          <Brain
            {...ICON_STYLE}
            color="var(--color-mint-700)"
          />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-[var(--color-mint-900)]">
            순공냅스
          </span>
          <span className="block text-[11px] text-[var(--color-text-muted)]">
            뉴럴 망각맵
          </span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {MAIN_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navRowClass(isActive)}
              style={navRowStyle(isActive)}
              aria-current={isActive ? "page" : undefined}
            >
              <item.Icon
                {...ICON_STYLE}
                color={isActive ? "var(--color-mint-700)" : "var(--color-text-muted)"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-[var(--color-border-default)]">
        <div className="text-xs text-[var(--color-text-muted)] mb-2 px-3">관리</div>
        <nav className="flex flex-col gap-1">
          {ADMIN_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={navRowClass(isActive)}
                style={navRowStyle(isActive)}
                aria-current={isActive ? "page" : undefined}
              >
                <item.Icon
                  {...ICON_STYLE}
                  color={isActive ? "var(--color-mint-700)" : "var(--color-text-muted)"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
