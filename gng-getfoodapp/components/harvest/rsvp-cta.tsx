import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { rsvpChoiceLabel, subscriberHasRsvp } from "@/lib/rsvp-choices";
import { cn } from "@/lib/utils";
import type { HarvestRsvp, RsvpChoice } from "@/types/rsvp";

export function RsvpCta({ existing }: { existing: HarvestRsvp | null }) {
  const hasRsvp = subscriberHasRsvp(existing);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Link
        href="/harvest/rsvp"
        className={cn(
          "group inline-flex h-9 items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 text-white shadow-sm transition-transform active:scale-[0.98]",
          hasRsvp
            ? "bg-[var(--brand-brown)] hover:bg-[color-mix(in_oklab,var(--brand-brown),white_8%)]"
            : "bg-[var(--brand-green)] hover:bg-[color-mix(in_oklab,var(--brand-green),white_10%)]"
        )}
      >
        <span className="text-xs font-medium">
          {hasRsvp ? "Update RSVP" : "RSVP"}
        </span>
        <span className="flex size-7 items-center justify-center rounded-full bg-white/15">
          <ArrowRight className="size-3.5" />
        </span>
      </Link>
      {existing?.choice && (
        <p className="text-right text-xs text-muted-foreground">
          You chose:{" "}
          <span className="font-medium text-foreground">
            {rsvpChoiceLabel(existing.choice as RsvpChoice)}
          </span>
        </p>
      )}
    </div>
  );
}
