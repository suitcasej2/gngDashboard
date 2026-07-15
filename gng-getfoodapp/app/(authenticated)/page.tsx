import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { getCurrentPublishedHarvest, isHarvestChatOpen } from "@/lib/harvest";
import { getRsvpForSubscriber, listRsvpsForHarvest } from "@/lib/rsvp";
import type { HarvestRsvpParticipant } from "@/types/rsvp";
import type { Harvest } from "@/types/harvest";
import type { HarvestRsvp } from "@/types/rsvp";
import { HomeScreen } from "@/components/home/home-screen";
import { AirtableErrorAlert } from "@/components/layout/airtable-error-alert";

export const metadata: Metadata = {
  title: "Home — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string | string[] }>;
}) {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) redirect("/login");

  const query = await searchParams;
  const highlightMessageId = Array.isArray(query.message)
    ? query.message[0]?.trim()
    : query.message?.trim();

  let harvest: Harvest | null = null;
  let rsvp: HarvestRsvp | null = null;
  let chatOpen = false;
  let rsvpParticipants: HarvestRsvpParticipant[] = [];
  let loadError: string | null = null;

  try {
    harvest = await getCurrentPublishedHarvest();
    if (harvest) {
      rsvp = await getRsvpForSubscriber(harvest.id, subscriber.id);
      rsvpParticipants = await listRsvpsForHarvest(harvest.id);
      chatOpen = isHarvestChatOpen(harvest);
    }
  } catch (e) {
    loadError = friendlyAirtableError(e);
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <AirtableErrorAlert
          title="Couldn't load harvest data"
          message={loadError}
        />
      </div>
    );
  }

  return (
    <HomeScreen
      subscriber={subscriber}
      harvest={harvest}
      rsvp={rsvp}
      chatOpen={chatOpen}
      rsvpParticipants={rsvpParticipants}
      highlightMessageId={highlightMessageId}
    />
  );
}
