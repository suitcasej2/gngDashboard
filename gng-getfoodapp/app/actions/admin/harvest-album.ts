"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/admin";
import { deleteAlbumPhoto, listAlbumPhotosForHarvest } from "@/lib/harvest-album";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export async function listHarvestAlbumPhotosAction(harvestId: string) {
  try {
    await requireAdminSession();
    const photos = await listAlbumPhotosForHarvest(harvestId);
    return { ok: true as const, photos };
  } catch (e) {
    return { ok: false as const, message: errorMessage(e) };
  }
}

export async function deleteHarvestAlbumPhotoAction(input: {
  harvestId: string;
  photoId: string;
}) {
  try {
    await requireAdminSession();
    await deleteAlbumPhoto(input.photoId);
    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: errorMessage(e) };
  }
}
