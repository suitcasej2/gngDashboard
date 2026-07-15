import {
  getAirtableBase,
  getAlbumAuthorLookupField,
  getAlbumCaptionField,
  getAlbumHarvestLinkField,
  getAlbumImageUrlField,
  getAlbumSubscriberLinkField,
  getHarvestAlbumTableName,
} from "@/lib/airtable";
import type { HarvestAlbumPhoto } from "@/types/album-photo";

function getField(fields: Record<string, unknown>, name: string) {
  for (const [key, value] of Object.entries(fields)) {
    if (key.replace(/^\uFEFF+/, "").trim() === name) return value;
  }
  return undefined;
}

function getStringField(fields: Record<string, unknown>, name: string) {
  const value = getField(fields, name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getLongTextField(fields: Record<string, unknown>, name: string) {
  const value = getField(fields, name);
  return typeof value === "string" ? value : null;
}

function getLinkedRecordIds(fields: Record<string, unknown>, name: string) {
  const value = getField(fields, name);
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

function getLookupStringField(fields: Record<string, unknown>, name: string) {
  const value = getField(fields, name);
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string" && item.trim());
    if (typeof first === "string") return first.trim();
  }
  return null;
}

function mapAlbumPhotoRecord(input: {
  id: string;
  fields: Record<string, unknown>;
  createdTime?: string;
}): HarvestAlbumPhoto | null {
  const f = input.fields;
  const imageUrl = getStringField(f, getAlbumImageUrlField());
  if (!imageUrl) return null;

  const subscriberLink = getAlbumSubscriberLinkField();
  const subscriberId = subscriberLink
    ? getLinkedRecordIds(f, subscriberLink)[0] ?? ""
    : "";

  return {
    id: input.id,
    harvestId: getLinkedRecordIds(f, getAlbumHarvestLinkField())[0] ?? "",
    subscriberId,
    authorName:
      getLookupStringField(f, getAlbumAuthorLookupField()) ?? "Neighbor",
    imageUrl,
    caption: getLongTextField(f, getAlbumCaptionField()),
    createdAt: input.createdTime ?? new Date().toISOString(),
  };
}

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

export async function deleteAlbumPhoto(photoId: string): Promise<void> {
  const base = getAirtableBase();
  const tableName = getHarvestAlbumTableName();
  await base(tableName).destroy(photoId);
}
