"use server";

import { revalidatePath } from "next/cache";
import { getAirtableBase, getHarvestsTableName } from "@/lib/airtable";
import { getHarvestNameFromAirtableFields, getLongTextField } from "@/lib/harvest-display";
import { notifyCeoMessage, notifyNewHarvest } from "@/lib/push-notifications";
import type { FieldSet } from "airtable";

function messageFromAirtable(err: unknown) {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : typeof err === "object" && err && "message" in err && typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Something went wrong. Please try again.";

  if (/NOT_AUTHORIZED|403|401/i.test(msg)) {
    return "Airtable rejected the request (check your Airtable token permissions).";
  }

  return msg;
}

const ALLOWED_STATUS = new Set(["Draft", "Publish"]);
const ALLOWED_LIVE_STATUS = new Set(["Completed", "Sent"]);

export async function updateDraftHarvestStatus(input: { recordId: string; status: string }) {
  try {
    const status = input.status?.trim();
    if (!input.recordId) throw new Error("Missing record id.");
    if (!status) throw new Error("Missing status.");
    if (!ALLOWED_STATUS.has(status)) {
      throw new Error("Invalid status for this action.");
    }

    const base = getAirtableBase();
    const tableName = getHarvestsTableName();

    const record = await base(tableName).update(input.recordId, {
      Status: status,
    } as unknown as FieldSet);

    if (status === "Publish") {
      const fields = (record.fields || {}) as Record<string, unknown>;
      const harvestName = getHarvestNameFromAirtableFields(fields);
      void notifyNewHarvest(harvestName);
    }

    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, message: messageFromAirtable(err) };
  }
}

export async function deleteDraftHarvest(input: { recordId: string }) {
  try {
    if (!input.recordId) throw new Error("Missing record id.");

    const base = getAirtableBase();
    const tableName = getHarvestsTableName();

    await base(tableName).destroy(input.recordId);

    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, message: messageFromAirtable(err) };
  }
}

export async function updateLiveHarvestFields(input: {
  recordId: string;
  urgentUpdate?: string;
  sendUpdateNow?: boolean;
}) {
  try {
    if (!input.recordId) throw new Error("Missing record id.");

    const hasUrgent = input.urgentUpdate !== undefined;
    const hasSend = input.sendUpdateNow !== undefined;
    if (!hasUrgent && !hasSend) {
      throw new Error("No fields to update.");
    }

    const fields: Record<string, unknown> = {};
    if (hasUrgent) {
      // Allow clearing the long text
      fields["Urgent Update"] = input.urgentUpdate ?? "";
    }
    if (hasSend) {
      if (typeof input.sendUpdateNow !== "boolean") {
        throw new Error("Invalid value for Send Update Now.");
      }
      fields["Send Update Now"] = input.sendUpdateNow;
    }

    const base = getAirtableBase();
    const tableName = getHarvestsTableName();
    const record = await base(tableName).update(
      input.recordId,
      fields as unknown as FieldSet
    );

    if (input.sendUpdateNow === true) {
      const recordFields = (record.fields || {}) as Record<string, unknown>;
      const urgent =
        input.urgentUpdate?.trim() ||
        getLongTextField(recordFields, "Urgent Update") ||
        "";
      if (urgent) {
        void notifyCeoMessage(urgent);
      }
    }

    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, message: messageFromAirtable(err) };
  }
}

export async function updateLiveHarvestStatus(input: { recordId: string; status: string }) {
  try {
    const status = input.status?.trim();
    if (!input.recordId) throw new Error("Missing record id.");
    if (!status) throw new Error("Missing status.");
    if (!ALLOWED_LIVE_STATUS.has(status)) {
      throw new Error("Invalid status for this action.");
    }

    const base = getAirtableBase();
    const tableName = getHarvestsTableName();

    await base(tableName).update(input.recordId, { Status: status } as unknown as FieldSet);

    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, message: messageFromAirtable(err) };
  }
}
