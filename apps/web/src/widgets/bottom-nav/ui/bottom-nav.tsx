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
import { useUploadSheetStore } from "@/features/upload-source";

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
          // 중앙 카메라 hero FAB — 순공이가 카메라를 안은 브랜드 자산(Mike 제공, SOO-125).
          // 하단 네비 중앙에서 위로 돌출(-mt-9)해 바와 살짝 머징 → 제품 핵심 행동(문제 촬영·공급)을
          // 가장 눈에 띄는 진입점으로. 자산 자체가 글로시 캡처 버튼 비주얼이라 별도 민트 원 래퍼 없이
          // 흰 elevated 디스크 위에 얹어 떠 보이게만 한다(디자인 변경 X, 배치·최적화만).
          return (
            <button
              key="camera-fab"
              type="button"
              className="relative -mt-9 flex items-center justify-center rounded-full bg-[var(--color-bg-elevated)] shadow-[var(--shadow-elevated)] ring-4 ring-[var(--color-bg-elevated)] transition-transform active:scale-95"
              aria-label="문제 촬영·업로드"
              onClick={openSheet}
            >
              <Image
                src="/brand/soongong-camera-alpha.png"
                alt=""
                width={132}
                height={132}
                priority
                className="h-[60px] w-[60px] object-contain drop-shadow-[var(--shadow-card)]"
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
