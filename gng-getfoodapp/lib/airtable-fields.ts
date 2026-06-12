export function normalizeFieldKey(k: string) {
  return k.replace(/^\uFEFF+/, "").trim();
}

export function getField(
  fields: Record<string, unknown> | null | undefined,
  desired: string
) {
  if (!fields) return undefined;
  for (const [k, v] of Object.entries(fields)) {
    if (normalizeFieldKey(k) === desired) return v;
  }
  return undefined;
}

export function getStringField(
  fields: Record<string, unknown> | null | undefined,
  name: string
) {
  const v = getField(fields, name);
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

export function getLongTextField(
  fields: Record<string, unknown> | null | undefined,
  name: string
) {
  const v = getField(fields, name);
  if (typeof v === "string") return v;
  return null;
}

export function getSingleSelectField(
  fields: Record<string, unknown> | null | undefined,
  name: string
) {
  const v = getField(fields, name) as unknown;
  if (typeof v === "string" && v.trim()) return v.trim();
  if (
    v &&
    typeof v === "object" &&
    "name" in v &&
    typeof (v as { name?: unknown }).name === "string"
  ) {
    const s = (v as { name: string }).name.trim();
    return s || null;
  }
  return null;
}

export function getCheckboxField(
  fields: Record<string, unknown> | null | undefined,
  name: string
): boolean {
  const v = getField(fields, name);
  return v === true;
}

export function getNumberField(
  fields: Record<string, unknown> | null | undefined,
  name: string
): number {
  const v = getField(fields, name);
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return 0;
}

export function getDateField(
  fields: Record<string, unknown> | null | undefined,
  name: string
): string | null {
  const v = getField(fields, name);
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

export function getLinkedRecordIds(
  fields: Record<string, unknown> | null | undefined,
  name: string
): string[] {
  const v = getField(fields, name);
  if (!Array.isArray(v)) return [];
  return v.filter((id): id is string => typeof id === "string");
}

export function getFirstLinkedRecordId(
  fields: Record<string, unknown> | null | undefined,
  name: string
): string | null {
  return getLinkedRecordIds(fields, name)[0] ?? null;
}

/** Airtable lookup fields often return a string[] */
export function getLookupStringField(
  fields: Record<string, unknown> | null | undefined,
  name: string
): string | null {
  const v = getField(fields, name);
  if (typeof v === "string" && v.trim()) return v.trim();
  if (Array.isArray(v)) {
    const first = v.find((item) => typeof item === "string" && item.trim());
    if (typeof first === "string") return first.trim();
  }
  return null;
}

export function getHarvestNameFromFields(
  fields: Record<string, unknown> | null | undefined,
  harvestNameField = "Harvest Name"
) {
  if (!fields) return "Untitled harvest";

  for (const [k, v] of Object.entries(fields)) {
    const key = normalizeFieldKey(k);
    if (key === harvestNameField && typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }

  return "Untitled harvest";
}

export function escapeAirtableString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
