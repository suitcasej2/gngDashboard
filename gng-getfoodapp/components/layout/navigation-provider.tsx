"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type NavigationContextValue = {
  isNavigating: boolean;
  startNavigation: () => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return ctx;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] overflow-hidden"
      >
        <div
          className={cn(
            "h-full w-full origin-left bg-[var(--brand-green)] transition-transform duration-200 ease-out motion-reduce:transition-none",
            isNavigating ? "scale-x-100" : "scale-x-0"
          )}
        />
      </div>
      {children}
    </NavigationContext.Provider>
  );
}
