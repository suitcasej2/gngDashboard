import { getAirtableBase, getHarvestRsvpsTableName } from "@/lib/airtable";
import { getRsvpChoiceFromFields } from "@/lib/harvest-display";

function arrayFirstString(v: unknown): string | null {
  if (Array.isArray(v) && typeof v[0] === "string") return v[0] ?? null;
  if (typeof v === "string") return v;
  return null;
}

function normalizeFieldKey(k: string) {
  return k.replace(/^\uFEFF+/, "").trim();
}

function getField(fields: Record<string, unknown>, desired: string) {
  for (const [k, v] of Object.entries(fields)) {
    if (normalizeFieldKey(k) === desired) return v;
  }
  return undefined;
}

function harvestNameFromLookup(fields: Record<string, unknown>) {
  const v = getField(fields, "Harvest Name (from Harvests)");
  if (Array.isArray(v) && typeof v[0] === "string") return v[0] as string;
  return null;
}

/**
 * RSVPs linked to a currently live harvest.
 * Matches Publish / Published / Sent (FIND('Publish') covers both Publish + Published).
 */
const LIVE_HARVEST_STATUS_FORMULA =
  "OR(FIND('Sent', ARRAYJOIN({Status (from Harvests)})), FIND('Publish', ARRAYJOIN({Status (from Harvests)})))";

export type DeliveryRow = {
  id: string;
  name: string | null;
  email: string | null;
  shippingAddress: string | null;
  harvestName: string | null;
};

export type GiftRecipientRow = {
  id: string;
  name: string | null;
  email: string | null;
  giftRecipientName: string | null;
  harvestName: string | null;
};

export type NonResponderRow = {
  id: string;
  name: string | null;
  email: string | null;
  harvestName: string | null;
};

export type RsvpChoiceCount = { choice: string; count: number };

export type AllRsvpRow = {
  id: string;
  name: string | null;
  email: string | null;
  choice: string | null;
};

export async function listSentRsvpChoiceCounts(): Promise<RsvpChoiceCount[]> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: LIVE_HARVEST_STATUS_FORMULA,
    })
    .all();

  const counts = new Map<string, number>();
  for (const r of records) {
    const fields = (r.fields || {}) as Record<string, unknown>;
    const choice = getRsvpChoiceFromFields(fields) ?? "Unknown";
    counts.set(choice, (counts.get(choice) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([choice, count]) => ({ choice, count }))
    .sort((a, b) =>
      b.count !== a.count ? b.count - a.count : a.choice.localeCompare(b.choice)
    );
}

export async function listSentRsvpsAll(): Promise<AllRsvpRow[]> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: LIVE_HARVEST_STATUS_FORMULA,
    })
    .all();

  return records.map((r) => {
    const f = (r.fields || {}) as Record<string, unknown>;
    return {
      id: r.id,
      name: arrayFirstString(getField(f, "Full Name (from Subscriber)")),
      email: arrayFirstString(getField(f, "Email (from Subscriber)")),
      choice: getRsvpChoiceFromFields(f),
    };
  });
}

export async function listSentNeedsDelivery(): Promise<DeliveryRow[]> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: `AND(${LIVE_HARVEST_STATUS_FORMULA}, {Needs Delivery?} = TRUE())`,
    })
    .all();

  return records.map((r) => {
    const f = (r.fields || {}) as Record<string, unknown>;
    return {
      id: r.id,
      name: arrayFirstString(getField(f, "Full Name (from Subscriber)")),
      email: arrayFirstString(getField(f, "Email (from Subscriber)")),
      shippingAddress: arrayFirstString(getField(f, "Shipping Address")),
      harvestName: harvestNameFromLookup(f),
    };
  });
}

export async function listSentGiftRecipients(): Promise<GiftRecipientRow[]> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: `AND(${LIVE_HARVEST_STATUS_FORMULA}, {RSVP Choice} = 'Gift')`,
    })
    .all();

  return records.map((r) => {
    const f = (r.fields || {}) as Record<string, unknown>;
    return {
      id: r.id,
      name: arrayFirstString(getField(f, "Full Name (from Subscriber)")),
      email: arrayFirstString(getField(f, "Email (from Subscriber)")),
      giftRecipientName: arrayFirstString(getField(f, "Gift Recipient Name")),
      harvestName: harvestNameFromLookup(f),
    };
  });
}

export async function listSentNonRespondersAutoDonate(): Promise<NonResponderRow[]> {
  const base = getAirtableBase();
  const tableName = getHarvestRsvpsTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: `AND(${LIVE_HARVEST_STATUS_FORMULA}, FIND('Auto-Donate', {Notes}))`,
    })
    .all();

  return records.map((r) => {
    const f = (r.fields || {}) as Record<string, unknown>;
    return {
      id: r.id,
      name: arrayFirstString(getField(f, "Full Name (from Subscriber)")),
      email: arrayFirstString(getField(f, "Email (from Subscriber)")),
      harvestName: harvestNameFromLookup(f),
    };
  });
}
