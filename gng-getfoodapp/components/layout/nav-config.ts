import {
  Bell,
  Home,
  Images,
  LayoutDashboard,
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

export const ADMIN_NAV_ITEM: NavItem = {
  href: "/admin",
  label: "Dashboard",
  icon: LayoutDashboard,
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/harvest", label: "All Harvests", icon: Leaf },
  { href: "/community-photos", label: "Community photos", icon: Images },
  { href: "/impact", label: "Impact", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
];

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
