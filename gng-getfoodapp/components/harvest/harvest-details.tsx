import Image from "next/image";
import { Calendar, MapPin, Package } from "lucide-react";

import { formatHarvestDateRange } from "@/lib/format";
import type { Harvest } from "@/types/harvest";

export function HarvestDetailsHeader({ harvest }: { harvest: Harvest }) {
  const timeLabel =
    harvest.startTime && harvest.endTime
      ? `${harvest.startTime} – ${harvest.endTime}`
      : null;

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">Current harvest</p>
      <h2 className="font-heading text-2xl leading-tight">{harvest.name}</h2>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5 shrink-0" />
          {formatHarvestDateRange(harvest.startDate, harvest.endDate)}
        </span>
        {timeLabel && (
          <>
            <span aria-hidden>·</span>
            <span>{timeLabel}</span>
          </>
        )}
      </div>
    </div>
  );
}

function BreadAndButterJam({ harvest }: { harvest: Harvest }) {
  const hasContent =
    Boolean(harvest.bbSponsorName?.trim()) ||
    Boolean(harvest.bbMessage?.trim()) ||
    Boolean(harvest.bbImageUrl?.trim());

  if (!hasContent) return null;

  return (
    <div className="rounded-xl bg-muted/50 px-3 py-3">
      <div className="flex gap-3">
        {harvest.bbImageUrl ? (
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={harvest.bbImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : null}
        <div className="min-w-0 space-y-1">
          <p className="font-medium">Bread &amp; Butter Jam</p>
          {harvest.bbSponsorName?.trim() ? (
            <p className="text-sm text-muted-foreground">
              From {harvest.bbSponsorName.trim()}
            </p>
          ) : null}
          {harvest.bbMessage?.trim() ? (
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {harvest.bbMessage.trim()}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function HarvestDetails({
  harvest,
  showUrgentUpdate = false,
}: {
  harvest: Harvest;
  showUrgentUpdate?: boolean;
}) {
  return (
    <div className="space-y-4">
      {showUrgentUpdate && harvest.urgentUpdate && (
        <p className="rounded-xl border border-[#FFF904]/40 bg-[#FFF904]/12 px-3 py-2 text-sm font-medium">
          {harvest.urgentUpdate}
        </p>
      )}

      {harvest.description && (
        <p className="text-sm leading-relaxed text-foreground/90">
          {harvest.description}
        </p>
      )}

      <div className="space-y-3 border-t border-border/60 pt-4 text-sm">
        {(harvest.pickupLocation || harvest.textMeNumber) && (
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">Pickup</p>
              {harvest.pickupLocation ? (
                <p className="text-muted-foreground">{harvest.pickupLocation}</p>
              ) : null}
              {harvest.textMeNumber ? (
                <p className={harvest.pickupLocation ? "mt-1" : ""}>
                  <span className="text-muted-foreground">Text me at this number: </span>
                  <a
                    href={`tel:${harvest.textMeNumber.replace(/[^\d+]/g, "")}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {harvest.textMeNumber}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        )}

        {harvest.boxContents && (
          <div className="flex gap-3">
            <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">In your box</p>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {harvest.boxContents}
              </p>
            </div>
          </div>
        )}

        <BreadAndButterJam harvest={harvest} />

        {harvest.recipeTitle && (
          <div className="rounded-xl bg-muted/50 px-3 py-3">
            <p className="font-medium">Featured recipe</p>
            {harvest.recipeUrl ? (
              <a
                href={harvest.recipeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                {harvest.recipeTitle}
              </a>
            ) : (
              <p className="text-muted-foreground">{harvest.recipeTitle}</p>
            )}
          </div>
        )}

        {harvest.storageTips && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Storage tips: </span>
            {harvest.storageTips}
          </p>
        )}
      </div>
    </div>
  );
}
