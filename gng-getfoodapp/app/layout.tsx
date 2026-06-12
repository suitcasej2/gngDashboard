import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { SideNavProvider } from "@/components/layout/side-nav";
import { OneSignalProvider } from "@/components/push/onesignal-provider";
import { PWA_SPLASH_BACKGROUND } from "@/lib/pwa-splash";
import "./globals.css";

const highwayGothic = localFont({
  src: [
    { path: "./fonts/HWYGOTH.ttf", weight: "400", style: "normal" },
    { path: "./fonts/HWYGEXPD.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GNG Get Food",
  description: "Subscriber portal for harvest RSVPs, impact, and community chat",
  icons: {
    icon: [{ url: "/AppIcon.png", sizes: "540x540", type: "image/png" }],
    apple: [{ url: "/AppIcon.png", sizes: "540x540", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "GNG Get Food",
    statusBarStyle: "default",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "supported-color-schemes": "light",
  },
};

export const viewport: Viewport = {
  themeColor: PWA_SPLASH_BACKGROUND,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${highwayGothic.variable} ${geistMono.variable} h-full antialiased`}
      style={{ backgroundColor: PWA_SPLASH_BACKGROUND }}
    >
      <body
        className="flex min-h-dvh flex-col"
        style={{ backgroundColor: PWA_SPLASH_BACKGROUND }}
      >
        <SideNavProvider>
          <OneSignalProvider />
          {children}
        </SideNavProvider>
      </body>
    </html>
  );
}
