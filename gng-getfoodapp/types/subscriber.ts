export type SubscriptionStatus =
  | "Active"
  | "Inactive"
  | "Deposit only"
  | "Subscription only";

export type Subscriber = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  deliveryPreference: string;
  subscriptionStatus: SubscriptionStatus;
  depositPaid: boolean;
  subscriptionStartDate: string | null;
  firstHarvestReceived: string | null;
  rsvpCount: number;
  /** Boxes from years before this portal/Airtable base (optional backfill field). */
  lifetimeBoxCount: number;
  bankedBoxes: number;
  bankedBoxCount: number;
  giftLog: string;
  /** Custom photo URL; null = default GNG logo on yellow */
  avatarUrl: string | null;
};
