import { getAirtableBase, getHarvestsTableName } from "@/lib/airtable";
import {
  getHarvestNameFromAirtableFields,
  getLongTextField,
  getSingleLineTextishField,
  getStringField,
} from "@/lib/harvest-display";
import { parseHarvestTime } from "@/lib/harvest-calendar";
import type { CreateHarvestInput, HarvestStatus } from "@/app/actions/admin/harvest";
import { mapSubscriberHarvestRecord } from "@/lib/airtable-mappers";
import type { Harvest } from "@/types/harvest";

function toTimeInputValue(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  if (/^\d{1,2}:\d{2}$/.test(raw.trim())) {
    const [h, m] = raw.trim().split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }
  const parsed = parseHarvestTime(raw);
  if (!parsed) return "";
  return `${String(parsed.hours).padStart(2, "0")}:${String(parsed.minutes).padStart(2, "0")}`;
}

function formStatusFromAirtable(raw: string | null): HarvestStatus {
  const s = raw?.trim() ?? "";
  if (s === "Published" || s === "Publish" || s === "Sent") return "Published";
  return "Draft";
}

export async function getHarvestForEdit(recordId: string): Promise<{
  recordId: string;
  airtableStatus: string | null;
  initial: Partial<Omit<CreateHarvestInput, "status">> & { status: HarvestStatus };
}> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();

  const record = await base(tableName).find(recordId);
  const f = (record.fields || {}) as Record<string, unknown>;

  const statusRaw = getSingleLineTextishField(f, "Status");
  const status = formStatusFromAirtable(statusRaw);

  return {
    recordId,
    airtableStatus: statusRaw,
    initial: {
      harvestName: getHarvestNameFromAirtableFields(f),
      description: getLongTextField(f, "Harvest Description") ?? "",
      pickupLocation:
        getLongTextField(f, "Pickup Location") ??
        getStringField(f, "Pickup Location") ??
        "",
      boxContents: getLongTextField(f, "Box Contents") ?? "",
      textMeNumber: getStringField(f, "Text Me Number") ?? "",
      startDate: getStringField(f, "Start Date") ?? "",
      endDate: getStringField(f, "End Date") ?? "",
      startTime: toTimeInputValue(getStringField(f, "Start Time")),
      endTime: toTimeInputValue(getStringField(f, "End Time")),
      recipeTitle:
        getLongTextField(f, "Featured Recipe Title") ??
        getStringField(f, "Featured Recipe Title") ??
        "",
      recipeUrl: getStringField(f, "Recipe URL") ?? "",
      storageTips: getLongTextField(f, "Storage Tips") ?? "",
      bbSponsorName: getStringField(f, "Bread & Butter Jam Sponsor") ?? "",
      bbMessage: getLongTextField(f, "Bread & Butter Jam Message") ?? "",
      donorName: getStringField(f, "Donor Name") ?? "",
      donorLink: getStringField(f, "Donor Link") ?? "",
      harvestBoxImageUrl: getStringField(f, "Header Image URL") ?? "",
      recipeImageUrl: getStringField(f, "Recipe Image URL") ?? "",
      bbImageUrl: getStringField(f, "Bread & Butter Image URL") ?? "",
      donorLogoUrl: getStringField(f, "Donor Image URL") ?? "",
      status,
    },
  };
}

/** Maps any harvest record (including Draft) into the subscriber Harvest shape for admin preview. */
export async function getHarvestForAdminPreview(
  recordId: string
): Promise<Harvest | null> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();
  const record = await base(tableName).find(recordId);
  const fields = (record.fields || {}) as Record<string, unknown>;

  const live = mapSubscriberHarvestRecord({ id: record.id, fields });
  if (live) return live;

  return mapSubscriberHarvestRecord(
    { id: record.id, fields },
    { allowDraft: true }
  );
}
