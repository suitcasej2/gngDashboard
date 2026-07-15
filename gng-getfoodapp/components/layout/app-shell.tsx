"use client";

import { BrandLogo } from "@/components/brand-logo";
import { MenuButton } from "@/components/layout/side-nav";

export function AppShell({
  children,
  title,
  wide = false,
  centeredBrandHeader = false,
  titleImage,
}: {
  children: React.ReactNode;
  title?: string;
  /** Use for chat and other full-width desktop layouts */
  wide?: boolean;
  /** Centered logo with title stacked beneath (e.g. impact page) */
  centeredBrandHeader?: boolean;
  titleImage?: string;
}) {
  return (
    <div className="min-h-dvh w-full bg-[radial-gradient(1200px_circle_at_20%_-10%,theme(colors.primary/18),transparent_45%),radial-gradient(900px_circle_at_100%_0%,theme(colors.accent/40),transparent_40%)]">
      <div
        className={
          wide
            ? "mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-8 pt-[max(env(safe-area-inset-top),1.5rem)] lg:px-8 lg:pb-10 lg:pt-8"
            : "mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-8 pt-[max(env(safe-area-inset-top),1.5rem)] lg:max-w-3xl lg:px-8 lg:pb-10 lg:pt-8"
        }
      >
        {centeredBrandHeader ? (
          <header
            className={
              titleImage
                ? "relative mb-0 shrink-0"
                : "relative mb-6 shrink-0 lg:mb-8"
            }
          >
            <div className="absolute left-0 top-0">
              <MenuButton />
            </div>
            <div className="flex flex-col items-center gap-3 px-12 pt-1">
              <BrandLogo size={80} />
              {titleImage ? (
                <img
                  src={titleImage}
                  alt={title ?? "Page title"}
                  className="relative z-10 h-auto w-[min(100%,300px)] -mb-12 lg:w-[min(100%,340px)] lg:-mb-14"
                />
              ) : (
                <h1 className="text-center font-heading text-xl leading-tight lg:text-2xl">
                  {title ?? "Get Food"}
                </h1>
              )}
            </div>
          </header>
        ) : (
          <header className="mb-5 flex shrink-0 items-center gap-3 lg:mb-8">
            <MenuButton />
            <BrandLogo size={36} className="lg:hidden" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground lg:hidden">
                Good Neighbor Gardens
              </p>
              <h1 className="truncate font-heading text-lg leading-tight lg:text-2xl">
                {title ?? "Get Food"}
              </h1>
            </div>
          </header>
        )}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
