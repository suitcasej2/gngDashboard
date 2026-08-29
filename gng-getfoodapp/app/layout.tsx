import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import Script from "next/script";
import { NavigationProvider } from "@/components/layout/navigation-provider";
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
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  applicationName: "Get Food",
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
        {process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ? (
          <Script
            id="onesignal-sdk"
            src="/push/onesignal/OneSignalSDK.page.js"
            strategy="beforeInteractive"
          />
        ) : null}
        <Script id="register-sw" strategy="beforeInteractive">
          {`(function(){if(!("serviceWorker"in navigator))return;navigator.serviceWorker.getRegistrations().then(function(regs){return Promise.all(regs.map(function(r){var u=r.active&&r.active.scriptURL||r.installing&&r.installing.scriptURL||r.waiting&&r.waiting.scriptURL||"";if(u.indexOf("/sw.js")===-1&&u.indexOf("OneSignalSDKWorker")!==-1){return r.unregister();}return null;}));}).finally(function(){navigator.serviceWorker.register("/sw.js",{scope:"/"}).then(function(r){return r.update();}).catch(function(){});});})();`}
        </Script>
        <NavigationProvider>
          <SideNavProvider>
            <OneSignalProvider />
            {children}
          </SideNavProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
