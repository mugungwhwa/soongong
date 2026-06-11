import { Sidebar } from "@/widgets/sidebar";
import { BottomNav } from "@/widgets/bottom-nav";
import { GlobalUploadSheet } from "@/features/upload-source";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* min-w-0: flex 자식이 콘텐츠 폭에 밀려 가로 스크롤 나는 것 방지.
          내부 래퍼 max-w-[1440px] + mx-auto: 디자인락 §3-1 '유동 max-width 1440px' 안전망.
          각 화면이 자체 max-width(2xl 등)를 더 좁게 가지면 그게 우선 적용된다. */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
      <BottomNav />
      <GlobalUploadSheet />
    </div>
  );
}
