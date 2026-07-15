import { getCurrentPublishedHarvest } from "@/lib/harvest";
import {
  fridayBeforeHarvest,
  getPacificNow,
  mondayBeforeHarvest,
  type PacificNow,
} from "@/lib/pacific-time";
import {
  notifyAutoDonate,
  notifyRsvpReminder,
  type PushSendResult,
} from "@/lib/push-notifications";
import {
  createAutoDonateRsvps,
  listRsvpdSubscriberIdsForHarvest,
} from "@/lib/rsvp";
import { listActiveSubscribers } from "@/lib/subscriber";

export type RsvpAutomationJob =
  | "friday_reminder"
  | "monday_reminder"
  | "auto_donate"
  | "idle";

export type RsvpAutomationResult = {
  pacificDate: string;
  pacificHour: number;
  job: RsvpAutomationJob;
  harvestId: string | null;
  harvestName: string | null;
  nonResponderCount: number;
  autoDonateCreated: number;
  push: PushSendResult | null;
  skippedReason?: string;
  markerSkipped?: boolean;
};

const MARKER_PREFIX = "rsvp-automation/markers/";
const REMINDER_HOUR_PT = 10;
const AUTO_DONATE_HOUR_PT = 9;

function markerPath(
  job: Exclude<RsvpAutomationJob, "idle">,
  harvestId: string,
  pacificDate: string
) {
  const safe = `${job}-${harvestId}-${pacificDate}`.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );
  return `${MARKER_PREFIX}${safe}.txt`;
}

async function hasMarker(pathname: string): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    return blobs.some((b) => b.pathname === pathname);
  } catch (error) {
    console.warn("[rsvp-automation] Could not read markers:", error);
    return false;
  }
}

async function writeMarker(pathname: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    const { put } = await import("@vercel/blob");
    await put(pathname, new Date().toISOString(), {
      access: "public",
      addRandomSuffix: false,
      contentType: "text/plain",
    });
  } catch (error) {
    console.warn("[rsvp-automation] Could not write marker:", error);
  }
}

async function getNonResponderIds(harvestId: string): Promise<string[]> {
  const [active, rsvpd] = await Promise.all([
    listActiveSubscribers(),
    listRsvpdSubscriberIdsForHarvest(harvestId),
  ]);

  return active.filter((s) => !rsvpd.has(s.id)).map((s) => s.id);
}

function resolveJob(
  now: PacificNow,
  startDate: string
): Exclude<RsvpAutomationJob, "idle"> | null {
  if (
    now.hour === REMINDER_HOUR_PT &&
    now.date === fridayBeforeHarvest(startDate)
  ) {
    return "friday_reminder";
  }

  if (
    now.hour === REMINDER_HOUR_PT &&
    now.date === mondayBeforeHarvest(startDate)
  ) {
    return "monday_reminder";
  }

  if (now.hour === AUTO_DONATE_HOUR_PT && now.date === startDate) {
    return "auto_donate";
  }

  return null;
}

export async function runRsvpAutomation(
  nowInput?: Date
): Promise<RsvpAutomationResult> {
  const now = getPacificNow(nowInput);

  const idle = (
    extra: Partial<RsvpAutomationResult> = {}
  ): RsvpAutomationResult => ({
    pacificDate: now.date,
    pacificHour: now.hour,
    job: "idle",
    harvestId: null,
    harvestName: null,
    nonResponderCount: 0,
    autoDonateCreated: 0,
    push: null,
    ...extra,
  });

  const harvest = await getCurrentPublishedHarvest();
  if (!harvest) {
    return idle({ skippedReason: "No published harvest." });
  }
  if (!harvest.startDate) {
    return idle({
      harvestId: harvest.id,
      harvestName: harvest.name,
      skippedReason: "Published harvest has no Start Date.",
    });
  }

  const job = resolveJob(now, harvest.startDate);
  if (!job) {
    return idle({
      harvestId: harvest.id,
      harvestName: harvest.name,
      skippedReason: `No job for Pacific ${now.date} hour ${now.hour}.`,
    });
  }

  const path = markerPath(job, harvest.id, now.date);
  if (await hasMarker(path)) {
    return {
      pacificDate: now.date,
      pacificHour: now.hour,
      job,
      harvestId: harvest.id,
      harvestName: harvest.name,
      nonResponderCount: 0,
      autoDonateCreated: 0,
      push: null,
      skippedReason: "Already ran for this harvest/day.",
      markerSkipped: true,
    };
  }

  const nonResponders = await getNonResponderIds(harvest.id);

  if (job === "friday_reminder" || job === "monday_reminder") {
    if (nonResponders.length === 0) {
      await writeMarker(path);
      return {
        pacificDate: now.date,
        pacificHour: now.hour,
        job,
        harvestId: harvest.id,
        harvestName: harvest.name,
        nonResponderCount: 0,
        autoDonateCreated: 0,
        push: null,
        skippedReason: "No active non-responders to remind.",
      };
    }

    const push = await notifyRsvpReminder(
      job === "friday_reminder" ? "friday" : "monday",
      harvest.name,
      nonResponders
    );
    await writeMarker(path);
    return {
      pacificDate: now.date,
      pacificHour: now.hour,
      job,
      harvestId: harvest.id,
      harvestName: harvest.name,
      nonResponderCount: nonResponders.length,
      autoDonateCreated: 0,
      push,
    };
  }

  const createdIds = await createAutoDonateRsvps(harvest.id, nonResponders);
  const push =
    createdIds.length > 0 ? await notifyAutoDonate(createdIds) : null;

  await writeMarker(path);
  return {
    pacificDate: now.date,
    pacificHour: now.hour,
    job,
    harvestId: harvest.id,
    harvestName: harvest.name,
    nonResponderCount: nonResponders.length,
    autoDonateCreated: createdIds.length,
    push,
  };
}
