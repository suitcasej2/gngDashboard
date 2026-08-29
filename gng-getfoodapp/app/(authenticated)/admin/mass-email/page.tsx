import type { Metadata } from "next";
import Link from "next/link";

import { MassEmailPanel } from "@/components/admin/mass-email-panel";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mass Email — GNG",
  description: "Compose and queue a mass email for neighbors",
};

export default function AdminMassEmailPage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_circle_at_20%_-10%,theme(colors.primary/15),transparent_40%),radial-gradient(900px_circle_at_100%_0%,theme(colors.accent/35),transparent_35%)]">
      <div className="mx-auto max-w-xl px-4 pb-10 pt-6">
        <header className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            Admin Harvest Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Mass email</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the fields — we format it in the Get Food email design and
            queue it to Airtable for Zapier.
          </p>
          <div className="pt-1">
            <Button asChild variant="secondary" className="h-11 w-full sm:w-auto">
              <Link href="/admin">Back to dashboard</Link>
            </Button>
          </div>
        </header>

        <div className="mt-6">
          <MassEmailPanel />
        </div>
      </div>
    </div>
  );
}
