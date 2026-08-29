import Image from "next/image";
import type { Metadata } from "next";

import { AdminPasskeySetup } from "@/components/admin/admin-passkey-setup";
import { BrandLogo } from "@/components/brand-logo";
import { isAdminSubscriber } from "@/lib/admin";
import { getAdminSessionSubscriber } from "@/lib/admin-session";
import { getSessionSubscriber } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Set up admin passkey — GNG",
};

export const dynamic = "force-dynamic";

export default async function AdminEnrollPage() {
  const existingAdminSession = await getAdminSessionSubscriber();
  if (existingAdminSession) {
    redirect("/admin");
  }

  const subscriber = await getSessionSubscriber();
  const canEnroll = subscriber ? isAdminSubscriber(subscriber) : false;

  return (
    <div className="min-h-dvh w-full bg-[radial-gradient(1200px_circle_at_20%_-10%,theme(colors.primary/18),transparent_45%),radial-gradient(900px_circle_at_100%_0%,theme(colors.accent/40),transparent_40%)] px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo size={72} />
          <div>
            <h1 className="font-heading text-2xl">Set up admin passkey</h1>
            <p className="text-sm text-muted-foreground">
              One-time setup for this browser. No phone required.
            </p>
          </div>
        </div>

        <Card className="rounded-2xl border-[#FFF904]/35 bg-background/70 backdrop-blur ring-1 ring-foreground/5">
          <CardHeader>
            <CardTitle>Email, then passkey</CardTitle>
            <CardDescription>
              Works with Touch ID, Windows Hello, Face ID, or a security key.
              In Brave, turn Shields off for this site if the prompt never
              appears.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminPasskeySetup
              initialName={canEnroll ? subscriber?.fullName : null}
              initialEmail={canEnroll ? subscriber?.email : null}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center opacity-80">
          <Image src="/GNG.svg" alt="" width={120} height={60} />
        </div>
      </div>
    </div>
  );
}
