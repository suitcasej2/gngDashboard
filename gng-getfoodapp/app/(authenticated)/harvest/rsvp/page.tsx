import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RsvpForm } from "@/components/harvest/rsvp-form";
import { AirtableErrorAlert } from "@/components/layout/airtable-error-alert";
import { NavLink } from "@/components/layout/nav-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { formatHarvestDateRange } from "@/lib/format";
import { getCurrentPublishedHarvest } from "@/lib/harvest";
import { getRsvpForSubscriber } from "@/lib/rsvp";
import type { Harvest } from "@/types/harvest";
import type { HarvestRsvp } from "@/types/rsvp";

export const metadata: Metadata = {
  title: "RSVP — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function HarvestRsvpPage() {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) redirect("/login");

  let harvest: Harvest | null = null;
  let rsvp: HarvestRsvp | null = null;
  let loadError: string | null = null;

  try {
    harvest = await getCurrentPublishedHarvest();
    if (harvest) {
      rsvp = await getRsvpForSubscriber(harvest.id, subscriber.id);
    }
  } catch (e) {
    loadError = friendlyAirtableError(e);
  }

  if (loadError) {
    return (
      <AirtableErrorAlert title="Couldn't load RSVP" message={loadError} />
    );
  }

  if (!harvest) {
    redirect("/harvest");
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <Button asChild variant="ghost" className="-ml-2 h-10 gap-2 px-2 text-muted-foreground">
        <NavLink href="/harvest">
            <ArrowLeft className="size-4" />
            Back to all harvests
          </NavLink>
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
  );
}
