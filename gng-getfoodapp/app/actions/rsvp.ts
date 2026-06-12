"use server";

import { revalidatePath } from "next/cache";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { getHarvestById } from "@/lib/harvest";
import { canBankAnotherBox, MAX_BANKED_BOXES } from "@/lib/rsvp-choices";
import { getRsvpForSubscriber, upsertRsvp } from "@/lib/rsvp";
import type { SubmitRsvpInput } from "@/types/rsvp";

export async function submitRsvpAction(input: SubmitRsvpInput) {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) {
    return { ok: false as const, message: "Please sign in to RSVP." };
  }

  const harvest = await getHarvestById(input.harvestId);
  if (!harvest) {
    return { ok: false as const, message: "Harvest not found." };
  }

  if (harvest.status !== "Published") {
    return {
      ok: false as const,
      message: "RSVPs are only open for the current published harvest.",
    };
  }

  if (input.choice === "gift" && !input.giftRecipientName?.trim()) {
    return { ok: false as const, message: "Gift recipient name is required." };
  }

  if (input.needsDelivery && !input.shippingAddress?.trim()) {
    return { ok: false as const, message: "Shipping address is required for delivery." };
  }

  if (input.choice === "bank" && !canBankAnotherBox(subscriber.bankedBoxCount)) {
    const existing = await getRsvpForSubscriber(input.harvestId, subscriber.id);
    if (existing?.choice !== "bank") {
      return {
        ok: false as const,
        message: `You already have the maximum number of banked boxes (${MAX_BANKED_BOXES}).`,
      };
    }
  }

  try {
    await upsertRsvp(subscriber.id, input);
    revalidatePath("/");
    revalidatePath("/harvest");
    revalidatePath("/harvest/rsvp");
    revalidatePath("/harvest/rsvp/confirmed");
    revalidatePath("/impact");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: friendlyAirtableError(e) };
  }
}
