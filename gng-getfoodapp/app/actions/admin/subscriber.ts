"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { adminUpdateSubscriber } from "@/lib/subscriber";
import type { SubscriptionStatus } from "@/types/subscriber";

const VALID_STATUSES: SubscriptionStatus[] = [
  "Active",
  "Staff",
  "Inactive",
  "Deposit only",
  "Subscription only",
];

export async function adminUpdateSubscriberAction(input: {
  subscriberId: string;
  email?: string;
  subscriptionStatus?: string;
}) {
  try {
    await requireAdminSession();

    if (!input.subscriberId) {
      return { ok: false as const, message: "Missing subscriber ID." };
    }

    if (
      input.subscriptionStatus !== undefined &&
      !VALID_STATUSES.includes(input.subscriptionStatus as SubscriptionStatus)
    ) {
      return { ok: false as const, message: "Invalid subscription status." };
    }

    if (input.email !== undefined) {
      const e = input.email.trim();
      if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
        return { ok: false as const, message: "Enter a valid email address." };
      }
    }

    const updated = await adminUpdateSubscriber(input.subscriberId, {
      email: input.email,
      subscriptionStatus: input.subscriptionStatus,
    });

    if (!updated) {
      return { ok: false as const, message: "No changes were made." };
    }

    revalidatePath("/admin");
    return { ok: true as const, subscriber: updated };
  } catch (e) {
    return { ok: false as const, message: friendlyAirtableError(e) };
  }
}
