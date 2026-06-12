import type { FieldSet } from "airtable";
import {
  getAirtableBase,
  getHarvestRsvpsTableName,
  getRsvpHarvestLinkField,
} from "@/lib/airtable";
import { getLinkedRecordIds } from "@/lib/airtable-fields";
import { mapRsvpRecord } from "@/lib/airtable-mappers";
import { toAirtableRsvpChoice } from "@/lib/rsvp-choices";
import type { HarvestRsvp, SubmitRsvpInput } from "@/types/rsvp";

export async function getRsvpForSubscriber(
  harvestId: string,
  subscriberId: string
): Promise<HarvestRsvp | null> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();
  const harvestLink = getRsvpHarvestLinkField();

  const records = await base(tableName)
    .select({
      sort: [{ field: "RSVP Timestamp", direction: "desc" }],
    })
    .all();

  const record = records.find((row) => {
    const fields = (row.fields || {}) as Record<string, unknown>;
    const harvestIds = getLinkedRecordIds(fields, harvestLink);
    const subscriberIds = getLinkedRecordIds(fields, "Subscriber");
    return (
      harvestIds.includes(harvestId) && subscriberIds.includes(subscriberId)
    );
  });

  if (!record) return null;

  return mapRsvpRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
  });
}

export async function upsertRsvp(
  subscriberId: string,
  input: SubmitRsvpInput
): Promise<HarvestRsvp> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();
  const harvestLink = getRsvpHarvestLinkField();

  const fields: FieldSet = {
    [harvestLink]: [input.harvestId],
    Subscriber: [subscriberId],
    "RSVP Choice": toAirtableRsvpChoice(input.choice),
    "Needs Delivery?": input.needsDelivery ?? false,
  };

  if (input.shippingAddress) {
    fields["Shipping Address"] = input.shippingAddress;
  }
  if (input.giftRecipientName) {
    fields["Gift Recipient Name"] = input.giftRecipientName;
  }

  const existing = await getRsvpForSubscriber(input.harvestId, subscriberId);

  const record = existing
    ? await base(tableName).update(existing.id, fields)
    : await base(tableName).create(fields);

  return mapRsvpRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
  });
}
