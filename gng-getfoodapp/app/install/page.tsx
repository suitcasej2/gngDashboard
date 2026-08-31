import type { Metadata } from "next";

import { InstallGuide } from "@/components/pwa/install-guide";

export const metadata: Metadata = {
  title: "How to install Get Food — Good Neighbor Gardens",
  description:
    "Simple steps to put the GNG Get Food app on your iPhone or Android phone.",
};

export default function InstallGuidePage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(1100px_circle_at_15%_-5%,theme(colors.primary/14),transparent_45%),radial-gradient(800px_circle_at_100%_0%,theme(colors.accent/35),transparent_40%)]">
      <InstallGuide />
    </div>
  );
}
