import type { Subscriber } from "@/types/subscriber";

/** Each harvest box feeds one family of four. */
export const PEOPLE_PER_BOX = 4;

/**
 * Organization-wide boxes distributed across all years of GNG operation.
 * Not derived from Airtable — this base is new; the total reflects legacy harvests.
 */
export function getTotalBoxesDistributed(): number {
  const raw = process.env.GNG_TOTAL_BOXES_DISTRIBUTED;
  if (!raw) return 13_500;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 13_500;
}

/** Estimated lbs of CO₂ kept out of the atmosphere per box (local/regenerative sourcing). */
export const CO2_LBS_PER_BOX = 25;

export const GNG_EDUCATION_PROGRAM_NAME = "Garden Education Program";

export type SubscriberImpactStats = {
  /** Harvests tracked in this portal (new Airtable base). */
  portalHarvests: number;
  /** Optional backfill for years before this portal. */
  lifetimeBoxes: number;
  /** portalHarvests + lifetimeBoxes */
  totalBoxesContributed: number;
  boxesBanked: number;
  familiesNourished: number;
  peopleFed: number;
  estimatedCarbonLbs: number;
  memberSince: string | null;
  firstHarvest: string | null;
  hasLegacyHistory: boolean;
};

export function getSubscriberImpactStats(
  subscriber: Subscriber
): SubscriberImpactStats {
  const portalHarvests = subscriber.rsvpCount;
  const lifetimeBoxes = subscriber.lifetimeBoxCount;
  const totalBoxesContributed = portalHarvests + lifetimeBoxes;
  const familiesNourished = totalBoxesContributed;
  const peopleFed = totalBoxesContributed * PEOPLE_PER_BOX;

  return {
    portalHarvests,
    lifetimeBoxes,
    totalBoxesContributed,
    boxesBanked: subscriber.bankedBoxCount,
    familiesNourished,
    peopleFed,
    estimatedCarbonLbs: totalBoxesContributed * CO2_LBS_PER_BOX,
    memberSince: subscriber.subscriptionStartDate,
    firstHarvest: subscriber.firstHarvestReceived,
    hasLegacyHistory: lifetimeBoxes > 0,
  };
}

export function formatImpactNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCarbonImpact(lbs: number): string {
  if (lbs >= 2000) {
    const tons = lbs / 2000;
    return `${tons >= 10 ? Math.round(tons) : tons.toFixed(1)} tons`;
  }
  return `${formatImpactNumber(Math.round(lbs))} lbs`;
}
