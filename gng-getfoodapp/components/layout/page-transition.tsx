"use client";

import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-in fade-in duration-150 fill-mode-both motion-reduce:animate-none"
    >
      {children}
    </div>
  );
}
