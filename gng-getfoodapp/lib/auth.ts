import { cookies } from "next/headers";
import {
  findSubscriberByEmail,
  getSubscriberById,
  isActiveSubscriber,
} from "@/lib/subscriber";
import { SESSION_COOKIE } from "@/lib/session";
import type { Subscriber } from "@/types/subscriber";

export type SignInResult = { ok: true } | { ok: false; message: string };

async function setSession(subscriberId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, subscriberId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function signInWithEmail(email: string): Promise<SignInResult> {
  const subscriber = await findSubscriberByEmail(email);

  if (!subscriber) {
    return {
      ok: false,
      message: "No account found for that email. Check spelling or contact GNG.",
    };
  }

  if (!isActiveSubscriber(subscriber)) {
    return {
      ok: false,
      message: "This account is not active. Contact GNG to renew your subscription.",
    };
  }

  await setSession(subscriber.id);
  return { ok: true };
}

export async function getSessionSubscriber(): Promise<Subscriber | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const subscriber = await getSubscriberById(sessionId);
  if (!subscriber || !isActiveSubscriber(subscriber)) return null;
  return subscriber;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
