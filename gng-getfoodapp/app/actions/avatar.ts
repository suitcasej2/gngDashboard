"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { updateSubscriberAvatarUrl } from "@/lib/subscriber";

async function uploadAvatarToBlob(subscriberId: string, file: File) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Avatar uploads are not configured. Contact GNG support.");
  }

  if (!file || file.size === 0) {
    throw new Error("Please choose an image file.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a PNG, JPG, or WEBP image.");
  }

  if (file.type === "image/svg+xml") {
    throw new Error("SVG uploads aren't supported. Please use PNG, JPG, or WEBP.");
  }

  const maxBytes = 4 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("That image is too large. Please use something under 4MB.");
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const blob = await put(
    `subscriber-avatars/${subscriberId}/avatar.${ext}`,
    file,
    {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    }
  );

  return blob.url;
}

export async function uploadAvatarAction(file: File) {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) {
    return { ok: false as const, message: "Please sign in." };
  }

  try {
    const url = await uploadAvatarToBlob(subscriber.id, file);
    const updated = await updateSubscriberAvatarUrl(subscriber.id, url);
    if (!updated) {
      return { ok: false as const, message: "Could not save avatar." };
    }

    revalidatePath("/profile");
    return { ok: true as const, avatarUrl: url };
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : friendlyAirtableError(e),
    };
  }
}

export async function clearAvatarAction() {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) {
    return { ok: false as const, message: "Please sign in." };
  }

  try {
    const updated = await updateSubscriberAvatarUrl(subscriber.id, null);
    if (!updated) {
      return { ok: false as const, message: "Could not reset avatar." };
    }

    revalidatePath("/profile");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: friendlyAirtableError(e) };
  }
}
