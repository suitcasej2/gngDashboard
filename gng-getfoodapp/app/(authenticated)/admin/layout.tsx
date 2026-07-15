import { redirect } from "next/navigation";

import { getAdminSessionSubscriber } from "@/lib/admin-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSessionSubscriber();
  if (!admin) {
    redirect("/admin/login?next=/admin");
  }

  return children;
}
