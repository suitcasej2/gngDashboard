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

export function getSubscribersTableName() {
  return process.env.AIRTABLE_SUBSCRIBERS_TABLE_NAME || "Subscribers";
}

export function getHarvestMessagesTableName() {
  return process.env.AIRTABLE_HARVEST_MESSAGES_TABLE_NAME || "Harvest Messages";
}

export function getHarvestNameField() {
  return process.env.AIRTABLE_HARVEST_NAME_FIELD || "Harvest Name";
}

/** Link field on Harvest RSVPs → Harvests table */
export function getRsvpHarvestLinkField() {
  return process.env.AIRTABLE_RSVP_HARVEST_LINK_FIELD || "Harvests";
}

/** Link field on Harvest RSVPs → Subscribers table */
export function getRsvpSubscriberLinkField() {
  return process.env.AIRTABLE_RSVP_SUBSCRIBER_LINK_FIELD || "Subscriber";
}

/** Lookup on Harvest RSVPs → subscriber display name */
export function getRsvpSubscriberNameLookupField() {
  return (
    process.env.AIRTABLE_RSVP_SUBSCRIBER_NAME_LOOKUP_FIELD ||
    "Full Name (from Subscriber)"
  );
}

/** Link field on Harvest Messages → Harvests table */
export function getMessageHarvestLinkField() {
  return process.env.AIRTABLE_MESSAGE_HARVEST_LINK_FIELD || "Harvest";
}

/** Created-time field on Harvest Messages (for sorting) */
export function getMessageCreatedField() {
  return process.env.AIRTABLE_MESSAGE_CREATED_FIELD || "Timestamp";
}

export function getMessageSubscriberLinkField() {
  return process.env.AIRTABLE_MESSAGE_SUBSCRIBER_LINK_FIELD || "Subscriber";
}

export function getMessageBodyField() {
  return process.env.AIRTABLE_MESSAGE_BODY_FIELD || "Message";
}

/** Lookup on Harvest Messages → subscriber full name */
export function getMessageAuthorLookupField() {
  return (
    process.env.AIRTABLE_MESSAGE_AUTHOR_LOOKUP_FIELD ||
    "Full Name (from Subscriber)"
  );
}

/** Lookup on Harvest Messages → subscriber email */
export function getMessageEmailLookupField() {
  return (
    process.env.AIRTABLE_MESSAGE_EMAIL_LOOKUP_FIELD ||
    "Email (from Subscriber)"
  );
}

export function getSubscriberAvatarField() {
  return process.env.AIRTABLE_SUBSCRIBER_AVATAR_FIELD || "Profile Avatar URL";
}

/** Optional number field for boxes from before this Airtable base / portal. */
export function getSubscriberLifetimeBoxesField(): string | null {
  const raw = process.env.AIRTABLE_SUBSCRIBER_LIFETIME_BOXES_FIELD;
  if (raw === "false" || raw === "none" || raw === "") return null;
  return raw ?? "Lifetime Boxes";
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
  // Airtable link field on this base is named "Full Name"
  return raw ?? "Full Name";
}

export function isAlbumSubscriberTrackingEnabled() {
  return getAlbumSubscriberLinkField() !== null;
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

/** Outbox table for admin → Zapier mass emails */
export function getMassEmailsTableName() {
  return process.env.AIRTABLE_MASS_EMAILS_TABLE_NAME || "Mass Emails";
}

export function getMassEmailSubjectField() {
  return process.env.AIRTABLE_MASS_EMAIL_SUBJECT_FIELD || "Subject";
}

export function getMassEmailBodyHtmlField() {
  return process.env.AIRTABLE_MASS_EMAIL_BODY_HTML_FIELD || "Body HTML";
}

export function getMassEmailStatusField() {
  return process.env.AIRTABLE_MASS_EMAIL_STATUS_FIELD || "Status";
}

export function getMassEmailCreatedByField() {
  return process.env.AIRTABLE_MASS_EMAIL_CREATED_BY_FIELD || "Created By";
}

export function getMassEmailNotesField() {
  return process.env.AIRTABLE_MASS_EMAIL_NOTES_FIELD || "Notes";
}

