import { isAdminEmail } from "@/lib/admin-emails";
import { getAdminSessionSubscriber } from "@/lib/admin-session";
import { getSessionSubscriber } from "@/lib/auth";
import type { Subscriber } from "@/types/subscriber";

export { getAdminEmails, isAdminEmail } from "@/lib/admin-emails";

/** Admin access: allowlisted email OR Subscription Status = Staff. */
export function isAdminSubscriber(subscriber: Subscriber): boolean {
  return (
    isAdminEmail(subscriber.email) ||
    subscriber.subscriptionStatus === "Staff"
  );
}

/** Admin dashboard access — requires passkey session (Face ID / passkey). */
export async function getSessionAdmin(): Promise<Subscriber | null> {
  return getAdminSessionSubscriber();
}

export async function requireAdminSession(): Promise<Subscriber> {
  const admin = await getSessionAdmin();
  if (!admin) {
    throw new Error("You do not have access to the admin dashboard.");
  }
  return admin;
}

/** Enrollment — subscriber session must be an admin (email allowlist or Staff). */
export async function requireAdminEnrollmentSession(): Promise<Subscriber> {
  const subscriber = await getSessionSubscriber();
  if (!subscriber || !isAdminSubscriber(subscriber)) {
    throw new Error(
      "Sign in with a Staff account (or an allowlisted admin email) before setting up a passkey."
    );
  }
  return subscriber;
}
