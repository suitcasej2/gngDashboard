import { ShellFrame } from "@/components/layout/shell-frame";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellFrame>{children}</ShellFrame>;
}
