/** Subscriber-visible harvest statuses (Published = live, Completed = past). */
export type SubscriberHarvestStatus = "Published" | "Completed";

export type Harvest = {
  id: string;
  name: string;
  description: string;
  pickupLocation: string;
  textMeNumber: string;
  boxContents: string;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  recipeTitle: string | null;
  recipeUrl: string | null;
  bbSponsorName: string | null;
  bbMessage: string | null;
  bbImageUrl: string | null;
  storageTips: string | null;
  headerImageUrl: string | null;
  status: SubscriberHarvestStatus;
  urgentUpdate: string | null;
};
