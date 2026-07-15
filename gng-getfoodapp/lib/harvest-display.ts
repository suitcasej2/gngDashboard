export function getHarvestNameFromAirtableFields(
  fields: Record<string, unknown> | null | undefined,
) {
  if (!fields) return "Untitled harvest";

  for (const [k, v] of Object.entries(fields)) {
    const key = k.replace(/^\uFEFF+/, "").trim();
    if (key === "Harvest Name" && typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }

  return "Untitled harvest";
}

export function getStringField(
  fields: Record<string, unknown> | null | undefined,
  name: string,
) {
  if (!fields) return null;
  const direct = fields[name];
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return null;
}

/**
 * Airtable single select values are usually returned as a string, but defensively
 * handle object-shaped values if the data model changes.
 */
export function getSingleLineTextishField(
  fields: Record<string, unknown> | null | undefined,
  name: string,
) {
  if (!fields) return null;
  const v = fields[name] as unknown;
  if (typeof v === "string" && v.trim()) return v.trim();
  if (v && typeof v === "object" && "name" in v && typeof (v as { name?: unknown }).name === "string") {
    const s = (v as { name: string }).name.trim();
    return s || null;
  }
  return null;
}

export function getLongTextField(
  fields: Record<string, unknown> | null | undefined,
  name: string,
) {
  if (!fields) return null;
  const v = fields[name];
  if (typeof v === "string") return v;
  return null;
}

export function getCheckboxField(
  fields: Record<string, unknown> | null | undefined,
  name: string,
): boolean | null {
  if (!fields) return null;
  const v = fields[name];
  if (typeof v === "boolean") return v;
  return null;
}

export function getRsvpChoiceFromFields(fields: Record<string, unknown> | null | undefined) {
  if (!fields) return null;

  for (const [k, raw] of Object.entries(fields)) {
    const key = k.replace(/^\uFEFF+/, "").trim();
    if (key !== "RSVP Choice") continue;

    const v = raw as unknown;
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object" && "name" in v && typeof (v as { name?: unknown }).name === "string") {
      const s = (v as { name: string }).name.trim();
      return s || null;
    }
  }

  return null;
}
