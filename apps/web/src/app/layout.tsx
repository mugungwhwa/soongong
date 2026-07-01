import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/static/pretendard.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { PwaInit } from "@/shared/ui/PwaInit";
import { AppToaster } from "@/shared/ui/app-toaster";

export const metadata: Metadata = {
  title: "순공대장",
  description: "수능생 듀오링고형 AI 회독 앱",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "순공대장",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#A8DCCB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* favicon·apple-touch·icon은 App Router 파일 컨벤션(app/icon.svg·apple-icon.png·favicon.ico)이 자동 주입한다 */}
      {/* suppressHydrationWarning: Grammarly 등 브라우저 확장이 <body>에 주입하는
          속성(data-gr-ext-installed 등)으로 인한 하이드레이션 경고 무시 */}
      <body className="antialiased" suppressHydrationWarning>
        <PwaInit />
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
