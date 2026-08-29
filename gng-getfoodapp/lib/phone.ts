/**
 * Subscribers.Phone is an Airtable Number field (10-digit US), not Phone/text.
 * Strings like "+16195551234" or "619-555-1234" are rejected.
 */
export function normalizePhoneDigits(raw: string): string | null {
  const digits = raw.trim().replace(/\D/g, "");
  if (!digits) return null;

  // 11 digits starting with 1 → national 10-digit
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  if (digits.length === 10) return digits;

  return null;
}

/** Value Airtable Number field accepts. */
export function phoneDigitsToAirtableNumber(raw: string): number | null {
  const digits = normalizePhoneDigits(raw);
  if (!digits) return null;
  const n = Number(digits);
  return Number.isSafeInteger(n) ? n : null;
}
