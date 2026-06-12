import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { getCurrentPublishedHarvest, isHarvestChatOpen } from "@/lib/harvest";
import { getRsvpForSubscriber } from "@/lib/rsvp";
import { HomeScreen } from "@/components/home/home-screen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Harvest } from "@/types/harvest";
import type { HarvestRsvp } from "@/types/rsvp";

export const metadata: Metadata = {
  title: "Home — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) redirect("/login");

  let harvest: Harvest | null = null;
  let rsvp: HarvestRsvp | null = null;
  let chatOpen = false;
  let loadError: string | null = null;

  try {
    harvest = await getCurrentPublishedHarvest();
    if (harvest) {
      rsvp = await getRsvpForSubscriber(harvest.id, subscriber.id);
      chatOpen = isHarvestChatOpen(harvest);
    }
  } catch (e) {
    loadError = friendlyAirtableError(e);
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load harvest data</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <HomeScreen
      subscriber={subscriber}
      harvest={harvest}
      rsvp={rsvp}
      chatOpen={chatOpen}
    />
  );
}
