import {
  GraduationCap,
  Leaf,
  Sprout,
} from "lucide-react";

import { SubscriberImpactStatsGrid } from "@/components/impact/subscriber-impact-stats";
import { Card, CardContent } from "@/components/ui/card";
import { formatYear } from "@/lib/format";
import {
  formatCarbonImpact,
  formatImpactNumber,
  getSubscriberImpactStats,
  getTotalBoxesDistributed,
  GNG_EDUCATION_PROGRAM_NAME,
  PEOPLE_PER_BOX,
} from "@/lib/impact";
import type { Subscriber } from "@/types/subscriber";

function ImpactPillar({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Leaf;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-[#FFF904]/35 bg-background/70 backdrop-blur ring-1 ring-foreground/5">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Icon className="size-5" />
          </span>
          <h2 className="font-heading text-base leading-tight">{title}</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
      </CardContent>
    </Card>
  );
}

export function SubscriberImpact({ subscriber }: { subscriber: Subscriber }) {
  const firstName = subscriber.fullName.split(/\s+/)[0] ?? "Neighbor";
  const stats = getSubscriberImpactStats(subscriber);
  const communityTotal = getTotalBoxesDistributed();
  const communityFamilies = communityTotal;
  const communityPeople = communityTotal * PEOPLE_PER_BOX;

  return (
    <div className="-mt-4 space-y-8">
      <section className="space-y-2">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Hey {firstName} — you&apos;re part of a food community that&apos;s been
          nourishing San Diego for years. Each harvest box holds enough food for{" "}
          <span className="font-medium text-foreground">
            one family of {PEOPLE_PER_BOX}
          </span>
          , and every box supports local farmers, healthy soil, and garden
          education for kids.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-sm uppercase tracking-wide text-muted-foreground">
          Years of community impact
        </h2>
        <Card className="overflow-hidden rounded-2xl border-[#FFF904]/50 bg-[color-mix(in_oklab,var(--brand-green),white_92%)] ring-1 ring-foreground/5">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start gap-3">
              <img
                src="/flower.png"
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0 -mt-[10px]"
              />
              <div className="space-y-2">
                <p className="font-heading text-2xl leading-none tracking-tight text-[var(--brand-brown)]">
                  {formatImpactNumber(communityTotal)}+ boxes distributed
                </p>
                <p className="text-sm leading-relaxed text-[var(--brand-brown)]/80">
                  Across years of harvests, Good Neighbor Gardens has moved more
                  than {formatImpactNumber(communityTotal)} boxes — enough food
                  for {formatImpactNumber(communityFamilies)} families and
                  roughly {formatImpactNumber(communityPeople)} neighbors, with
                  San Diego farmers at the heart of it all.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <SubscriberImpactStatsGrid
        subscriber={subscriber}
        className="lg:grid-cols-4"
      />

      <section className="space-y-3">
        <h2 className="font-heading text-sm uppercase tracking-wide text-muted-foreground">
          What your boxes make possible
        </h2>
        <div className="space-y-3">
          <ImpactPillar icon={Sprout} title="San Diego farmers">
            Your participation keeps local growers at the center of our food
            system. Every box you receive, share, or donate supports small-scale
            farmers across San Diego County and keeps fresh, seasonal food
            circulating in our neighborhoods.
          </ImpactPillar>

          <ImpactPillar icon={Leaf} title="Climate & soil health">
            Shorter, more local food chains and regenerative growing practices
            help pull carbon into healthy soil and keep it out of the atmosphere.
            {stats.totalBoxesContributed > 0 ? (
              <>
                {" "}
                Your boxes represent an estimated{" "}
                <span className="font-medium text-foreground">
                  {formatCarbonImpact(stats.estimatedCarbonLbs)}
                </span>{" "}
                of climate benefit — and counting.
              </>
            ) : (
              " Every harvest you join adds to that impact."
            )}
          </ImpactPillar>

          <ImpactPillar icon={GraduationCap} title={GNG_EDUCATION_PROGRAM_NAME}>
            A portion of every harvest box helps offset the cost of our{" "}
            {GNG_EDUCATION_PROGRAM_NAME} for 1st–6th graders across San Diego.
            Students learn to grow, harvest, and share food in school gardens —
            building the next generation of land stewards.
          </ImpactPillar>
        </div>
      </section>

      {stats.memberSince ? (
        <p className="text-center text-xs text-muted-foreground">
          You&apos;ve been with GNG since {formatYear(stats.memberSince)}. Thank
          you for showing up harvest after harvest.
        </p>
      ) : null}

      {subscriber.giftLog ? (
        <section className="space-y-3">
          <h2 className="font-heading text-sm uppercase tracking-wide text-muted-foreground">
            Gifts you&apos;ve shared
          </h2>
          <Card className="rounded-2xl border-[#FFF904]/35 bg-background/70 backdrop-blur ring-1 ring-foreground/5">
            <CardContent className="p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {subscriber.giftLog}
              </p>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
