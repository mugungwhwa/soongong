import Link from "next/link";
import { Mascot } from "@/shared/ui/mascot";
import { ROUTES } from "@/shared/config/routes";

const ITEMS = [
  { href: ROUTES.today, label: "오늘의 회독", icon: "🏠" },
  { href: ROUTES.result, label: "결과", icon: "📊" },
  { href: ROUTES.admin, label: "검수", icon: "🛡️" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 flex-col gap-2 border-r border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mascot mood="cheer" size="md" />
        <div className="font-bold text-[var(--color-text-strong)]">순공대장</div>
      </div>
      <nav className="flex flex-col gap-1">
        {ITEMS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 hover:bg-[var(--color-mint-50)] transition"
          >
            <span>{i.icon}</span>
            <span>{i.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
