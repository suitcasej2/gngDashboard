import type { MetadataRoute } from "next";
import { PWA_SPLASH_BACKGROUND } from "@/lib/pwa-splash";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GNG Get Food",
    short_name: "Get Food",
    description: "Subscriber portal for harvest RSVPs, impact, and community chat",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: PWA_SPLASH_BACKGROUND,
    theme_color: PWA_SPLASH_BACKGROUND,
    icons: [
      {
        src: "/AppIcon.png",
        type: "image/png",
        sizes: "540x540",
        purpose: "any",
      },
    ],
  };
}
