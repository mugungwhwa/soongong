import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/static/pretendard.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { PwaInit } from "@/shared/ui/PwaInit";

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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#A8DCCB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/brand/icon.png" />
      </head>
      {/* suppressHydrationWarning: Grammarly 등 브라우저 확장이 <body>에 주입하는
          속성(data-gr-ext-installed 등)으로 인한 하이드레이션 경고 무시 */}
      <body className="antialiased" suppressHydrationWarning>
        <PwaInit />
        {children}
      </body>
    </html>
  );
}
