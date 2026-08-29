"use server";

import type { FieldSet } from "airtable";

import {
  getAirtableBase,
  getMassEmailBodyHtmlField,
  getMassEmailCreatedByField,
  getMassEmailNotesField,
  getMassEmailStatusField,
  getMassEmailSubjectField,
  getMassEmailsTableName,
} from "@/lib/airtable";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { requireAdminSession } from "@/lib/admin";
import {
  buildMassEmailHtml,
  type MassEmailContent,
} from "@/lib/mass-email-template";

export type QueueMassEmailInput = MassEmailContent & {
  notes?: string;
};

export async function queueMassEmailAction(input: QueueMassEmailInput) {
  try {
    const admin = await requireAdminSession();

    const subject = input.subject?.trim() ?? "";
    const opening = input.opening?.trim() ?? "";
    if (!subject) {
      return { ok: false as const, message: "Subject is required." };
    }
    if (!opening) {
      return { ok: false as const, message: "Opening is required." };
    }

    const buttonLabel = input.buttonLabel?.trim() ?? "";
    const buttonUrl = input.buttonUrl?.trim() ?? "";
    if ((buttonLabel && !buttonUrl) || (!buttonLabel && buttonUrl)) {
      return {
        ok: false as const,
        message:
          "Button label and button URL are both required if you add a button.",
      };
    }

    const content: MassEmailContent = {
      subject,
      eyebrow: input.eyebrow?.trim() || undefined,
      headline: input.headline?.trim() || undefined,
      opening,
      highlight: input.highlight?.trim() || undefined,
      middle: input.middle?.trim() || undefined,
      bullets: input.bullets?.trim() || undefined,
      buttonLabel: buttonLabel || undefined,
      buttonUrl: buttonUrl || undefined,
      closing: input.closing?.trim() || undefined,
    };

    const bodyHtml = buildMassEmailHtml(content, {
      origin:
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
        "https://gng-get-food-app.vercel.app",
    });

    const base = getAirtableBase();
    const tableName = getMassEmailsTableName();
    const fields: FieldSet = {
      [getMassEmailSubjectField()]: subject,
      [getMassEmailBodyHtmlField()]: bodyHtml,
      [getMassEmailStatusField()]: "Queued",
      [getMassEmailCreatedByField()]: admin.email,
    };

    const notes = input.notes?.trim();
    if (notes) {
      fields[getMassEmailNotesField()] = notes;
    }

    const record = await base(tableName).create(fields);

    return {
      ok: true as const,
      recordId: record.id,
    };
  } catch (e) {
    console.error("[queueMassEmailAction]", e);
    return { ok: false as const, message: friendlyAirtableError(e) };
  }
}
