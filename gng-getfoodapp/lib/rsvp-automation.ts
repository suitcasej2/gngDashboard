import { getCurrentPublishedHarvest } from "@/lib/harvest";
import {
  fridayBeforeHarvest,
  getPacificNow,
  mondayBeforeHarvest,
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

export type RunnableRsvpJob = Exclude<RsvpAutomationJob, "idle">;

export type RsvpAutomationResult = {
  pacificDate: string;
  pacificHour: number;
  job: RsvpAutomationJob;
  harvestId: string | null;
  harvestName: string | null;
  nonResponderCount: number;
  autoDonateCreated: number;
  push: PushSendResult | null;
  dryRun?: boolean;
  skippedReason?: string;
  markerSkipped?: boolean;
};

export type RsvpAutomationPreview = {
  pacificNow: string;
  harvestId: string | null;
  harvestName: string | null;
  startDate: string | null;
  fridayReminderDate: string | null;
  mondayReminderDate: string | null;
  autoDonateDate: string | null;
  nonResponderCount: number;
  markers: {
    friday_reminder: boolean;
    monday_reminder: boolean;
    auto_donate: boolean;
  };
};

const MARKER_PREFIX = "rsvp-automation/markers/";
const REMINDER_HOUR_PT = 10;
const AUTO_DONATE_HOUR_PT = 9;

function markerPath(
  job: RunnableRsvpJob,
  harvestId: string,
  pacificDate: string
) {
  const safe = `${job}-${harvestId}-${pacificDate}`.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );
  return `${MARKER_PREFIX}${safe}.txt`;
}

function scheduledDateForJob(
  job: RunnableRsvpJob,
  startDate: string
): string {
  if (job === "friday_reminder") return fridayBeforeHarvest(startDate);
  if (job === "monday_reminder") return mondayBeforeHarvest(startDate);
  return startDate;
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

async function clearMarker(pathname: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    const { list, del } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: pathname, limit: 5 });
    const matches = blobs.filter((b) => b.pathname === pathname);
    if (matches.length === 0) return;
    await del(matches.map((b) => b.url));
  } catch (error) {
    console.warn("[rsvp-automation] Could not clear marker:", error);
  }
}

async function getNonResponderIds(harvestId: string): Promise<string[]> {
  const [active, rsvpd] = await Promise.all([
    listActiveSubscribers(),
    listRsvpdSubscriberIdsForHarvest(harvestId),
  ]);

  return active.filter((s) => !rsvpd.has(s.id)).map((s) => s.id);
}

function resolveScheduledJob(
  pacificDate: string,
  pacificHour: number,
  startDate: string
): RunnableRsvpJob | null {
  if (
    pacificHour === REMINDER_HOUR_PT &&
    pacificDate === fridayBeforeHarvest(startDate)
  ) {
    return "friday_reminder";
  }

  if (
    pacificHour === REMINDER_HOUR_PT &&
    pacificDate === mondayBeforeHarvest(startDate)
  ) {
    return "monday_reminder";
  }

  if (pacificHour === AUTO_DONATE_HOUR_PT && pacificDate === startDate) {
    return "auto_donate";
  }

  return null;
}

export async function previewRsvpAutomation(): Promise<RsvpAutomationPreview> {
  const now = getPacificNow();
  const harvest = await getCurrentPublishedHarvest();

  if (!harvest?.startDate) {
    return {
      pacificNow: `${now.date} ${String(now.hour).padStart(2, "0")}:${String(now.minute).padStart(2, "0")} PT`,
      harvestId: harvest?.id ?? null,
      harvestName: harvest?.name ?? null,
      startDate: null,
      fridayReminderDate: null,
      mondayReminderDate: null,
      autoDonateDate: null,
      nonResponderCount: 0,
      markers: {
        friday_reminder: false,
        monday_reminder: false,
        auto_donate: false,
      },
    };
  }

  const friday = fridayBeforeHarvest(harvest.startDate);
  const monday = mondayBeforeHarvest(harvest.startDate);
  const nonResponders = await getNonResponderIds(harvest.id);

  const [fridayDone, mondayDone, autoDone] = await Promise.all([
    hasMarker(markerPath("friday_reminder", harvest.id, friday)),
    hasMarker(markerPath("monday_reminder", harvest.id, monday)),
    hasMarker(markerPath("auto_donate", harvest.id, harvest.startDate)),
  ]);

  return {
    pacificNow: `${now.date} ${String(now.hour).padStart(2, "0")}:${String(now.minute).padStart(2, "0")} PT`,
    harvestId: harvest.id,
    harvestName: harvest.name,
    startDate: harvest.startDate,
    fridayReminderDate: friday,
    mondayReminderDate: monday,
    autoDonateDate: harvest.startDate,
    nonResponderCount: nonResponders.length,
    markers: {
      friday_reminder: fridayDone,
      monday_reminder: mondayDone,
      auto_donate: autoDone,
    },
  };
}

export async function runRsvpAutomationJob(options: {
  job: RunnableRsvpJob;
  dryRun?: boolean;
  force?: boolean;
}): Promise<RsvpAutomationResult> {
  const { job, dryRun = false, force = false } = options;
  const now = getPacificNow();

  const harvest = await getCurrentPublishedHarvest();
  if (!harvest) {
    return {
      pacificDate: now.date,
      pacificHour: now.hour,
      job,
      harvestId: null,
      harvestName: null,
      nonResponderCount: 0,
      autoDonateCreated: 0,
      push: null,
      dryRun,
      skippedReason: "No published harvest.",
    };
  }
  if (!harvest.startDate) {
    return {
      pacificDate: now.date,
      pacificHour: now.hour,
      job,
      harvestId: harvest.id,
      harvestName: harvest.name,
      nonResponderCount: 0,
      autoDonateCreated: 0,
      push: null,
      dryRun,
      skippedReason: "Published harvest has no Start Date.",
    };
  }

  const scheduledDate = scheduledDateForJob(job, harvest.startDate);
  const path = markerPath(job, harvest.id, scheduledDate);

  if (!dryRun && force) {
    await clearMarker(path);
  }

  if (!dryRun && !force && (await hasMarker(path))) {
    return {
      pacificDate: now.date,
      pacificHour: now.hour,
      job,
      harvestId: harvest.id,
      harvestName: harvest.name,
      nonResponderCount: 0,
      autoDonateCreated: 0,
      push: null,
      dryRun,
      skippedReason: "Already ran for this harvest/day. Use Force to run again.",
      markerSkipped: true,
    };
  }

  const nonResponders = await getNonResponderIds(harvest.id);

  if (dryRun) {
    return {
      pacificDate: now.date,
      pacificHour: now.hour,
      job,
      harvestId: harvest.id,
      harvestName: harvest.name,
      nonResponderCount: nonResponders.length,
      autoDonateCreated: 0,
      push: null,
      dryRun: true,
      skippedReason:
        nonResponders.length === 0
          ? "Dry run: no active non-responders."
          : `Dry run only — would affect ${nonResponders.length} Active subscriber(s). No pushes or Airtable writes.`,
    };
  }

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

/** Hourly cron entry — only runs the job if Pacific time matches the schedule. */
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

  const job = resolveScheduledJob(now.date, now.hour, harvest.startDate);
  if (!job) {
    return idle({
      harvestId: harvest.id,
      harvestName: harvest.name,
      skippedReason: `No job for Pacific ${now.date} hour ${now.hour}.`,
    });
  }

  return runRsvpAutomationJob({ job, dryRun: false, force: false });
}
