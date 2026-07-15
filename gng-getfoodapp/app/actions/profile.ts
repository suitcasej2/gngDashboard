"use server";

import { revalidatePath } from "next/cache";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { updateSubscriberProfile } from "@/lib/subscriber";

export async function updateProfileAction(input: {
  phone: string;
  address: string;
}) {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) {
    return { ok: false as const, message: "Please sign in." };
  }

  if (!input.phone.trim() || !input.address.trim()) {
    return { ok: false as const, message: "Phone and address are required." };
  }

  try {
    const updated = await updateSubscriberProfile(subscriber.id, {
      phone: input.phone.trim(),
      address: input.address.trim(),
      deliveryPreference: subscriber.deliveryPreference,
    });

    if (!updated) {
      return { ok: false as const, message: "Could not update profile." };
    }

    revalidatePath("/profile");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: friendlyAirtableError(e) };
  }
}
