import { getAirtableBase, getHarvestsTableName } from "@/lib/airtable";
import { mapSubscriberHarvestRecord } from "@/lib/airtable-mappers";
import type { Harvest } from "@/types/harvest";

const VISIBLE_STATUSES_FORMULA =
  "OR({Status} = 'Published', {Status} = 'Publish', {Status} = 'Sent', {Status} = 'Completed')";

const PUBLISHED_STATUSES_FORMULA =
  "OR({Status} = 'Published', {Status} = 'Publish', {Status} = 'Sent')";

async function listSubscriberHarvestRecords(): Promise<Harvest[]> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: VISIBLE_STATUSES_FORMULA,
      sort: [{ field: "Start Date", direction: "desc" }],
    })
    .all();

  return records
    .map((r) =>
      mapSubscriberHarvestRecord({
        id: r.id,
        fields: (r.fields || {}) as Record<string, unknown>,
      })
    )
    .filter((h): h is Harvest => h !== null);
}

export async function listVisibleHarvests(): Promise<Harvest[]> {
  return listSubscriberHarvestRecords();
}

export async function getCurrentPublishedHarvest(): Promise<Harvest | null> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: PUBLISHED_STATUSES_FORMULA,
      sort: [{ field: "Start Date", direction: "desc" }],
      maxRecords: 1,
    })
    .firstPage();

  const record = records[0];
  if (!record) return null;

  return mapSubscriberHarvestRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
  });
}

export async function getHarvestById(id: string): Promise<Harvest | null> {
  try {
    const base = getAirtableBase();
    const tableName = getHarvestsTableName();
    const record = await base(tableName).find(id);
    return mapSubscriberHarvestRecord({
      id: record.id,
      fields: (record.fields || {}) as Record<string, unknown>,
    });
  } catch {
    return null;
  }
}

export function isHarvestChatOpen(harvest: Harvest): boolean {
  return harvest.status === "Published";
}
