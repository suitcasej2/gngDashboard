import { getAirtableBase, getHarvestsTableName } from "@/lib/airtable";
import { mapAirtableRecordToHarvestRow } from "@/lib/harvest-list-map";
import type { DraftHarvestRow } from "@/types/draft-harvest";

export async function listDraftHarvests(): Promise<DraftHarvestRow[]> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: "{Status} = 'Draft'",
      sort: [{ field: "Last Modified", direction: "desc" }],
    })
    .all();

  return records.map((r) => {
    const f = (r.fields || {}) as Record<string, unknown>;
    return mapAirtableRecordToHarvestRow({ id: r.id, fields: f });
  });
}
