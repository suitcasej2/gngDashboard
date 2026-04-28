import Airtable from "airtable";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function getAirtableBase() {
  const apiKey = requiredEnv("AIRTABLE_API_KEY");
  const baseId = requiredEnv("AIRTABLE_BASE_ID");

  const airtable = new Airtable({ apiKey });
  return airtable.base(baseId);
}

export function getHarvestsTableName() {
  return process.env.AIRTABLE_HARVESTS_TABLE_NAME || "Harvests";
}

export function getHarvestRsvpsTableName() {
  return process.env.AIRTABLE_HARVEST_RSVPS_TABLE_NAME || "Harvest RSVPs";
}

export function getHarvestNameField() {
  // Must match the Airtable field name *as the API sees it* (UI can hide a leading BOM).
  return process.env.AIRTABLE_HARVEST_NAME_FIELD || "Harvest Name";
}

