export type RsvpChoice = "receive" | "gift" | "donate" | "bank" | "redeem";

export type HarvestRsvp = {
  id: string;
  harvestId: string;
  subscriberId: string;
  choice: RsvpChoice | null;
  needsDelivery: boolean;
  shippingAddress: string | null;
  giftRecipientName: string | null;
  notes: string | null;
};

export type SubmitRsvpInput = {
  harvestId: string;
  choice: RsvpChoice;
  needsDelivery?: boolean;
  shippingAddress?: string;
  giftRecipientName?: string;
};
