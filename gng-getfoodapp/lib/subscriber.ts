import {
  getAirtableBase,
  getSubscriberAvatarField,
  getSubscribersTableName,
} from "@/lib/airtable";
import { escapeAirtableString, getStringField } from "@/lib/airtable-fields";
import { mapSubscriberRecord } from "@/lib/airtable-mappers";
import type { Subscriber } from "@/types/subscriber";

export function isActiveSubscriber(subscriber: Subscriber): boolean {
  return subscriber.subscriptionStatus === "Active";
}

export async function listActiveSubscribers(): Promise<Subscriber[]> {
  const base = getAirtableBase();
  const tableName = getSubscribersTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: `{Subscription Status} = 'Active'`,
    })
    .all();

  return records.map((record) =>
    mapSubscriberRecord({
      id: record.id,
      fields: (record.fields || {}) as Record<string, unknown>,
    })
  );
}

export async function findSubscriberByEmail(
  email: string
): Promise<Subscriber | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const base = getAirtableBase();
  const tableName = getSubscribersTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: `LOWER({Email}) = '${escapeAirtableString(normalized)}'`,
      maxRecords: 1,
    })
    .firstPage();

  const record = records[0];
  if (!record) return null;

  return mapSubscriberRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
  });
}

export async function getSubscriberAvatarsByIds(
  ids: string[]
): Promise<Record<string, string | null>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const result = Object.fromEntries(unique.map((id) => [id, null])) as Record<
    string,
    string | null
  >;
  if (unique.length === 0) return result;

  const base = getAirtableBase();
  const tableName = getSubscribersTableName();
  const avatarField = getSubscriberAvatarField();
  const formula = `OR(${unique
    .map((id) => `RECORD_ID() = '${escapeAirtableString(id)}'`)
    .join(",")})`;

  const records = await base(tableName)
    .select({ filterByFormula: formula })
    .all();

  for (const record of records) {
    const fields = (record.fields || {}) as Record<string, unknown>;
    result[record.id] = getStringField(fields, avatarField);
  }

  return result;
}

export async function getSubscriberById(id: string): Promise<Subscriber | null> {
  try {
    const base = getAirtableBase();
    const tableName = getSubscribersTableName();
    const record = await base(tableName).find(id);
    return mapSubscriberRecord({
      id: record.id,
      fields: (record.fields || {}) as Record<string, unknown>,
    });
  } catch {
    return null;
  }
}

export async function updateSubscriberProfile(
  subscriberId: string,
  updates: Pick<Subscriber, "phone" | "address" | "deliveryPreference">
): Promise<Subscriber | null> {
  const base = getAirtableBase();
  const tableName = getSubscribersTableName();

  const record = await base(tableName).update(subscriberId, {
    Phone: updates.phone,
    Address: updates.address,
    "Delivery Preference": updates.deliveryPreference,
  });

  return mapSubscriberRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
  });
}

export async function updateSubscriberAvatarUrl(
  subscriberId: string,
  avatarUrl: string | null
): Promise<Subscriber | null> {
  const base = getAirtableBase();
  const tableName = getSubscribersTableName();
  const avatarField = getSubscriberAvatarField();

  const record = await base(tableName).update(subscriberId, {
    [avatarField]: avatarUrl ?? "",
  });

  return mapSubscriberRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
  });
}
