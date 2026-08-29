"use server";

import { isAdminSubscriber } from "@/lib/admin";
import { clearSession, getSessionSubscriber, signInWithEmail } from "@/lib/auth";

export async function signInForAdminEnrollAction(email: string) {
  const result = await signInWithEmail(email.trim());
  if (!result.ok) return result;

  const subscriber = await getSessionSubscriber();
  if (!subscriber || !isAdminSubscriber(subscriber)) {
    await clearSession();
    return {
      ok: false as const,
      message:
        "That email can sign into the app, but isn’t Staff/admin. Set Subscription Status to Staff in Airtable, or add the email to GNG_ADMIN_EMAILS on Vercel.",
    };
  }

  return {
    ok: true as const,
    name: subscriber.fullName || subscriber.email,
    email: subscriber.email,
  };
}
