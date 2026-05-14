import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { PWA_SPLASH_BACKGROUND } from "@/lib/pwa-splash";
import { IOS_STARTUP_SPLASHES } from "@/lib/ios-startup-splashes";
import "./globals.css";

const highwayGothic = localFont({
  src: [
    {
      path: "./fonts/HWYGOTH.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/HWYGEXPD.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEO Harvest Dashboard",
  description: "Mobile-first CEO console for draft harvests and publishing",
  icons: {
    icon: [{ url: "/AppIcon.png", sizes: "540x540", type: "image/png" }],
    apple: [{ url: "/AppIcon.png", sizes: "540x540", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "GNG Harvest",
    statusBarStyle: "default",
    startupImage: IOS_STARTUP_SPLASHES.map(({ preset, media }) => ({
      url: `/ios-splash?preset=${preset}`,
      media,
    })),
  },
  /** iOS still keys some standalone / splash behavior off this legacy meta. */
  other: {
    "apple-mobile-web-app-capable": "yes",
    "supported-color-schemes": "light",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { color: PWA_SPLASH_BACKGROUND, media: "(prefers-color-scheme: light)" },
    { color: PWA_SPLASH_BACKGROUND, media: "(prefers-color-scheme: dark)" },
  ],
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
        {children}
      </body>
    </html>
  );
}
