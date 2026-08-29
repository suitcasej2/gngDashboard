import type { MetadataRoute } from "next";
import { PWA_SPLASH_BACKGROUND } from "@/lib/pwa-splash";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Relative URLs — absolute origins break WebAPK minting on some Chrome builds
    // when the browsing origin doesn't match exactly.
    id: "/",
    name: "GNG Get Food",
    short_name: "Get Food",
    description: "Subscriber portal for harvest RSVPs, impact, and community chat",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    background_color: PWA_SPLASH_BACKGROUND,
    theme_color: PWA_SPLASH_BACKGROUND,
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
  };
}
