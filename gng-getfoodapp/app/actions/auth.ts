"use server";

import { clearSession, signInWithEmail } from "@/lib/auth";

export async function signInAction(email: string) {
  return signInWithEmail(email);
}

export async function logoutAction() {
  await clearSession();
  return { ok: true as const };
}
