import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CEO Harvest Dashboard",
    short_name: "GNG Harvest",
    description:
      "Mobile-first CEO console for draft harvests and publishing",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
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
