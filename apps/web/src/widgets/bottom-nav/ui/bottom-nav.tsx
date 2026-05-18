import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";

const ITEMS = [
  { href: ROUTES.today, label: "오늘", icon: "🏠" },
  { href: ROUTES.calendar, label: "캘린더", icon: "📅" },
  { href: ROUTES.wrongNotes, label: "오답", icon: "📝" },
  { href: ROUTES.diary, label: "일지", icon: "📔" },
];

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 border-t border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] flex justify-around py-2 z-50">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-[var(--color-text-muted)]"
        >
          <span className="text-lg">{i.icon}</span>
          <span>{i.label}</span>
        </Link>
      ))}
    </nav>
  );
}
