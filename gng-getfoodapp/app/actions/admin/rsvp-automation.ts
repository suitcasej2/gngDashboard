"use server";

import { requireAdminSession } from "@/lib/admin";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import {
  previewRsvpAutomation,
  runRsvpAutomationJob,
  type RunnableRsvpJob,
  type RsvpAutomationPreview,
  type RsvpAutomationResult,
} from "@/lib/rsvp-automation";

const JOBS: RunnableRsvpJob[] = [
  "friday_reminder",
  "monday_reminder",
  "auto_donate",
];

function isRunnableJob(value: string): value is RunnableRsvpJob {
  return JOBS.includes(value as RunnableRsvpJob);
}

export async function previewRsvpAutomationAction(): Promise<
  | { ok: true; preview: RsvpAutomationPreview }
  | { ok: false; message: string }
> {
  try {
    await requireAdminSession();
    const preview = await previewRsvpAutomation();
    return { ok: true, preview };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : friendlyAirtableError(e),
    };
  }
}

export async function runRsvpAutomationJobAction(input: {
  job: string;
  dryRun: boolean;
  force: boolean;
}): Promise<
  | { ok: true; result: RsvpAutomationResult }
  | { ok: false; message: string }
> {
  try {
    await requireAdminSession();

    if (!isRunnableJob(input.job)) {
      return { ok: false, message: "Unknown automation job." };
    }

    const result = await runRsvpAutomationJob({
      job: input.job,
      dryRun: input.dryRun,
      force: input.force,
    });

    return { ok: true, result };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : friendlyAirtableError(e),
    };
  }
}
