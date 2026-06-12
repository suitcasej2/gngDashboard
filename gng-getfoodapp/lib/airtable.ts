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

export function getSubscriberAvatarField() {
  return process.env.AIRTABLE_SUBSCRIBER_AVATAR_FIELD || "Profile Avatar URL";
}
