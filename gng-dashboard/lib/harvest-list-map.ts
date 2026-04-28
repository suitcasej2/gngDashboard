import {
  getCheckboxField,
  getHarvestNameFromAirtableFields,
  getLongTextField,
  getSingleLineTextishField,
} from "@/lib/harvest-display";
import type { DraftHarvestRow } from "@/types/draft-harvest";

export function mapAirtableRecordToHarvestRow(input: { id: string; fields: Record<string, unknown> }): DraftHarvestRow {
  const f = input.fields;

  return {
    id: input.id,
    name: getHarvestNameFromAirtableFields(f),
    startDate: typeof f["Start Date"] === "string" ? String(f["Start Date"]) : null,
    startTime: typeof f["Start Time"] === "string" ? String(f["Start Time"]) : null,
    lastModified: typeof f["Last Modified"] === "string" ? String(f["Last Modified"]) : null,
    status: getSingleLineTextishField(f, "Status"),
    urgentUpdate: getLongTextField(f, "Urgent Update"),
    sendUpdateNow: getCheckboxField(f, "Send Update Now"),
  };
}
