import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { PWA_SPLASH_BACKGROUND } from "@/lib/pwa-splash";
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
  },
  /** iOS still keys some standalone / splash behavior off this legacy meta. */
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#56BB55",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
