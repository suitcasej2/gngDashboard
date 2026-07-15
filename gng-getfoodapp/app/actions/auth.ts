"use server";

import { clearAdminSession } from "@/lib/admin-session";
import { clearSession, signInWithEmail } from "@/lib/auth";

export async function signInAction(email: string) {
  return signInWithEmail(email);
}

export async function logoutAction() {
  await clearAdminSession();
  await clearSession();
  return { ok: true as const };
}

export async function adminLogoutAction() {
  await clearAdminSession();
  return { ok: true as const };
}
