"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { postStaffHarvestMessage } from "@/lib/harvest-messages";

function messageFromError(err: unknown) {
  if (err instanceof Error) return err.message;
  return friendlyAirtableError(err);
}

export async function postCeoHarvestMessageAction(input: {
  harvestId: string;
  body: string;
}) {
  try {
    const admin = await requireAdminSession();

    if (!input.harvestId?.trim()) {
      return { ok: false as const, message: "Missing harvest." };
    }

    const { push } = await postStaffHarvestMessage({
      harvestId: input.harvestId.trim(),
      body: input.body,
      staffSubscriberId: admin.id,
    });

    revalidatePath("/admin");
    if (!push.ok) {
      return {
        ok: true as const,
        pushWarning: push.message,
      };
    }
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, message: messageFromError(err) };
  }
}
