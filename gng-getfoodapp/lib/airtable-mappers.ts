import {
  getHarvestNameField,
  getMessageAuthorLookupField,
  getMessageBodyField,
  getMessageHarvestLinkField,
  getMessageCreatedField,
  getMessageSubscriberLinkField,
  getRsvpHarvestLinkField,
  getSubscriberAvatarField,
} from "@/lib/airtable";
import {
  getCheckboxField,
  getDateField,
  getFirstLinkedRecordId,
  getHarvestNameFromFields,
  getLongTextField,
  getLookupStringField,
  getNumberField,
  getSingleSelectField,
  getStringField,
} from "@/lib/airtable-fields";
import type { Harvest, SubscriberHarvestStatus } from "@/types/harvest";
import type { HarvestMessage } from "@/types/message";
import { fromAirtableRsvpChoice } from "@/lib/rsvp-choices";
import type { HarvestRsvp } from "@/types/rsvp";
import type { Subscriber, SubscriptionStatus } from "@/types/subscriber";

export function mapAirtableStatusToSubscriber(
  raw: string | null
): SubscriberHarvestStatus | null {
  if (!raw) return null;
  const s = raw.trim();
  if (s === "Completed") return "Completed";
  if (s === "Published" || s === "Publish" || s === "Sent") return "Published";
  return null;
}

export function mapSubscriberHarvestRecord(input: {
  id: string;
  fields: Record<string, unknown>;
}): Harvest | null {
  const f = input.fields;
  const status = mapAirtableStatusToSubscriber(getSingleSelectField(f, "Status"));
  if (!status) return null;

  return {
    id: input.id,
    name: getHarvestNameFromFields(f, getHarvestNameField()),
    description: getLongTextField(f, "Harvest Description") ?? "",
    pickupLocation: getStringField(f, "Pickup Location") ?? "",
    boxContents: getLongTextField(f, "Box Contents") ?? "",
    startDate: getDateField(f, "Start Date"),
    endDate: getDateField(f, "End Date"),
    startTime: getStringField(f, "Start Time"),
    endTime: getStringField(f, "End Time"),
    recipeTitle: getStringField(f, "Featured Recipe Title"),
    recipeUrl: getStringField(f, "Recipe URL"),
    storageTips: getLongTextField(f, "Storage Tips"),
    headerImageUrl: getStringField(f, "Header Image URL"),
    status,
    urgentUpdate: getLongTextField(f, "Urgent Update"),
  };
}

export function mapSubscriberRecord(input: {
  id: string;
  fields: Record<string, unknown>;
}): Subscriber {
  const f = input.fields;
  const status =
    (getSingleSelectField(f, "Subscription Status") as SubscriptionStatus | null) ??
    "Inactive";

  return {
    id: input.id,
    fullName: getStringField(f, "Full Name") ?? "Subscriber",
    email: getStringField(f, "Email") ?? "",
    phone: getStringField(f, "Phone") ?? "",
    address: getLongTextField(f, "Address") ?? "",
    deliveryPreference: getStringField(f, "Delivery Preference") ?? "",
    subscriptionStatus: status,
    depositPaid: getCheckboxField(f, "Deposit Paid"),
    subscriptionStartDate: getDateField(f, "Subscription Start Date"),
    firstHarvestReceived: getDateField(f, "First Harvest Received"),
    rsvpCount: getNumberField(f, "RSVPs"),
    bankedBoxes: getNumberField(f, "Banked Boxes"),
    bankedBoxCount: getNumberField(f, "Banked Box Count"),
    giftLog: getLongTextField(f, "Gift Log") ?? "",
    avatarUrl: getStringField(f, getSubscriberAvatarField()) || null,
  };
}

export function mapRsvpRecord(input: {
  id: string;
  fields: Record<string, unknown>;
}): HarvestRsvp {
  const f = input.fields;
  return {
    id: input.id,
    harvestId:
      getFirstLinkedRecordId(f, getRsvpHarvestLinkField()) ??
      getFirstLinkedRecordId(f, "Harvest") ??
      "",
    subscriberId: getFirstLinkedRecordId(f, "Subscriber") ?? "",
    choice: fromAirtableRsvpChoice(getSingleSelectField(f, "RSVP Choice")),
    needsDelivery: getCheckboxField(f, "Needs Delivery?"),
    shippingAddress: getLongTextField(f, "Shipping Address"),
    giftRecipientName: getStringField(f, "Gift Recipient Name"),
    notes: getLongTextField(f, "Notes"),
  };
}

export function mapMessageRecord(input: {
  id: string;
  fields: Record<string, unknown>;
  createdTime?: string;
}): HarvestMessage {
  const f = input.fields;
  const created =
    getStringField(f, getMessageCreatedField()) ??
    getStringField(f, "Created") ??
    input.createdTime ??
    new Date().toISOString();

  const subscriberId = getFirstLinkedRecordId(
    f,
    getMessageSubscriberLinkField()
  );
  const authorFromLookup = getLookupStringField(
    f,
    getMessageAuthorLookupField()
  );

  return {
    id: input.id,
    harvestId: getFirstLinkedRecordId(f, getMessageHarvestLinkField()) ?? "",
    subscriberId,
    authorName: authorFromLookup ?? (subscriberId ? "Subscriber" : "GNG Team"),
    authorAvatarUrl: null,
    body: getLongTextField(f, getMessageBodyField()) ?? "",
    isStaff: !subscriberId,
    createdAt: created,
  };
}
