export function formatHarvestDateRange(
  startDate: string | null,
  endDate: string | null
): string {
  if (!startDate) return "Dates TBD";
  const start = new Date(`${startDate}T12:00:00`);
  const fmt = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (!endDate || endDate === startDate) {
    return fmt.format(start);
  }

  const end = new Date(`${endDate}T12:00:00`);
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function formatYear(date: string | null): string {
  if (!date) return "—";
  const match = date.match(/^(\d{4})/);
  if (match) return match[1];
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "—";
  return String(parsed.getFullYear());
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
