"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

import { useNavigation } from "@/components/layout/navigation-provider";
import { cn } from "@/lib/utils";

type NavLinkProps = ComponentProps<typeof Link> & {
  isActive?: boolean;
};

export function NavLink({
  className,
  isActive,
  onClick,
  prefetch = true,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const { startNavigation } = useNavigation();

  const active =
    isActive ??
    (typeof props.href === "string"
      ? props.href === "/"
        ? pathname === "/"
        : pathname === props.href || pathname.startsWith(`${props.href}/`)
      : false);

  return (
    <Link
      {...props}
      prefetch={prefetch}
      className={cn(className, active && "pointer-events-none")}
      onClick={(event) => {
        if (!active) startNavigation();
        onClick?.(event);
      }}
    />
  );
}
