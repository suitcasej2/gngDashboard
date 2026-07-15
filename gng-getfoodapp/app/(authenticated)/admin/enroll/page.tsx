import { redirect } from "next/navigation";

import { AdminPasskeyEnroll } from "@/components/admin/admin-passkey-enroll";
import { isAdminSubscriber } from "@/lib/admin";
import { getAdminSessionSubscriber } from "@/lib/admin-session";
import { getSessionSubscriber } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Set up Face ID — GNG Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminEnrollPage() {
  const existingAdminSession = await getAdminSessionSubscriber();
  if (existingAdminSession) {
    redirect("/admin");
  }

  const subscriber = await getSessionSubscriber();
  if (!subscriber || !isAdminSubscriber(subscriber)) {
    redirect("/login?next=/admin/enroll");
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Set up Face ID</CardTitle>
          <CardDescription>
            One-time setup for this device. After this, admin sign-in uses Face ID
            only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminPasskeyEnroll adminName={subscriber.fullName || subscriber.email} />
        </CardContent>
      </Card>
    </div>
  );
}
