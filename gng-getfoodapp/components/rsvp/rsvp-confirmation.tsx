import Image from "next/image";
import Link from "next/link";

import { RsvpConfetti } from "@/components/rsvp/rsvp-confetti";
import { MenuButton } from "@/components/layout/side-nav";
import { formatHarvestDateRange } from "@/lib/format";
import {
  rsvpConfirmationMessage,
  rsvpConfirmationTitle,
} from "@/lib/rsvp-choices";
import type { Harvest } from "@/types/harvest";
import type { RsvpChoice } from "@/types/rsvp";
import { Button } from "@/components/ui/button";

function formatHarvestWhen(harvest: Harvest) {
  const parts = [formatHarvestDateRange(harvest.startDate, harvest.endDate)];
  if (harvest.startTime) {
    parts.push(
      harvest.endTime
        ? `${harvest.startTime} – ${harvest.endTime}`
        : harvest.startTime
    );
  }
  return parts.join(" · ");
}

export function RsvpConfirmation({
  harvest,
  choice,
  firstName,
}: {
  harvest: Harvest;
  choice: RsvpChoice;
  firstName: string;
}) {
  const when = formatHarvestWhen(harvest);

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#faf7f2] px-4 pb-[max(env(safe-area-inset-bottom),2rem)] pt-[max(env(safe-area-inset-top),1rem)]">
      <RsvpConfetti enabled />

      <div className="absolute left-4 top-[max(env(safe-area-inset-top),1rem)] z-10">
        <MenuButton />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c4a3d]">
          You&apos;re in
        </p>
        <h1 className="mt-2 max-w-[16ch] font-heading text-4xl leading-[1.12] tracking-tight text-[#2a1f12] animate-in zoom-in-95 fade-in duration-500">
          {rsvpConfirmationTitle(choice)}
        </h1>
        <p className="mt-3 max-w-[36ch] text-base leading-relaxed text-[#4a3728] animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both delay-75">
          {rsvpConfirmationMessage(choice, harvest.name, firstName)}
        </p>
        <p className="mt-2 max-w-[36ch] text-sm text-[#5c4a3d] animate-in fade-in duration-500 fill-mode-both delay-100">
          Here&apos;s your harvest pickup details.
        </p>

        {harvest.headerImageUrl ? (
          <div className="mt-6 w-full max-w-xl overflow-hidden rounded-2xl border border-[#2a1f12]/8 bg-[#fffcf8] shadow-[0_12px_40px_-18px_rgba(42,31,18,0.45)] animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both delay-150">
            <Image
              src={harvest.headerImageUrl}
              alt={`${harvest.name} harvest`}
              width={800}
              height={450}
              className="mx-auto block h-auto max-h-[min(42vh,420px)] w-auto max-w-full object-contain"
              priority
            />
          </div>
        ) : null}

        <div className="mt-6 w-full max-w-xl rounded-[1.15rem] border border-[#2a1f12]/7 bg-white/92 px-6 py-5 text-left shadow-[0_14px_48px_-22px_rgba(42,31,18,0.35)] animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-200">
          <p className="text-xl font-bold leading-tight text-[#2a1f12]">
            {harvest.name}
          </p>
          <p className="mt-1 text-base font-medium text-[#4a3728]">{when}</p>
          {harvest.pickupLocation ? (
            <p className="mt-3 text-sm text-[#5c4a3d]">
              <span className="font-medium text-[#2a1f12]">Pickup: </span>
              {harvest.pickupLocation}
            </p>
          ) : null}
          {harvest.description ? (
            <p className="mt-3 text-sm leading-relaxed text-[#4a3728]">
              {harvest.description}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="h-12 flex-1 bg-[var(--brand-green)] text-white hover:bg-[color-mix(in_oklab,var(--brand-green),white_10%)]"
          >
            <Link href="/" prefetch={false}>
              Back to home
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 flex-1">
            <Link href="/harvest" prefetch={false}>
              All harvests
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
