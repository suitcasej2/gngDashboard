import { cookies } from "next/headers";

import { isAdminEmail } from "@/lib/admin-emails";
import { getSubscriberById } from "@/lib/subscriber";
import type { Subscriber } from "@/types/subscriber";

export const ADMIN_SESSION_COOKIE = "gng-admin-session";

/** Shorter than subscriber sessions — re-auth with Face ID periodically. */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export async function setAdminSession(subscriberId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, subscriberId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSessionSubscriber(): Promise<Subscriber | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const subscriber = await getSubscriberById(sessionId);
  if (!subscriber || !isAdminEmail(subscriber.email)) return null;

  return subscriber;
}
