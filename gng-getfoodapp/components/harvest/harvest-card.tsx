import Image from "next/image";
import { Calendar, MessageCircle } from "lucide-react";

import { NavLink } from "@/components/layout/nav-link";

import { HarvestDetails } from "@/components/harvest/harvest-details";
import { RsvpCta } from "@/components/harvest/rsvp-cta";
import { formatHarvestDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Harvest } from "@/types/harvest";
import type { HarvestRsvp } from "@/types/rsvp";

function statusLabel(status: Harvest["status"]) {
  return status === "Published" ? "Current harvest" : "Past harvest";
}

export function HarvestCard({
  harvest,
  showChatLink = false,
  rsvp,
}: {
  harvest: Harvest;
  showChatLink?: boolean;
  /** When set on the current harvest, shows the RSVP button in the card body */
  rsvp?: HarvestRsvp | null;
}) {
  const imageSrc = harvest.headerImageUrl ?? "/HeaderImage.jpg";
  const dateLabel = formatHarvestDateRange(harvest.startDate, harvest.endDate);
  const timeLabel =
    harvest.startTime && harvest.endTime
      ? `${harvest.startTime} – ${harvest.endTime}`
      : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm ring-1 ring-foreground/5">
      <div className="relative aspect-[4/5] w-full bg-muted sm:aspect-[5/4]">
        <Image
          src={imageSrc}
          alt=""
          fill
          className={cn(
            "object-cover",
            harvest.status === "Completed" && "grayscale"
          )}
          sizes="(max-width: 640px) 100vw, 36rem"
          priority={harvest.status === "Published"}
        />
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 className="font-heading text-xl leading-tight tracking-tight">
              {harvest.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5 shrink-0" />
                {dateLabel}
              </span>
              {timeLabel && (
                <>
                  <span aria-hidden>·</span>
                  <span>{timeLabel}</span>
                </>
              )}
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide",
              harvest.status === "Published"
                ? "bg-primary/15 text-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {statusLabel(harvest.status)}
          </span>
        </div>

        {rsvp !== undefined && harvest.status === "Published" && (
          <RsvpCta existing={rsvp} />
        )}

        <HarvestDetails
          harvest={harvest}
          showUrgentUpdate={harvest.status === "Published"}
        />

        {showChatLink && (
          <Button asChild variant="outline" className="h-11 w-full rounded-xl">
            <NavLink href={`/harvest/${harvest.id}/chat`}>
              <MessageCircle className="size-4" />
              Open harvest chat
            </NavLink>
          </Button>
        )}
      </div>
    </article>
  );
}
