"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { logoutAction } from "@/app/actions/auth";
import { isNavActive, NAV_ITEMS } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

type SideNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SideNavContext = createContext<SideNavContextValue | null>(null);

export function useSideNav() {
  const ctx = useContext(SideNavContext);
  if (!ctx) throw new Error("useSideNav must be used within SideNavProvider");
  return ctx;
}

function NavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-1", className)}>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton({
  onSignOut,
  disabled,
}: {
  onSignOut: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      <ArrowLeft className="size-5" />
      {disabled ? "Signing out…" : "Sign out"}
    </button>
  );
}

function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/80 bg-background/95 backdrop-blur lg:flex">
      <div className="flex items-center gap-3 border-b px-5 py-5">
        <BrandLogo size={36} />
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">Good Neighbor Gardens</p>
          <p className="font-heading text-lg leading-tight">Get Food</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 py-4">
        <NavLinks pathname={pathname} className="flex-1" />
        <div className="border-t pt-3">
          <SignOutButton onSignOut={handleLogout} disabled={isPending} />
        </div>
      </div>
    </aside>
  );
}

function MobileSideNavDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      onOpenChange(false);
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,82vw)] flex-col bg-background shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <div>
            <p className="text-xs text-muted-foreground">Good Neighbor Gardens</p>
            <p className="font-heading text-lg">Get Food</p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col px-3 py-4">
          <NavLinks
            pathname={pathname}
            onNavigate={() => onOpenChange(false)}
            className="flex-1"
          />
          <div className="border-t pt-3">
            <SignOutButton onSignOut={handleLogout} disabled={isPending} />
          </div>
        </div>
      </aside>
    </>
  );
}

function AppLayoutFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh w-full">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export function SideNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const isLogin = pathname === "/login";

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (isLogin) return;
      const touch = e.touches[0];
      if (touch.clientX <= 28) {
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }
    },
    [isLogin]
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = Math.abs(touch.clientY - touchStart.current.y);
    if (dx > 56 && dy < 48) {
      setOpen(true);
      touchStart.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStart.current = null;
  }, []);

  useEffect(() => {
    if (isLogin) return;
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchEnd, handleTouchMove, handleTouchStart, isLogin]);

  useEffect(() => {
    if (isLogin) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      document.body.style.overflow = open ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isLogin]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <SideNavContext.Provider value={{ open, setOpen }}>
      <AppLayoutFrame>{children}</AppLayoutFrame>
      {!isLogin && <MobileSideNavDrawer open={open} onOpenChange={setOpen} />}
    </SideNavContext.Provider>
  );
}

export function MenuButton({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "overlay";
}) {
  const { setOpen } = useSideNav();

  return (
    <button
      type="button"
      aria-label="Open menu"
      onClick={() => setOpen(true)}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full transition-colors lg:hidden",
        variant === "overlay"
          ? "bg-black/20 text-white backdrop-blur-sm hover:bg-black/30"
          : "bg-muted text-foreground hover:bg-muted/80",
        className
      )}
    >
      <Menu className="size-5" />
    </button>
  );
}
