/** Pacific (America/Los_Angeles) calendar helpers for RSVP automation. */

export type PacificNow = {
  /** YYYY-MM-DD in Pacific */
  date: string;
  /** 0–23 in Pacific */
  hour: number;
  /** 0–59 in Pacific */
  minute: number;
  /** JS weekday: 0 = Sunday … 6 = Saturday (Pacific) */
  weekday: number;
};

const TZ = "America/Los_Angeles";

function ymdToUtcNoon(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function formatUtcYmd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysToYmd(ymd: string, days: number): string {
  const date = ymdToUtcNoon(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcYmd(date);
}

/** Weekday for a YYYY-MM-DD civil date (timezone-independent). */
export function weekdayOfYmd(ymd: string): number {
  return ymdToUtcNoon(ymd).getUTCDay();
}

/** Most recent Friday strictly before the harvest start date. */
export function fridayBeforeHarvest(startDate: string): string {
  let cursor = addDaysToYmd(startDate, -1);
  while (weekdayOfYmd(cursor) !== 5) {
    cursor = addDaysToYmd(cursor, -1);
  }
  return cursor;
}

/** Most recent Monday strictly before the harvest start date. */
export function mondayBeforeHarvest(startDate: string): string {
  let cursor = addDaysToYmd(startDate, -1);
  while (weekdayOfYmd(cursor) !== 1) {
    cursor = addDaysToYmd(cursor, -1);
  }
  return cursor;
}

export function getPacificNow(now = new Date()): PacificNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const month = get("month");
  const day = get("day");
  const year = get("year");
  const hour = Number.parseInt(get("hour"), 10);
  const minute = Number.parseInt(get("minute"), 10);

  const weekdayName = get("weekday");
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    date: `${year}-${month}-${day}`,
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
    weekday: weekdayMap[weekdayName] ?? weekdayOfYmd(`${year}-${month}-${day}`),
  };
}
