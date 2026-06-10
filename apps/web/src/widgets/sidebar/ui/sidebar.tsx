"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import { signOut } from "@/app/actions/auth";
import {
  Home,
  Calendar,
  NotebookPen,
  BarChart3,
  BookOpen,
  ShieldCheck,
  LogOut,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

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

const MAIN_ITEMS: NavItem[] = [
  { href: ROUTES.today, label: "오늘의 회독", Icon: Home },
  { href: ROUTES.calendar, label: "회독 캘린더", Icon: Calendar },
  { href: ROUTES.wrongNotes, label: "오답노트", Icon: NotebookPen },
  { href: ROUTES.graph, label: "그래프", Icon: BarChart3 },
  { href: ROUTES.diary, label: "순공일지", Icon: BookOpen },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: ROUTES.admin, label: "검수", Icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[220px] flex-col gap-2 border-r border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-6">
      <div className="mb-6">
        <svg
          viewBox="0 0 245 44"
          style={{ width: "100%", maxWidth: 240, overflow: "visible" }}
          role="img"
          aria-label="SOONGONG"
        >
          <text
            x="2"
            y="35"
            fontFamily="'Arial Black','Helvetica Neue',Arial,sans-serif"
            fontSize="36"
            fontWeight={900}
            letterSpacing="3"
            fill="var(--color-mint-900)"
            stroke="var(--color-mint-900)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ paintOrder: "stroke" }}
          >
            SOONGONG
          </text>
        </svg>
      </div>
      <nav className="flex flex-col gap-1">
        {MAIN_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 transition text-sm"
              style={
                isActive
                  ? {
                      background: "var(--color-mint-100)",
                      color: "var(--color-mint-900)",
                      fontWeight: 700,
                    }
                  : {
                      color: "var(--color-text-default)",
                    }
              }
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
                className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 transition text-sm"
                style={
                  isActive
                    ? {
                        background: "var(--color-mint-100)",
                        color: "var(--color-mint-900)",
                        fontWeight: 700,
                      }
                    : {
                        color: "var(--color-text-muted)",
                      }
                }
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
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 hover:bg-[var(--color-mint-50)] transition text-[var(--color-text-muted)] text-sm text-left"
            >
              <LogOut {...ICON_STYLE} color="var(--color-text-muted)" />
              <span>로그아웃</span>
            </button>
          </form>
        </nav>
      </div>
    </aside>
  );
}
