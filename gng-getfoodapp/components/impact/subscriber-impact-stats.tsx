import { Card, CardContent } from "@/components/ui/card";
import { formatYear } from "@/lib/format";
import {
  formatCarbonImpact,
  formatImpactNumber,
  getSubscriberImpactStats,
  type SubscriberImpactStats,
} from "@/lib/impact";
import { cn } from "@/lib/utils";
import type { Subscriber } from "@/types/subscriber";

function ImpactStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card className="rounded-2xl border-[#FFF904]/35 bg-background/70 backdrop-blur ring-1 ring-foreground/5">
      <CardContent className="space-y-1 p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-heading text-3xl leading-none tracking-tight">{value}</p>
        {detail ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function personalContributionDetail(stats: SubscriberImpactStats) {
  if (stats.hasLegacyHistory && stats.portalHarvests > 0) {
    return `${formatImpactNumber(stats.lifetimeBoxes)} from earlier harvests · ${formatImpactNumber(stats.portalHarvests)} in this app`;
  }
  if (stats.hasLegacyHistory) {
    return "Including harvests from before this app";
  }
  if (stats.portalHarvests > 0) {
    return `About ${formatImpactNumber(stats.peopleFed)} people through your boxes`;
  }
  return "Your harvests here will show up as you RSVP";
}

export function SubscriberImpactStatsGrid({
  subscriber,
  showHeading = true,
  className,
}: {
  subscriber: Subscriber;
  showHeading?: boolean;
  className?: string;
}) {
  const stats = getSubscriberImpactStats(subscriber);

  return (
    <section className="space-y-3">
      {showHeading ? (
        <h2 className="font-heading text-sm uppercase tracking-wide text-muted-foreground">
          Your contribution
        </h2>
      ) : null}
      <div className={cn("grid grid-cols-2 gap-3", className)}>
        <ImpactStat
          label="Families nourished"
          value={formatImpactNumber(stats.familiesNourished)}
          detail={personalContributionDetail(stats)}
        />
        <ImpactStat
          label="Harvests in this app"
          value={formatImpactNumber(stats.portalHarvests)}
          detail={
            stats.firstHarvest
              ? `First tracked harvest ${formatYear(stats.firstHarvest)}`
              : "Tracked from your RSVPs here"
          }
        />
        <ImpactStat
          label="Boxes banked"
          value={formatImpactNumber(stats.boxesBanked)}
          detail="Saved for a future harvest"
        />
        <ImpactStat
          label="Carbon impact"
          value={
            stats.totalBoxesContributed > 0
              ? formatCarbonImpact(stats.estimatedCarbonLbs)
              : "—"
          }
          detail="Estimated CO₂ kept out of the atmosphere"
        />
      </div>
    </section>
  );
}
