"use server";

import { revalidatePath } from "next/cache";
import { postCeoHarvestMessage } from "@/lib/harvest-messages";

function messageFromError(err: unknown) {
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export async function postCeoHarvestMessageAction(input: {
  harvestId: string;
  body: string;
}) {
  try {
    if (!input.harvestId?.trim()) {
      return { ok: false as const, message: "Missing harvest." };
    }

    await postCeoHarvestMessage({
      harvestId: input.harvestId.trim(),
      body: input.body,
    });

    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, message: messageFromError(err) };
  }
}
