"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import {
  Home,
  NotebookPen,
  BarChart3,
  Calendar,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { useUploadSheetStore, CAMERA_CAPTURE_ASSET } from "@/features/upload-source";

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<LucideProps>;
} | null;

const ITEMS: NavItem[] = [
  { href: ROUTES.today, label: "오늘", Icon: Home },
  { href: ROUTES.calendar, label: "캘린더", Icon: Calendar },
  null, // camera FAB placeholder — 2:2 대칭 유지로 중앙 배치
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
  const openSheet = useUploadSheetStore((s) => s.openSheet);

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 border-t border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] flex justify-around items-center z-50"
      style={{ height: "calc(64px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS.map((item) => {
        if (item === null) {
          // 중앙 카메라 hero FAB — 순공이+카메라 브랜드 자산(SOO-124).
          // 회독 목록 위 하단 네비 중앙에서 위로 돌출(-mt-7)해 가장 눈에 띄는 hero로.
          // 자산이 둥근 버블 형태라 별도 배경 원형 없이 이미지만 띄운다.
          return (
            <button
              key="camera-fab"
              type="button"
              className="group flex items-center justify-center -mt-7 active:scale-95 transition-transform"
              aria-label="카메라로 문제 출제하기"
              onClick={openSheet}
            >
              <Image
                src={CAMERA_CAPTURE_ASSET}
                alt=""
                width={64}
                height={64}
                priority
                className="object-contain drop-shadow-[var(--shadow-elevated)]"
                style={{ width: 64, height: 64 }}
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
