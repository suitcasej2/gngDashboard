export function getAdminEmails(): string[] {
  const raw = process.env.GNG_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
}
