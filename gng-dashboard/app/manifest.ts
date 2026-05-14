import type { MetadataRoute } from "next";
import { PWA_SPLASH_BACKGROUND } from "@/lib/pwa-splash";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CEO Harvest Dashboard",
    short_name: "GNG Harvest",
    description:
      "Mobile-first CEO console for draft harvests and publishing",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: PWA_SPLASH_BACKGROUND,
    theme_color: "#56BB55",
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
