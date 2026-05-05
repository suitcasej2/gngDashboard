"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { RsvpChoiceCount } from "@/lib/live-harvest-rsvp-stats";
import type { AllRsvpRow, DeliveryRow, GiftRecipientRow, NonResponderRow } from "@/lib/rsvp-tables";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RsvpChoiceChart } from "@/components/harvest/rsvp-choice-chart";
import { AllRsvpsTable, GiftRecipientsTable, NeedsDeliveryTable, NonRespondersTable } from "@/components/rsvp/rsvp-tables";

export function LiveRsvpTabs(props: {
  rsvpCounts: RsvpChoiceCount[];
  allRsvpRows: AllRsvpRow[];
  deliveryRows: DeliveryRow[];
  giftRows: GiftRecipientRow[];
  nonResponderRows: NonResponderRow[];
}) {
  const { rsvpCounts, allRsvpRows, deliveryRows, giftRows, nonResponderRows } = props;
  const [value, setValue] = useState("live");
  const lastScrollY = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (lastScrollY.current == null) return;
    window.scrollTo({ top: lastScrollY.current, left: 0, behavior: "instant" as any });
    lastScrollY.current = null;
  }, [value]);

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        lastScrollY.current = window.scrollY;
        setValue(next);
      }}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="live">Live RSVPs</TabsTrigger>
        <TabsTrigger value="delivery">Needs delivery</TabsTrigger>
        <TabsTrigger value="gifts">Gift recipients</TabsTrigger>
        <TabsTrigger value="nonresponders">Non responders</TabsTrigger>
      </TabsList>

      <TabsContent value="live" className="mt-4">
        {rsvpCounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matching RSVPs found.</p>
        ) : (
          <RsvpChoiceChart data={rsvpCounts} />
        )}

        <div className="mt-6">
          {allRsvpRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No RSVPs found.</p>
          ) : (
            <AllRsvpsTable rows={allRsvpRows} />
          )}
        </div>
      </TabsContent>

      <TabsContent value="delivery" className="mt-4">
        {deliveryRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No delivery-needed RSVPs found.</p>
        ) : (
          <NeedsDeliveryTable rows={deliveryRows} />
        )}
      </TabsContent>

      <TabsContent value="gifts" className="mt-4">
        {giftRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No gift recipient RSVPs found.</p>
        ) : (
          <GiftRecipientsTable rows={giftRows} />
        )}
      </TabsContent>

      <TabsContent value="nonresponders" className="mt-4">
        {nonResponderRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No non-responders found.</p>
        ) : (
          <NonRespondersTable rows={nonResponderRows} />
        )}
      </TabsContent>
    </Tabs>
  );
}

