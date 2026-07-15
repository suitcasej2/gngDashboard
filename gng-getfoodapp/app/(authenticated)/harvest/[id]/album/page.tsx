import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HarvestAlbum } from "@/components/album/harvest-album";
import { AirtableErrorAlert } from "@/components/layout/airtable-error-alert";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { getHarvestById } from "@/lib/harvest";
import { listAlbumPhotosForHarvest } from "@/lib/harvest-album";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const harvest = await getHarvestById(id);
  return {
    title: harvest ? `${harvest.name} album` : "Harvest album",
  };
}

export default async function HarvestAlbumPage({ params }: Props) {
  const { id } = await params;
  const harvest = await getHarvestById(id);
  if (!harvest) notFound();

  const subscriber = await getSessionSubscriber();
  if (!subscriber) notFound();

  let photos: Awaited<ReturnType<typeof listAlbumPhotosForHarvest>> = [];
  let loadError: string | null = null;

  try {
    photos = await listAlbumPhotosForHarvest(id);
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

  return (
    <HarvestAlbum
      harvestId={id}
      harvestName={harvest.name}
      initialPhotos={photos}
      currentSubscriberId={subscriber.id}
    />
  );
}
