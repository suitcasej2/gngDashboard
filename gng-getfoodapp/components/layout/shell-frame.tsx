"use client";

import { usePathname } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { useHarvestShell } from "@/components/layout/harvest-shell-context";
import { PageTransition } from "@/components/layout/page-transition";

type ShellConfig = {
  title: string;
  wide?: boolean;
  centeredBrandHeader?: boolean;
  titleImage?: string;
};

function getShellConfig(
  pathname: string,
  harvest: ReturnType<typeof useHarvestShell>
): ShellConfig | null {
  if (pathname === "/impact") {
    return {
      title: "Your impact",
      centeredBrandHeader: true,
      titleImage: "/impact.png",
    };
  }
  if (pathname === "/community-photos") return { title: "Community photos" };
  if (pathname === "/notifications") return { title: "Notifications" };
  if (pathname === "/profile") return { title: "Profile" };
  if (pathname === "/harvest") return { title: "All Harvests", wide: true };
  if (pathname === "/harvest/rsvp") return { title: "RSVP" };
  if (pathname === "/harvest/rsvp/confirmed") return null;

  if (harvest) {
    if (pathname.endsWith("/chat")) {
      return { title: harvest.name, wide: true };
    }
    if (pathname.endsWith("/album")) {
      return { title: `${harvest.name} album` };
    }
  }

  return null;
}

export function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const harvest = useHarvestShell();
  const shell = getShellConfig(pathname, harvest);

  if (
    pathname.startsWith("/admin") ||
    pathname === "/" ||
    pathname === "/login" ||
    !shell
  ) {
    return <PageTransition>{children}</PageTransition>;
  }

  return (
    <AppShell
      title={shell.title}
      wide={shell.wide}
      centeredBrandHeader={shell.centeredBrandHeader}
      titleImage={shell.titleImage}
    >
      <PageTransition>{children}</PageTransition>
    </AppShell>
  );
}
