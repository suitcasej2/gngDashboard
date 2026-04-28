import { getAirtableBase, getHarvestsTableName } from "@/lib/airtable";
import { getHarvestNameFromAirtableFields, getLongTextField, getSingleLineTextishField, getStringField } from "@/lib/harvest-display";
import type { CreateHarvestInput, HarvestStatus } from "@/app/actions/harvest";

export async function getHarvestForEdit(recordId: string): Promise<{
  recordId: string;
  initial: Partial<Omit<CreateHarvestInput, "status">> & { status: HarvestStatus };
}> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();

  const record = await base(tableName).find(recordId);
  const f = (record.fields || {}) as Record<string, unknown>;

  const statusRaw = getSingleLineTextishField(f, "Status");
  const status = (statusRaw === "Published" ? "Published" : "Draft") as HarvestStatus;

  return {
    recordId,
    initial: {
      harvestName: getHarvestNameFromAirtableFields(f),
      description: getLongTextField(f, "Harvest Description") ?? "",
      pickupLocation: getLongTextField(f, "Pickup Location") ?? getStringField(f, "Pickup Location") ?? "",
      boxContents: getLongTextField(f, "Box Contents") ?? "",
      textMeNumber: getStringField(f, "Text Me Number") ?? "",
      startDate: getStringField(f, "Start Date") ?? "",
      endDate: getStringField(f, "End Date") ?? "",
      startTime: getStringField(f, "Start Time") ?? "",
      endTime: getStringField(f, "End Time") ?? "",
      recipeTitle: getLongTextField(f, "Featured Recipe Title") ?? getStringField(f, "Featured Recipe Title") ?? "",
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

