import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { getSessionSubscriber } from "@/lib/auth";
import { getCurrentPublishedHarvest } from "@/lib/harvest";
import { formatHarvestDateRange } from "@/lib/format";
import { getRsvpForSubscriber } from "@/lib/rsvp";
import { AppShell } from "@/components/layout/app-shell";
import { RsvpForm } from "@/components/harvest/rsvp-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "RSVP — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function HarvestRsvpPage() {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) redirect("/login");

  const harvest = await getCurrentPublishedHarvest();
  if (!harvest) {
    redirect("/harvest");
  }

  const rsvp = await getRsvpForSubscriber(harvest.id, subscriber.id);

  return (
    <AppShell title="RSVP">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <Button asChild variant="ghost" className="-ml-2 h-10 gap-2 px-2 text-muted-foreground">
          <Link href="/harvest" prefetch={false}>
            <ArrowLeft className="size-4" />
            Back to all harvests
          </Link>
        </Button>

        <Card className="rounded-2xl border-[#FFF904]/35 bg-background/70 backdrop-blur ring-1 ring-foreground/5">
          <CardHeader>
            <CardTitle>{harvest.name}</CardTitle>
            <CardDescription>
              {formatHarvestDateRange(harvest.startDate, harvest.endDate)}
              {harvest.startTime && harvest.endTime
                ? ` · ${harvest.startTime} – ${harvest.endTime}`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">
              {rsvp?.choice
                ? "Update your choice for this harvest."
                : "Let us know your plan for this harvest."}
            </p>
            <RsvpForm
              harvestId={harvest.id}
              existing={rsvp}
              bankedBoxCount={subscriber.bankedBoxCount}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
