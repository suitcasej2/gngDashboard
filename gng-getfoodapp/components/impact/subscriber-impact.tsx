import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatYear } from "@/lib/format";
import type { Subscriber } from "@/types/subscriber";

export function SubscriberImpact({ subscriber }: { subscriber: Subscriber }) {
  const metrics = [
    { label: "Harvests joined", value: subscriber.rsvpCount },
    { label: "Boxes banked", value: subscriber.bankedBoxCount },
    { label: "Member since", value: formatYear(subscriber.subscriptionStartDate) },
    { label: "First harvest", value: subscriber.firstHarvestReceived ?? "—" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Your participation in the GNG food community.
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="rounded-2xl border-[#FFF904]/35 bg-background/70 backdrop-blur ring-1 ring-foreground/5"
          >
            <CardHeader className="pb-0">
              <CardTitle className="text-xs font-normal text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {subscriber.giftLog && (
        <Card className="rounded-2xl border-[#FFF904]/35 bg-background/70 backdrop-blur ring-1 ring-foreground/5">
          <CardHeader>
            <CardTitle className="text-base">Gifts shared</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{subscriber.giftLog}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
