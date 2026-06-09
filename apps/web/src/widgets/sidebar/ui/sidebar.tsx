import Link from "next/link";
import { Mascot } from "@/shared/ui/mascot";
import { ROUTES } from "@/shared/config/routes";
import { signOut } from "@/app/actions/auth";

const MAIN_ITEMS = [
  { href: ROUTES.today, label: "오늘의 회독", icon: "🏠" },
  { href: ROUTES.calendar, label: "회독 캘린더", icon: "📅" },
  { href: ROUTES.wrongNotes, label: "오답노트", icon: "📝" },
  { href: ROUTES.graph, label: "그래프", icon: "📊" },
  { href: ROUTES.diary, label: "순공일지", icon: "📔" },
];

const ADMIN_ITEMS = [
  { href: ROUTES.admin, label: "검수", icon: "🛡️" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-[220px] flex-col gap-2 border-r border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mascot mood="cheer" size="md" />
        <div className="font-bold text-[var(--color-text-strong)]">순공대장</div>
      </div>
      <nav className="flex flex-col gap-1">
        {MAIN_ITEMS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 hover:bg-[var(--color-mint-50)] transition text-[var(--color-text-default)]"
          >
            <span>{i.icon}</span>
            <span>{i.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-[var(--color-border-default)]">
        <div className="text-xs text-[var(--color-text-muted)] mb-2 px-3">관리</div>
        <nav className="flex flex-col gap-1">
          {ADMIN_ITEMS.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 hover:bg-[var(--color-mint-50)] transition text-[var(--color-text-muted)] text-sm"
            >
              <span>{i.icon}</span>
              <span>{i.label}</span>
            </Link>
          ))}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 hover:bg-[var(--color-mint-50)] transition text-[var(--color-text-muted)] text-sm text-left"
            >
              <span>🚪</span>
              <span>로그아웃</span>
            </button>
          </form>
        </nav>
      </div>
    </aside>
  );
}
