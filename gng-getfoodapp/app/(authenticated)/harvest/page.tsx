import type { Metadata } from "next";

import { HarvestCard } from "@/components/harvest/harvest-card";
import { AirtableErrorAlert } from "@/components/layout/airtable-error-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { getCurrentPublishedHarvest, listVisibleHarvests } from "@/lib/harvest";
import { getRsvpForSubscriber } from "@/lib/rsvp";
import type { Harvest } from "@/types/harvest";
import type { HarvestRsvp } from "@/types/rsvp";

export const metadata: Metadata = {
  title: "All Harvests — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function HarvestPage() {
  const subscriber = await getSessionSubscriber();

  let current: Harvest | null = null;
  let past: Harvest[] = [];
  let rsvp: HarvestRsvp | null = null;
  let loadError: string | null = null;

  try {
    current = await getCurrentPublishedHarvest();
    past = (await listVisibleHarvests()).filter((h) => h.status === "Completed");
    if (current && subscriber) {
      rsvp = await getRsvpForSubscriber(current.id, subscriber.id);
    }
  } catch (e) {
    loadError = friendlyAirtableError(e);
  }

  if (loadError) {
    return (
      <AirtableErrorAlert
        title="Couldn't load harvests"
        message={loadError}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 lg:max-w-xl">
        {current ? (
          <HarvestCard harvest={current} showChatLink rsvp={rsvp} />
        ) : (
          <Alert>
            <AlertTitle>No active harvest</AlertTitle>
            <AlertDescription>
              There is no published harvest right now. Past harvests are listed below.
            </AlertDescription>
          </Alert>
        )}

        {past.length > 0 && (
          <div className="space-y-5">
            <h2 className="font-heading text-base text-muted-foreground">
              Past harvests
            </h2>
            {past.map((harvest) => (
              <HarvestCard key={harvest.id} harvest={harvest} showChatLink />
            ))}
          </div>
        )}
    </div>
  );
}
