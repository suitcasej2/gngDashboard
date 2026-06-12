import {
  Home,
  Leaf,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/harvest", label: "All Harvests", icon: Leaf },
  { href: "/impact", label: "Impact", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
];

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
