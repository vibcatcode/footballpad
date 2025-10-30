import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/lib/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FootballPad - 축구 전술, 경기분석, 기술훈련 전문 사이트",
  description: "축구 전술, 경기분석, 기술훈련, 레슨, 리뷰를 제공하는 축구 전문 사이트 · 포메이션 분석 · 경기 데이터 · 훈련 프로그램",
  keywords: "축구, 전술, 경기분석, 기술훈련, 레슨, 리뷰, 포메이션, 축구훈련, 풋볼패드",
  authors: [{ name: "FootballPad Team" }],
  openGraph: {
    title: "FootballPad - 축구 전술, 경기분석, 기술훈련 전문 사이트",
    description: "축구 전술, 경기분석, 기술훈련, 레슨, 리뷰를 제공하는 축구 전문 사이트",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="풋볼패드" />
        <link rel="apple-touch-icon" href="/FootballPad_Icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/FootballPad_Icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/FootballPad_Icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="footballpad-theme"
        >
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
