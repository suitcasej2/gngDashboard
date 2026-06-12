"use server";

import { put } from "@vercel/blob";
import { getAirtableBase, getHarvestNameField, getHarvestsTableName } from "@/lib/airtable";
import { notifyNewHarvest } from "@/lib/push-notifications";
import type { FieldSet } from "airtable";

export type HarvestStatus = "Draft" | "Published";

export type CreateHarvestInput = {
  // Harvest Details
  harvestName: string;
  description?: string;
  pickupLocation?: string;
  boxContents?: string;
  textMeNumber?: string;

  // Logistics
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm

  // Featured Content
  recipeTitle?: string;
  recipeUrl?: string;
  storageTips?: string;

  // Sponsors/Donors
  bbSponsorName?: string;
  bbMessage?: string;
  donorName?: string;
  donorLink?: string;

  // Images (Vercel Blob URLs)
  harvestBoxImageUrl?: string;
  recipeImageUrl?: string;
  bbImageUrl?: string;
  donorLogoUrl?: string;

  status: HarvestStatus;
};

function formatTimeTo12hPdt(time24: string | undefined) {
  if (!time24) return undefined;
  const m = time24.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return time24;
  const hh = Number(m[1]);
  const mm = m[2];
  if (!Number.isFinite(hh) || hh < 0 || hh > 23) return time24;
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${mm} ${ampm} PDT`;
}

function friendlyErrorMessage(err: unknown) {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : typeof err === "object" && err && "message" in err && typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Something went wrong. Please try again.";

  // Avoid leaking internal details
  if (/Missing environment variable/i.test(msg)) {
    return "The app isn’t fully configured yet. Please set the required environment variables.";
  }

  // Airtable-specific common cases (keep it friendly + actionable)
  if (/NOT_FOUND/i.test(msg) || /could not find/i.test(msg)) {
    return "Airtable couldn’t find that Base/Table (check AIRTABLE_BASE_ID and table name).";
  }
  if (/AUTHENTICATION_REQUIRED|401|403/i.test(msg)) {
    return "Airtable rejected the request (check your Airtable API key permissions).";
  }
  if (/UNKNOWN_FIELD_NAME/i.test(msg)) {
    return "Airtable field name mismatch. One or more column names don’t match what the app is sending.";
  }

  return msg;
}

function extractUnknownFieldName(message: string): string | null {
  const m = message.match(/Unknown field name:\s*"([^"]+)"/i);
  return m?.[1] ?? null;
}

function withPrimaryFieldBomFix(
  fields: Record<string, unknown>,
  configuredPrimaryKey: string,
) {
  const next: Record<string, unknown> = { ...fields };

  const value = next[configuredPrimaryKey];
  if (value === undefined) return next;

  const trimmedKey = configuredPrimaryKey.replace(/^\uFEFF+/, "").trim();
  const bomKey = `\uFEFF${trimmedKey}`;

  // If Airtable's field is literally named with a leading BOM, mirror the payload key.
  delete next[configuredPrimaryKey];
  next[bomKey] = value;

  return next;
}

export async function uploadImageToBlob(input: {
  file: File;
  folder:
    | "harvest-box"
    | "recipe"
    | "bread-butter-jam"
    | "donor-logo";
}) {
  const { file, folder } = input;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing environment variable: BLOB_READ_WRITE_TOKEN");
  }

  if (!file || file.size === 0) {
    throw new Error("Please choose an image file.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("That file isn’t an image. Please upload a PNG, JPG, or WEBP.");
  }

  if (file.type === "image/svg+xml") {
    throw new Error("SVG uploads aren’t supported. Please upload a PNG, JPG, or WEBP.");
  }

  const maxBytes = 12 * 1024 * 1024; // 12MB
  if (file.size > maxBytes) {
    throw new Error("That image is too large. Please upload something under 12MB.");
  }

  const extFromType =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const safeBase =
    file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "image";

  const blob = await put(`${folder}/${safeBase}.${extFromType}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return { url: blob.url };
}

export async function createHarvest(input: CreateHarvestInput) {
  try {
    if (!input.harvestName?.trim()) {
      throw new Error("Harvest Name is required.");
    }

    const base = getAirtableBase();
    const tableName = getHarvestsTableName();
    const harvestNameField = getHarvestNameField();

    const fields: Record<string, unknown> = {
      [harvestNameField]: input.harvestName.trim(),

      // Matches your table
      "Harvest Description": input.description?.trim() || undefined,
      "Pickup Location": input.pickupLocation?.trim() || undefined,
      "Box Contents": input.boxContents?.trim() || undefined,
      "Text Me Number": input.textMeNumber?.trim() || undefined,
      "Start Date": input.startDate || undefined,
      "Start Time": formatTimeTo12hPdt(input.startTime),
      "End Time": formatTimeTo12hPdt(input.endTime),
      "Featured Recipe Title": input.recipeTitle?.trim() || undefined,
      "Recipe URL": input.recipeUrl?.trim() || undefined,
      "Storage Tips": input.storageTips?.trim() || undefined,
      Status: input.status,

      // Image URL fields (confirmed)
      "Header Image URL": input.harvestBoxImageUrl || undefined,
      "Recipe Image URL": input.recipeImageUrl || undefined,
    };

    if (input.endDate) fields["End Date"] = input.endDate;
    if (input.bbImageUrl) fields["Bread & Butter Image URL"] = input.bbImageUrl;
    if (input.donorLogoUrl) fields["Donor Image URL"] = input.donorLogoUrl;
    if (input.bbSponsorName?.trim()) {
      fields["Bread & Butter Jam Sponsor"] = input.bbSponsorName.trim();
    }
    if (input.bbMessage?.trim()) {
      fields["Bread & Butter Jam Message"] = input.bbMessage.trim();
    }
    if (input.donorName?.trim()) fields["Donor Name"] = input.donorName.trim();
    if (input.donorLink?.trim()) fields["Donor Link"] = input.donorLink.trim();

    // Airtable doesn't like explicit undefineds for some field types
    for (const [k, v] of Object.entries(fields)) {
      if (v === undefined) delete fields[k];
    }

    const tryCreate = async (payload: FieldSet) => {
      return (await base(tableName).create(payload)) as unknown as { id?: string };
    };

    let record: { id?: string };
    try {
      record = await tryCreate(fields as unknown as FieldSet);
    } catch (firstErr: unknown) {
      const msg =
        typeof (firstErr as { message?: unknown })?.message === "string"
          ? String((firstErr as { message: string }).message)
          : typeof firstErr === "string"
            ? firstErr
            : "";

      const unknown = extractUnknownFieldName(msg);
      const configuredPrimary = harvestNameField.replace(/^\uFEFF+/, "").trim();

      // Common Airtable footgun: primary field name contains an invisible leading BOM in the API.
      if (unknown && unknown === configuredPrimary) {
        console.warn(
          `[createHarvest] Retrying Airtable create with BOM-prefixed primary field key for "${configuredPrimary}"`,
        );
        record = await tryCreate(withPrimaryFieldBomFix(fields, harvestNameField) as unknown as FieldSet);
      } else {
        throw firstErr;
      }
    }

    if (input.status === "Published" && record?.id) {
      void notifyNewHarvest(input.harvestName.trim());
    }

    return { ok: true as const, recordId: record?.id as string | undefined };
  } catch (err) {
    // Helpful for local debugging; does not reach the client directly.
    console.error("[createHarvest] Airtable error:", err);
    return {
      ok: false as const,
      message: friendlyErrorMessage(err),
    };
  }
}

export async function updateHarvest(
  input: { recordId: string } & CreateHarvestInput,
) {
  try {
    if (!input.recordId) throw new Error("Missing record id.");
    if (!input.harvestName?.trim()) {
      throw new Error("Harvest Name is required.");
    }

    const base = getAirtableBase();
    const tableName = getHarvestsTableName();
    const harvestNameField = getHarvestNameField();

    const fields: Record<string, unknown> = {
      [harvestNameField]: input.harvestName.trim(),

      "Harvest Description": input.description?.trim() || "",
      "Pickup Location": input.pickupLocation?.trim() || "",
      "Box Contents": input.boxContents?.trim() || "",
      "Text Me Number": input.textMeNumber?.trim() || "",
      "Start Date": input.startDate || "",
      "End Date": input.endDate || "",
      "Start Time": formatTimeTo12hPdt(input.startTime) || "",
      "End Time": formatTimeTo12hPdt(input.endTime) || "",
      "Featured Recipe Title": input.recipeTitle?.trim() || "",
      "Recipe URL": input.recipeUrl?.trim() || "",
      "Storage Tips": input.storageTips?.trim() || "",
      Status: input.status,

      "Header Image URL": input.harvestBoxImageUrl ?? "",
      "Recipe Image URL": input.recipeImageUrl ?? "",
      "Bread & Butter Image URL": input.bbImageUrl ?? "",
      "Donor Image URL": input.donorLogoUrl ?? "",

      "Bread & Butter Jam Sponsor": input.bbSponsorName?.trim() || "",
      "Bread & Butter Jam Message": input.bbMessage?.trim() || "",
      "Donor Name": input.donorName?.trim() || "",
      "Donor Link": input.donorLink?.trim() || "",
    };

    const tryUpdate = async (payload: FieldSet) => {
      return (await base(tableName).update(input.recordId, payload)) as unknown as { id?: string };
    };

    let record: { id?: string };
    try {
      record = await tryUpdate(fields as unknown as FieldSet);
    } catch (firstErr: unknown) {
      const msg =
        typeof (firstErr as { message?: unknown })?.message === "string"
          ? String((firstErr as { message: string }).message)
          : typeof firstErr === "string"
            ? firstErr
            : "";

      const unknown = extractUnknownFieldName(msg);
      const configuredPrimary = harvestNameField.replace(/^\uFEFF+/, "").trim();

      if (unknown && unknown === configuredPrimary) {
        console.warn(
          `[updateHarvest] Retrying Airtable update with BOM-prefixed primary field key for "${configuredPrimary}"`,
        );
        record = await tryUpdate(withPrimaryFieldBomFix(fields, harvestNameField) as unknown as FieldSet);
      } else {
        throw firstErr;
      }
    }

    return { ok: true as const, recordId: record?.id as string | undefined };
  } catch (err) {
    console.error("[updateHarvest] Airtable error:", err);
    return {
      ok: false as const,
      message: friendlyErrorMessage(err),
    };
  }
}

