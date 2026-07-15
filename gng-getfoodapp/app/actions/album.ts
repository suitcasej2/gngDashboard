"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { getHarvestById } from "@/lib/harvest";
import {
  countAlbumPhotosForSubscriber,
  createAlbumPhoto,
  MAX_ALBUM_PHOTOS_PER_SUBSCRIBER,
} from "@/lib/harvest-album";

const MAX_BYTES = 8 * 1024 * 1024;

async function uploadAlbumPhotoToBlob(
  harvestId: string,
  subscriberId: string,
  file: File
) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Photo uploads are not configured. Contact GNG support.");
  }

  if (!file || file.size === 0) {
    throw new Error("Please choose a photo.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a PNG, JPG, or WEBP photo.");
  }

  if (file.type === "image/svg+xml") {
    throw new Error("SVG uploads aren't supported. Please use PNG, JPG, or WEBP.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("That photo is too large. Please use something under 8MB.");
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";

  const blob = await put(
    `harvest-album/${harvestId}/${subscriberId}/${Date.now()}.${ext}`,
    file,
    {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    }
  );

  return blob.url;
}

export async function uploadHarvestAlbumPhotoAction(input: {
  harvestId: string;
  file: File;
  caption?: string;
}) {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) {
    return { ok: false as const, message: "Please sign in." };
  }

  const harvest = await getHarvestById(input.harvestId);
  if (!harvest) {
    return { ok: false as const, message: "Harvest not found." };
  }

  try {
    const existingCount = await countAlbumPhotosForSubscriber(
      input.harvestId,
      subscriber.id
    );

    if (existingCount >= MAX_ALBUM_PHOTOS_PER_SUBSCRIBER) {
      return {
        ok: false as const,
        message: `You can share up to ${MAX_ALBUM_PHOTOS_PER_SUBSCRIBER} photos per harvest.`,
      };
    }

    const imageUrl = await uploadAlbumPhotoToBlob(
      input.harvestId,
      subscriber.id,
      input.file
    );

    const photo = await createAlbumPhoto({
      harvestId: input.harvestId,
      subscriberId: subscriber.id,
      imageUrl,
      caption: input.caption,
    });

    revalidatePath("/community-photos");
    revalidatePath(`/harvest/${input.harvestId}/album`);
    revalidatePath("/");

    return { ok: true as const, photo };
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : friendlyAirtableError(e),
    };
  }
}
