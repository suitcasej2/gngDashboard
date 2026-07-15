import Airtable from "airtable";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function getAirtableBase() {
  const apiKey = requiredEnv("AIRTABLE_API_KEY");
  const baseId = requiredEnv("AIRTABLE_BASE_ID");

  const airtable = new Airtable({ apiKey });
  return airtable.base(baseId);
}

export function getHarvestsTableName() {
  return process.env.AIRTABLE_HARVESTS_TABLE_NAME || "Harvests";
}

export function getHarvestRsvpsTableName() {
  return process.env.AIRTABLE_HARVEST_RSVPS_TABLE_NAME || "Harvest RSVPs";
}

export function getHarvestMessagesTableName() {
  return process.env.AIRTABLE_HARVEST_MESSAGES_TABLE_NAME || "Harvest Messages";
}

export function getMessageHarvestLinkField() {
  return process.env.AIRTABLE_MESSAGE_HARVEST_LINK_FIELD || "Harvest";
}

export function getMessageBodyField() {
  return process.env.AIRTABLE_MESSAGE_BODY_FIELD || "Message";
}

export function getHarvestNameField() {
  // Must match the Airtable field name *as the API sees it* (UI can hide a leading BOM).
  return process.env.AIRTABLE_HARVEST_NAME_FIELD || "Harvest Name";
}

export function getHarvestAlbumTableName() {
  return process.env.AIRTABLE_HARVEST_ALBUM_TABLE_NAME || "Harvest Album Photos";
}

export function getAlbumHarvestLinkField() {
  return process.env.AIRTABLE_ALBUM_HARVEST_LINK_FIELD || "Harvest";
}

export function getAlbumSubscriberLinkField(): string | null {
  const raw = process.env.AIRTABLE_ALBUM_SUBSCRIBER_LINK_FIELD;
  if (raw === "false" || raw === "none") return null;
  if (raw === "") return null;
  return raw ?? "Full Name";
}

export function getAlbumImageUrlField() {
  return process.env.AIRTABLE_ALBUM_IMAGE_URL_FIELD || "Image URL";
}

export function getAlbumCaptionField() {
  return process.env.AIRTABLE_ALBUM_CAPTION_FIELD || "Caption";
}

export function getAlbumAuthorLookupField() {
  return (
    process.env.AIRTABLE_ALBUM_AUTHOR_LOOKUP_FIELD ||
    "Full Name (from Full Name)"
  );
}

