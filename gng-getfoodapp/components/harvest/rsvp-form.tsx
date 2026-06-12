"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitRsvpAction } from "@/app/actions/rsvp";
import {
  getAvailableRsvpChoices,
  MAX_BANKED_BOXES,
} from "@/lib/rsvp-choices";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HarvestRsvp, RsvpChoice } from "@/types/rsvp";

export function RsvpForm({
  harvestId,
  existing,
  bankedBoxCount,
}: {
  harvestId: string;
  existing: HarvestRsvp | null;
  bankedBoxCount: number;
}) {
  const router = useRouter();
  const [choice, setChoice] = useState<RsvpChoice>(existing?.choice ?? "receive");
  const [needsDelivery, setNeedsDelivery] = useState(existing?.needsDelivery ?? false);
  const [shippingAddress, setShippingAddress] = useState(existing?.shippingAddress ?? "");
  const [giftRecipientName, setGiftRecipientName] = useState(
    existing?.giftRecipientName ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableChoices = useMemo(
    () => getAvailableRsvpChoices(bankedBoxCount, existing?.choice),
    [bankedBoxCount, existing?.choice]
  );

  const bankOptionHidden =
    bankedBoxCount >= MAX_BANKED_BOXES && existing?.choice !== "bank";

  useEffect(() => {
    if (!availableChoices.some((c) => c.value === choice)) {
      setChoice("receive");
    }
  }, [availableChoices, choice]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitRsvpAction({
        harvestId,
        choice,
        needsDelivery,
        shippingAddress: needsDelivery ? shippingAddress : undefined,
        giftRecipientName: choice === "gift" ? giftRecipientName : undefined,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      const params = new URLSearchParams({
        choice,
        harvestId,
      });
      router.push(`/harvest/rsvp/confirmed?${params.toString()}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save RSVP</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {bankOptionHidden && (
        <Alert>
          <AlertTitle>Banking unavailable</AlertTitle>
          <AlertDescription>
            You already have {MAX_BANKED_BOXES} banked boxes. Choose another option
            for this harvest.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Your choice</Label>
        <Select value={choice} onValueChange={(v) => setChoice(v as RsvpChoice)}>
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableChoices.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {choice === "gift" && (
        <div className="space-y-2">
          <Label htmlFor="giftRecipient">Gift recipient name</Label>
          <Input
            id="giftRecipient"
            className="h-12"
            value={giftRecipientName}
            onChange={(e) => setGiftRecipientName(e.target.value)}
            required
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={needsDelivery}
          onChange={(e) => setNeedsDelivery(e.target.checked)}
          className="size-4 rounded border-input"
        />
        I need home delivery
      </label>

      {needsDelivery && (
        <div className="space-y-2">
          <Label htmlFor="shippingAddress">Shipping address</Label>
          <Input
            id="shippingAddress"
            className="h-12"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
          />
        </div>
      )}

      <Button type="submit" className="h-12 w-full" disabled={isPending}>
        {isPending ? "Saving…" : existing?.choice ? "Update RSVP" : "Submit RSVP"}
      </Button>
    </form>
  );
}
