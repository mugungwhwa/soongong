import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard.css";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "순공대장",
  description: "수능생 듀오링고형 AI 회독 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* suppressHydrationWarning: Grammarly 등 브라우저 확장이 <body>에 주입하는
          속성(data-gr-ext-installed 등)으로 인한 하이드레이션 경고 무시 */}
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
