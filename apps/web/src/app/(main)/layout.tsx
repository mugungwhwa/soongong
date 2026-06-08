import { Sidebar } from "@/widgets/sidebar";
import { BottomNav } from "@/widgets/bottom-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
