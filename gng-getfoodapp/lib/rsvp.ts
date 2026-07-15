import type { FieldSet } from "airtable";
import {
  getAirtableBase,
  getHarvestRsvpsTableName,
  getRsvpHarvestLinkField,
  getRsvpSubscriberLinkField,
  getRsvpSubscriberNameLookupField,
} from "@/lib/airtable";
import {
  getFirstLinkedRecordId,
  getLinkedRecordIds,
  getLookupStringField,
} from "@/lib/airtable-fields";
import { mapRsvpRecord } from "@/lib/airtable-mappers";
import { subscriberHasRsvp, toAirtableRsvpChoice } from "@/lib/rsvp-choices";
import { getSubscriberAvatarsByIds } from "@/lib/subscriber";
import type {
  HarvestRsvp,
  HarvestRsvpParticipant,
  SubmitRsvpInput,
} from "@/types/rsvp";

export async function getRsvpForSubscriber(
  harvestId: string,
  subscriberId: string
): Promise<HarvestRsvp | null> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();
  const harvestLink = getRsvpHarvestLinkField();
  const subscriberLink = getRsvpSubscriberLinkField();

  const records = await base(tableName)
    .select({
      sort: [{ field: "RSVP Timestamp", direction: "desc" }],
    })
    .all();

  const record = records.find((row) => {
    const fields = (row.fields || {}) as Record<string, unknown>;
    const harvestIds = getLinkedRecordIds(fields, harvestLink);
    const subscriberIds = getLinkedRecordIds(fields, subscriberLink);
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

export async function listRsvpsForHarvest(
  harvestId: string
): Promise<HarvestRsvpParticipant[]> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();
  const harvestLink = getRsvpHarvestLinkField();
  const subscriberLink = getRsvpSubscriberLinkField();
  const nameLookup = getRsvpSubscriberNameLookupField();

  const records = await base(tableName)
    .select({
      sort: [{ field: "RSVP Timestamp", direction: "desc" }],
    })
    .all();

  const participants: HarvestRsvpParticipant[] = [];

  for (const row of records) {
    const fields = (row.fields || {}) as Record<string, unknown>;
    const harvestIds = getLinkedRecordIds(fields, harvestLink);
    if (!harvestIds.includes(harvestId)) continue;

    const rsvp = mapRsvpRecord({ id: row.id, fields });
    if (!subscriberHasRsvp(rsvp) || !rsvp.choice) continue;

    const subscriberId =
      rsvp.subscriberId ||
      getFirstLinkedRecordId(fields, subscriberLink) ||
      "";

    participants.push({
      id: row.id,
      subscriberId,
      fullName:
        getLookupStringField(fields, nameLookup) ??
        getLookupStringField(fields, "Full Name (from Subscriber)") ??
        "Neighbor",
      choice: rsvp.choice,
      avatarUrl: null,
    });
  }

  const avatars = await getSubscriberAvatarsByIds(
    participants.map((p) => p.subscriberId).filter(Boolean)
  );

  return participants.map((p) => ({
    ...p,
    avatarUrl: p.subscriberId ? (avatars[p.subscriberId] ?? null) : null,
  }));
}

export async function upsertRsvp(
  subscriberId: string,
  input: SubmitRsvpInput
): Promise<HarvestRsvp> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();
  const harvestLink = getRsvpHarvestLinkField();
  const subscriberLink = getRsvpSubscriberLinkField();

  const fields: FieldSet = {
    [harvestLink]: [input.harvestId],
    [subscriberLink]: [subscriberId],
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

/** Subscriber IDs that already have a real RSVP choice for this harvest. */
export async function listRsvpdSubscriberIdsForHarvest(
  harvestId: string
): Promise<Set<string>> {
  const participants = await listRsvpsForHarvest(harvestId);
  return new Set(
    participants.map((p) => p.subscriberId).filter(Boolean)
  );
}

/**
 * Creates Donate RSVPs for non-responders (Notes = "Auto-Donate").
 * Skips anyone who already has a real choice. Batches Airtable creates.
 */
export async function createAutoDonateRsvps(
  harvestId: string,
  subscriberIds: string[]
): Promise<string[]> {
  const unique = [...new Set(subscriberIds.filter(Boolean))];
  if (unique.length === 0) return [];

  const alreadyRsvpd = await listRsvpdSubscriberIdsForHarvest(harvestId);
  const toCreate = unique.filter((id) => !alreadyRsvpd.has(id));
  if (toCreate.length === 0) return [];

  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();
  const harvestLink = getRsvpHarvestLinkField();
  const subscriberLink = getRsvpSubscriberLinkField();

  const created: string[] = [];
  const BATCH = 10;

  for (let i = 0; i < toCreate.length; i += BATCH) {
    const chunk = toCreate.slice(i, i + BATCH);
    const records = await base(tableName).create(
      chunk.map((subscriberId) => ({
        fields: {
          [harvestLink]: [harvestId],
          [subscriberLink]: [subscriberId],
          "RSVP Choice": toAirtableRsvpChoice("donate"),
          "Needs Delivery?": false,
          Notes: "Auto-Donate",
        } as FieldSet,
      }))
    );

    for (let j = 0; j < records.length; j++) {
      created.push(chunk[j]!);
    }
  }

  return created;
}
