import type { Metadata } from "next";
import { getSessionSubscriber } from "@/lib/auth";
import { getCurrentPublishedHarvest, listVisibleHarvests } from "@/lib/harvest";
import { getRsvpForSubscriber } from "@/lib/rsvp";
import { AppShell } from "@/components/layout/app-shell";
import { HarvestCard } from "@/components/harvest/harvest-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "All Harvests — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function HarvestPage() {
  const subscriber = await getSessionSubscriber();
  const current = await getCurrentPublishedHarvest();
  const past = (await listVisibleHarvests()).filter((h) => h.status === "Completed");
  const rsvp =
    current && subscriber
      ? await getRsvpForSubscriber(current.id, subscriber.id)
      : null;

  return (
    <AppShell title="All Harvests" wide>
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
    </AppShell>
  );
}
