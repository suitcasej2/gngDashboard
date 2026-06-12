type AirtableErrorShape = {
  error?: string;
  message?: string;
  statusCode?: number;
};

export function getAirtableErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const msg = (e as AirtableErrorShape).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return "Something went wrong talking to Airtable.";
}

export function friendlyAirtableError(e: unknown): string {
  const msg = getAirtableErrorMessage(e);
  const code =
    e && typeof e === "object" && "error" in e
      ? String((e as AirtableErrorShape).error ?? "")
      : "";

  if (msg.includes("NOT_FOUND") || msg.includes("Could not find")) {
    return "Record not found in Airtable.";
  }
  if (
    code === "NOT_AUTHORIZED" ||
    msg.includes("NOT_AUTHORIZED") ||
    msg.includes("not authorized")
  ) {
    return "Airtable access denied. Check your API token and table name in .env.local.";
  }
  if (code === "UNKNOWN_FIELD_NAME" || msg.includes("Unknown field name")) {
    return `Airtable field mismatch: ${msg}`;
  }
  if (msg.includes("INVALID_PERMISSIONS") || msg.includes("AUTHENTICATION_REQUIRED")) {
    return "Airtable access denied. Check your API key permissions.";
  }
  if (msg.includes("INVALID_VALUE_FOR_COLUMN")) {
    return "Invalid value for an Airtable field. Check single-select options.";
  }
  return msg;
}
