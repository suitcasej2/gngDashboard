import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Gift } from "lucide-react";

import { HarvestDetails, HarvestDetailsHeader } from "@/components/harvest/harvest-details";
import { HomeEmbeddedChat } from "@/components/home/home-embedded-chat";
import { MenuButton } from "@/components/layout/side-nav";
import { formatHarvestDateRange } from "@/lib/format";
import { rsvpChoiceLabel, subscriberHasRsvp } from "@/lib/rsvp-choices";
import { cn } from "@/lib/utils";
import type { Harvest } from "@/types/harvest";
import type { HarvestRsvp } from "@/types/rsvp";
import type { Subscriber } from "@/types/subscriber";

function impactLevel(rsvpCount: number): string {
  if (rsvpCount >= 16) return "Harvest hero";
  if (rsvpCount >= 6) return "Regular";
  return "New member";
}

function HomeActions({
  subscriber,
  harvest,
  rsvp,
  chatOpen,
}: {
  subscriber: Subscriber;
  harvest: Harvest | null;
  rsvp: HarvestRsvp | null;
  chatOpen: boolean;
}) {
  const hasRsvp = subscriberHasRsvp(rsvp);

  return (
    <section className="flex flex-1 flex-col bg-background px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-4 lg:px-10 lg:py-8 xl:px-14">
      <div className="mb-5 flex shrink-0 items-center justify-between rounded-2xl bg-background px-1 py-2 lg:mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Gift className="size-4 text-primary" />
          <span>Good Neighbor Gardens</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-foreground">
          <Check className="size-3.5" />
          {impactLevel(subscriber.rsvpCount)}
        </span>
      </div>

      {harvest ? (
        <div className="space-y-4 lg:max-w-md">
          <HarvestDetailsHeader harvest={harvest} />

          <Link
            href="/harvest/rsvp"
            className={cn(
              "group flex h-16 items-center justify-between rounded-full px-6 text-white shadow-lg transition-transform active:scale-[0.98] lg:h-[4.25rem] lg:px-8",
              hasRsvp
                ? "bg-[var(--brand-brown)] hover:bg-[color-mix(in_oklab,var(--brand-brown),white_8%)]"
                : "bg-[var(--brand-green)] hover:bg-[color-mix(in_oklab,var(--brand-green),white_10%)]"
            )}
          >
            <span className="text-base font-medium lg:text-lg">
              {hasRsvp ? "Update RSVP" : "RSVP to this harvest"}
            </span>
            <span className="flex size-10 items-center justify-center rounded-full bg-white/15 lg:size-11">
              <ArrowRight className="size-5" />
            </span>
          </Link>

          <p className="text-center text-xs text-muted-foreground lg:text-left">
            You chose:{" "}
            <span className="font-medium text-foreground">
              {rsvp?.choice ? rsvpChoiceLabel(rsvp.choice) : "—"}
            </span>
          </p>

          <HarvestDetails harvest={harvest} />

          <HomeEmbeddedChat
            harvestId={harvest.id}
            chatOpen={chatOpen}
            currentSubscriberId={subscriber.id}
            currentSubscriberAvatarUrl={subscriber.avatarUrl}
          />
        </div>
      ) : (
        <div className="rounded-2xl border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground lg:max-w-md lg:text-left">
          No published harvest right now. Check back soon.
        </div>
      )}
    </section>
  );
}

export function HomeScreen({
  subscriber,
  harvest,
  rsvp,
  chatOpen,
}: {
  subscriber: Subscriber;
  harvest: Harvest | null;
  rsvp: HarvestRsvp | null;
  chatOpen: boolean;
}) {
  const firstName = subscriber.fullName.split(" ")[0]?.toUpperCase() ?? "FRIEND";
  const pickupLabel = harvest
    ? formatHarvestDateRange(harvest.startDate, harvest.endDate)
    : null;
  const heroSrc = harvest?.headerImageUrl ?? "/HeaderImage.png";

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background lg:flex-row">
      <section className="relative min-h-[58dvh] shrink-0 overflow-hidden lg:sticky lg:top-0 lg:min-h-dvh lg:flex-1">
        <Image
          src={heroSrc}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        <div className="relative flex h-full min-h-[58dvh] flex-col px-4 pb-8 pt-[max(env(safe-area-inset-top),1rem)] lg:min-h-dvh lg:px-10 lg:pb-12 lg:pt-8 xl:px-14">
          <div className="flex items-start justify-between">
            <MenuButton variant="overlay" />
            {harvest && (
              <span className="rounded-full bg-[#faf9f7]/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm lg:text-sm">
                {subscriber.bankedBoxCount > 0
                  ? `${subscriber.bankedBoxCount} banked`
                  : pickupLabel}
              </span>
            )}
          </div>

          <div className="mt-auto space-y-2 lg:max-w-xl lg:space-y-4">
            <h1 className="font-heading text-4xl leading-none tracking-tight text-white drop-shadow-sm lg:text-5xl xl:text-6xl">
              HEY, {firstName}.
            </h1>
            <p className="max-w-[18rem] text-sm leading-relaxed text-white/90 drop-shadow-sm lg:max-w-md lg:text-base xl:max-w-lg xl:text-lg">
              {harvest
                ? harvest.urgentUpdate ?? harvest.description
                : "Your next harvest will appear here when it's published."}
            </p>
          </div>
        </div>
      </section>

      <div
        id="home-panel-scroll"
        className="w-full lg:w-[min(28rem,38vw)] lg:max-h-dvh lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-border/60 xl:w-[min(32rem,34vw)]"
      >
        <HomeActions
          subscriber={subscriber}
          harvest={harvest}
          rsvp={rsvp}
          chatOpen={chatOpen}
        />
      </div>
    </div>
  );
}
