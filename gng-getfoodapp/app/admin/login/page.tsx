import { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";

import { AdminPasskeyLogin } from "@/components/admin/admin-passkey-login";
import { BrandLogo } from "@/components/brand-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin sign in — GNG",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-dvh w-full bg-[radial-gradient(1200px_circle_at_20%_-10%,theme(colors.primary/18),transparent_45%),radial-gradient(900px_circle_at_100%_0%,theme(colors.accent/40),transparent_40%)] px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo size={72} />
          <div>
            <h1 className="font-heading text-2xl">Admin dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Harvest publishing and CEO messages
            </p>
          </div>
        </div>

        <Card className="rounded-2xl border-[#FFF904]/35 bg-background/70 backdrop-blur ring-1 ring-foreground/5">
          <CardHeader>
            <CardTitle>Sign in with Face ID</CardTitle>
            <CardDescription>
              Admin access requires your passkey. Use the device where you set up
              Face ID or Touch ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
              <AdminPasskeyLogin />
            </Suspense>
          </CardContent>
        </Card>

        <div className="flex justify-center opacity-80">
          <Image src="/GNG.svg" alt="" width={120} height={60} />
        </div>
      </div>
    </div>
  );
}
