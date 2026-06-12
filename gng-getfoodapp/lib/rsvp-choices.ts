import type { RsvpChoice } from "@/types/rsvp";

export const MAX_BANKED_BOXES = 2;

/** Airtable single-select labels on Harvest RSVPs → RSVP Choice */
const AIRTABLE_RSVP_LABELS: Record<RsvpChoice, string> = {
  receive: "Receive",
  gift: "Gift",
  donate: "Donate",
  bank: "Bank",
  redeem: "Redeem Banked Box",
};

export function toAirtableRsvpChoice(choice: RsvpChoice): string {
  return AIRTABLE_RSVP_LABELS[choice];
}

export function fromAirtableRsvpChoice(raw: string | null): RsvpChoice | null {
  if (!raw) return null;
  const lower = raw.trim().toLowerCase();
  for (const [value, label] of Object.entries(AIRTABLE_RSVP_LABELS) as [
    RsvpChoice,
    string,
  ][]) {
    if (label.toLowerCase() === lower) return value;
  }
  return (Object.keys(AIRTABLE_RSVP_LABELS) as RsvpChoice[]).find(
    (value) => value === lower
  ) ?? null;
}

export const RSVP_CHOICES: { value: RsvpChoice; label: string }[] = [
  { value: "receive", label: "Receive my box" },
  { value: "gift", label: "Gift my box" },
  { value: "donate", label: "Donate my box" },
  { value: "bank", label: "Bank my box" },
  { value: "redeem", label: "Redeem a banked box" },
];

export function canBankAnotherBox(bankedBoxCount: number): boolean {
  return bankedBoxCount < MAX_BANKED_BOXES;
}

/** Choices shown in the RSVP form for this subscriber. */
export function getAvailableRsvpChoices(
  bankedBoxCount: number,
  existingChoice?: RsvpChoice | null
) {
  return RSVP_CHOICES.filter((choice) => {
    if (choice.value !== "bank") return true;
    if (canBankAnotherBox(bankedBoxCount)) return true;
    return existingChoice === "bank";
  });
}

export function rsvpChoiceLabel(choice: RsvpChoice): string {
  return RSVP_CHOICES.find((c) => c.value === choice)?.label ?? choice;
}

export function rsvpConfirmationTitle(choice: RsvpChoice): string {
  switch (choice) {
    case "receive":
      return "Receive Confirmed";
    case "gift":
      return "Gift Confirmed";
    case "donate":
      return "Donation Confirmed";
    case "bank":
      return "Bank Confirmed";
    case "redeem":
      return "Redeem Confirmed";
  }
}

export function rsvpConfirmationMessage(
  choice: RsvpChoice,
  harvestName: string,
  firstName: string
): string {
  const greeting = firstName ? `Hi ${firstName}, ` : "";
  switch (choice) {
    case "receive":
      return `${greeting}you're all set — we've saved your choice to receive your harvest box for ${harvestName}.`;
    case "gift":
      return `${greeting}you're all set — we've saved your choice to gift your harvest box for ${harvestName}.`;
    case "donate":
      return `${greeting}thank you — we've saved your choice to donate your harvest box for ${harvestName}.`;
    case "bank":
      return `${greeting}you're all set — we've saved your choice to bank your harvest box for ${harvestName}.`;
    case "redeem":
      return `${greeting}you're all set — we've confirmed that you redeemed a banked box for ${harvestName}.`;
  }
}

export function isRsvpChoice(value: string | null | undefined): value is RsvpChoice {
  return Boolean(value && value in AIRTABLE_RSVP_LABELS);
}

/** True when this subscriber already has a choice saved for the harvest. */
export function subscriberHasRsvp(rsvp: { choice: RsvpChoice | null } | null) {
  return Boolean(rsvp?.choice);
}
