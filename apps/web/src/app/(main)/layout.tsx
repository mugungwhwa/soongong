import { Sidebar } from "@/widgets/sidebar";
import { BottomNav } from "@/widgets/bottom-nav";
import { GlobalUploadSheet, FloatingCaptureButton } from "@/features/upload-source";

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
      {/* 데스크톱 상시 카메라 진입 (SOO-125) — 스크롤해도 우하단 고정. 모바일은 BottomNav 중앙 FAB. */}
      <FloatingCaptureButton />
      <GlobalUploadSheet />
    </div>
  );
}
