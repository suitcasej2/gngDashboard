import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionSubscriber } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Profile — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) redirect("/login");

  return (
    <AppShell title="Profile">
      <ProfileForm subscriber={subscriber} />
    </AppShell>
  );
}
