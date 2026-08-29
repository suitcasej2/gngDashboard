import type { Harvest } from "@/types/harvest";

const PACIFIC_TZ = "America/Los_Angeles";

/** Parse Airtable-style times like "4:30 PM PDT" → { hours, minutes } in 24h. */
export function parseHarvestTime(
  raw: string | null | undefined
): { hours: number; minutes: number } | null {
  if (!raw?.trim()) return null;
  const match = raw
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\b/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const ampm = match[3].toUpperCase();
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Local civil datetime for ICS TZID form: YYYYMMDDTHHmmss */
function localStamp(
  ymd: string,
  time: { hours: number; minutes: number } | null,
  endOfDay = false
) {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  if (time) {
    return `${y}${pad(m)}${pad(d)}T${pad(time.hours)}${pad(time.minutes)}00`;
  }
  if (endOfDay) {
    return `${y}${pad(m)}${pad(d)}T235959`;
  }
  return `${y}${pad(m)}${pad(d)}T000000`;
}

function allDayStamp(ymd: string) {
  return ymd.replace(/-/g, "");
}

/** Exclusive end date for all-day ICS (day after last day). */
function nextYmd(ymd: string) {
  const dt = new Date(`${ymd}T12:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

function foldIcsLine(line: string) {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function utcNowStamp() {
  const d = new Date();
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

export type HarvestCalendarEvent = {
  title: string;
  description: string;
  location: string;
  /** true when we only have dates (no usable times) */
  allDay: boolean;
  /** ICS DTSTART value (with or without time) */
  dtStart: string;
  dtEnd: string;
  filename: string;
};

export function buildHarvestCalendarEvent(
  harvest: Harvest
): HarvestCalendarEvent | null {
  if (!harvest.startDate) return null;

  const startTime = parseHarvestTime(harvest.startTime);
  const endTime = parseHarvestTime(harvest.endTime);
  const endDate = harvest.endDate || harvest.startDate;
  const allDay = !startTime;

  const title = `GNG Harvest Pickup — ${harvest.name}`;
  const descriptionParts = [
    harvest.description?.trim(),
    harvest.boxContents?.trim()
      ? `In your box:\n${harvest.boxContents.trim()}`
      : null,
    harvest.pickupLocation?.trim()
      ? `Pickup: ${harvest.pickupLocation.trim()}`
      : null,
    harvest.textMeNumber?.trim()
      ? `Text: ${harvest.textMeNumber.trim()}`
      : null,
  ].filter(Boolean);

  let dtStart: string;
  let dtEnd: string;

  if (allDay) {
    dtStart = allDayStamp(harvest.startDate);
    dtEnd = allDayStamp(nextYmd(endDate));
  } else {
    const start = localStamp(harvest.startDate, startTime);
    const end = localStamp(
      endDate,
      endTime ?? startTime,
      !endTime
    );
    if (!start || !end) return null;
    dtStart = start;
    dtEnd = end;
  }

  const safeName = harvest.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return {
    title,
    description: descriptionParts.join("\n\n"),
    location: harvest.pickupLocation?.trim() ?? "",
    allDay,
    dtStart,
    dtEnd,
    filename: `gng-harvest-${safeName || harvest.id}.ics`,
  };
}

export function buildHarvestIcs(harvest: Harvest): string | null {
  const event = buildHarvestCalendarEvent(harvest);
  if (!event) return null;

  const uid = `harvest-${harvest.id}@goodneighborgardens.com`;
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Good Neighbor Gardens//Get Food//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${utcNowStamp()}`,
  ];

  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${event.dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${event.dtEnd}`);
  } else {
    lines.push(`DTSTART;TZID=${PACIFIC_TZ}:${event.dtStart}`);
    lines.push(`DTEND;TZID=${PACIFIC_TZ}:${event.dtEnd}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/** Google Calendar template link (times as Pacific floating local via ctz). */
export function buildGoogleCalendarUrl(harvest: Harvest): string | null {
  const event = buildHarvestCalendarEvent(harvest);
  if (!event) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    ctz: PACIFIC_TZ,
  });

  if (event.allDay) {
    params.set("dates", `${event.dtStart}/${event.dtEnd}`);
  } else {
    params.set("dates", `${event.dtStart}/${event.dtEnd}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
