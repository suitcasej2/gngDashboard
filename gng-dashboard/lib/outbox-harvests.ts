import { getAirtableBase, getHarvestsTableName } from "@/lib/airtable";
import { mapAirtableRecordToHarvestRow } from "@/lib/harvest-list-map";
import type { DraftHarvestRow } from "@/types/draft-harvest";

/**
 * Harvests that are out of the "Draft" column — ready to go out, or already sent.
 *
 * Note: Airtable option labels must match exactly (including spaces/casing).
 */
export async function listReadyOrSentHarvests(): Promise<DraftHarvestRow[]> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();

  const records = await base(tableName)
    .select({
      filterByFormula: "OR({Status} = 'Publish', {Status} = 'Sent')",
      sort: [{ field: "Last Modified", direction: "desc" }],
    })
    .all();

  return records.map((r) => {
    const f = (r.fields || {}) as Record<string, unknown>;
    return mapAirtableRecordToHarvestRow({ id: r.id, fields: f });
  });
}
