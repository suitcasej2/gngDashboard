import type { MetadataRoute } from "next";
import { PWA_SPLASH_BACKGROUND } from "@/lib/pwa-splash";

const APP_ORIGIN = "https://gng-get-food-app.vercel.app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: `${APP_ORIGIN}/`,
    name: "GNG Get Food",
    short_name: "Get Food",
    description: "Subscriber portal for harvest RSVPs, impact, and community chat",
    start_url: `${APP_ORIGIN}/login`,
    scope: `${APP_ORIGIN}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: PWA_SPLASH_BACKGROUND,
    theme_color: PWA_SPLASH_BACKGROUND,
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile-narrow.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshots/mobile-wide.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };
}
