"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import { UploadSheet } from "@/features/upload-source";

const ITEMS = [
  { href: ROUTES.today, label: "오늘", icon: "🏠" },
  { href: ROUTES.calendar, label: "캘린더", icon: "📅" },
  null, // camera FAB placeholder
  { href: ROUTES.wrongNotes, label: "오답", icon: "📝" },
  { href: ROUTES.graph, label: "그래프", icon: "📊" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
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
              onClick={() => setUploadOpen(true)}
              className="flex items-center justify-center w-14 h-14 rounded-full -mt-5 shadow-lg"
              style={{ background: "var(--color-mint-900)" }}
              aria-label="카메라로 문제 촬영"
            >
              <span className="text-2xl">📷</span>
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
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
    <UploadSheet open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
