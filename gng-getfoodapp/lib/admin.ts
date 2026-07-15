import { isAdminEmail } from "@/lib/admin-emails";
import { getAdminSessionSubscriber } from "@/lib/admin-session";
import { getSessionSubscriber } from "@/lib/auth";
import type { Subscriber } from "@/types/subscriber";

export { getAdminEmails, isAdminEmail } from "@/lib/admin-emails";

export function isAdminSubscriber(subscriber: Subscriber): boolean {
  return isAdminEmail(subscriber.email);
}

/** Admin dashboard access — requires passkey session (Face ID). */
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

/** Enrollment only — subscriber email session + allowlisted admin email. */
export async function requireAdminEnrollmentSession(): Promise<Subscriber> {
  const subscriber = await getSessionSubscriber();
  if (!subscriber || !isAdminSubscriber(subscriber)) {
    throw new Error("Sign in with your admin email before setting up Face ID.");
  }
  return subscriber;
}
