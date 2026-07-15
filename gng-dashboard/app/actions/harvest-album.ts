"use server";

import { revalidatePath } from "next/cache";

import { deleteAlbumPhoto, listAlbumPhotosForHarvest } from "@/lib/harvest-album";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export async function listHarvestAlbumPhotosAction(harvestId: string) {
  try {
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
    await deleteAlbumPhoto(input.photoId);
    revalidatePath("/");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, message: errorMessage(e) };
  }
}
