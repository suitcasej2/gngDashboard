import {
  getAirtableBase,
  getAlbumCaptionField,
  getAlbumHarvestLinkField,
  getAlbumImageUrlField,
  getAlbumSubscriberLinkField,
  getHarvestAlbumTableName,
  isAlbumSubscriberTrackingEnabled,
} from "@/lib/airtable";
import { getLinkedRecordIds } from "@/lib/airtable-fields";
import { mapAlbumPhotoRecord } from "@/lib/airtable-mappers";
import type { HarvestAlbumPhoto } from "@/types/album-photo";

/**
 * Airtable table: "Harvest Album Photos"
 * - Harvest (link → Harvests)
 * - Full Name (link → Harvest Box Subscribers)
 * - Full Name (from Full Name) (lookup — author display name)
 * - Subscriber ID (from Full Name) / Email (from Full Name) (lookups, optional)
 */
export const MAX_ALBUM_PHOTOS_PER_SUBSCRIBER = 10;

export async function listAlbumPhotosForHarvest(
  harvestId: string
): Promise<HarvestAlbumPhoto[]> {
  const base = getAirtableBase();
  const tableName = getHarvestAlbumTableName();
  const harvestLink = getAlbumHarvestLinkField();

  const records = await base(tableName).select().all();

  return records
    .filter((record) => {
      const harvestIds = getLinkedRecordIds(
        (record.fields || {}) as Record<string, unknown>,
        harvestLink
      );
      return harvestIds.includes(harvestId);
    })
    .map((record) =>
      mapAlbumPhotoRecord({
        id: record.id,
        fields: (record.fields || {}) as Record<string, unknown>,
        createdTime: record._rawJson.createdTime,
      })
    )
    .filter((photo): photo is HarvestAlbumPhoto => photo !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function countAlbumPhotosForSubscriber(
  harvestId: string,
  subscriberId: string
): Promise<number> {
  if (!isAlbumSubscriberTrackingEnabled()) return 0;

  const photos = await listAlbumPhotosForHarvest(harvestId);
  return photos.filter((photo) => photo.subscriberId === subscriberId).length;
}

export async function createAlbumPhoto(input: {
  harvestId: string;
  subscriberId: string;
  imageUrl: string;
  caption?: string;
}): Promise<HarvestAlbumPhoto> {
  const base = getAirtableBase();
  const tableName = getHarvestAlbumTableName();
  const harvestLink = getAlbumHarvestLinkField();
  const subscriberLink = getAlbumSubscriberLinkField();
  const imageUrlField = getAlbumImageUrlField();
  const captionField = getAlbumCaptionField();

  const fields: Record<string, unknown> = {
    [imageUrlField]: input.imageUrl,
    [harvestLink]: [input.harvestId],
  };

  if (subscriberLink) {
    fields[subscriberLink] = [input.subscriberId];
  }

  const caption = input.caption?.trim();
  if (caption) {
    fields[captionField] = caption;
  }

  const record = await base(tableName).create(
    fields as Record<string, string | string[]>
  );

  const photo = mapAlbumPhotoRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
    createdTime: record._rawJson.createdTime,
  });

  if (!photo) {
    throw new Error("Could not save photo to the album.");
  }

  return photo;
}

export async function deleteAlbumPhoto(photoId: string): Promise<void> {
  const base = getAirtableBase();
  const tableName = getHarvestAlbumTableName();
  await base(tableName).destroy(photoId);
}
