import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Images } from "lucide-react";

import { HarvestAlbum } from "@/components/album/harvest-album";
import { AirtableErrorAlert } from "@/components/layout/airtable-error-alert";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { formatHarvestDateRange } from "@/lib/format";
import { getLatestCompletedHarvest } from "@/lib/harvest";
import { listAlbumPhotosForHarvest } from "@/lib/harvest-album";

export const metadata: Metadata = {
  title: "Community photos — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function CommunityPhotosPage() {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) redirect("/login");

  let harvest = null;
  let photos: Awaited<ReturnType<typeof listAlbumPhotosForHarvest>> = [];
  let loadError: string | null = null;

  try {
    harvest = await getLatestCompletedHarvest();
    if (harvest) {
      photos = await listAlbumPhotosForHarvest(harvest.id);
    }
  } catch (e) {
    loadError = friendlyAirtableError(e);
  }

  if (loadError) {
    return (
      <AirtableErrorAlert
        title="Couldn't load community photos"
        message={loadError}
      />
    );
  }

  if (!harvest) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-muted/20 px-6 py-14 text-center">
        <Images className="size-9 text-muted-foreground" />
        <div className="max-w-sm space-y-2">
          <p className="font-heading text-lg">Community photos</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            After each harvest wraps up, this is where neighbors share box
            pickups, garden visits, and what they made with their share.
          </p>
          <p className="text-sm text-muted-foreground">
            The current harvest is still underway — check back once it&apos;s
            complete.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="font-heading text-base">{harvest.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatHarvestDateRange(harvest.startDate, harvest.endDate)}
        </p>
      </div>
      <HarvestAlbum
        harvestId={harvest.id}
        harvestName={harvest.name}
        initialPhotos={photos}
        currentSubscriberId={subscriber.id}
      />
    </div>
  );
}
