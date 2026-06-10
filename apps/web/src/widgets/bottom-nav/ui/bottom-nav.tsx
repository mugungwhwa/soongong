"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import {
  Home,
  Camera,
  NotebookPen,
  BarChart3,
  Compass,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<LucideProps>;
} | null;

const ITEMS: NavItem[] = [
  { href: ROUTES.today, label: "오늘", Icon: Home },
  { href: ROUTES.journey, label: "내 여정", Icon: Compass },
  null, // camera FAB placeholder
  { href: ROUTES.wrongNotes, label: "오답", Icon: NotebookPen },
  { href: ROUTES.graph, label: "그래프", Icon: BarChart3 },
];

const ICON_BASE: LucideProps = {
  size: 22,
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 border-t border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] flex justify-around items-center z-50"
      style={{ height: "calc(64px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS.map((item) => {
        if (item === null) {
          // 중앙 카메라 FAB
          return (
            <button
              key="camera-fab"
              type="button"
              className="flex items-center justify-center w-14 h-14 rounded-full -mt-5 shadow-lg"
              style={{ background: "var(--color-mint-900)" }}
              aria-label="카메라"
            >
              <Camera
                size={22}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                color="white"
              />
            </button>
          );
        }
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-1 text-xs rounded-lg"
            style={
              isActive
                ? { background: "var(--color-mint-100)", color: "var(--color-mint-900)", fontWeight: 700 }
                : { color: "var(--color-text-muted)" }
            }
          >
            <item.Icon
              {...ICON_BASE}
              color={isActive ? "var(--color-mint-700)" : "var(--color-text-muted)"}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
