import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSessionSubscriber } from "@/lib/auth";
import { getHarvestById } from "@/lib/harvest";
import { isRsvpChoice } from "@/lib/rsvp-choices";
import { RsvpConfirmation } from "@/components/rsvp/rsvp-confirmation";

export const metadata: Metadata = {
  title: "RSVP confirmed — GNG Get Food",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  choice?: string | string[];
  harvestId?: string | string[];
}>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0]?.trim() : value?.trim();
}

export default async function RsvpConfirmedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) redirect("/login");

  const params = await searchParams;
  const choice = firstParam(params.choice);
  const harvestId = firstParam(params.harvestId);

  if (!isRsvpChoice(choice) || !harvestId) {
    redirect("/harvest");
  }

  const harvest = await getHarvestById(harvestId);
  if (!harvest) {
    redirect("/harvest");
  }

  const firstName = subscriber.fullName.split(" ")[0] ?? "";

  return (
    <RsvpConfirmation
      harvest={harvest}
      choice={choice}
      firstName={firstName}
    />
  );
}
