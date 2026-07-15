import {
  getAirtableBase,
  getHarvestMessagesTableName,
  getHarvestsTableName,
  getMessageCreatedField,
  getMessageHarvestLinkField,
} from "@/lib/airtable";
import { getLinkedRecordIds } from "@/lib/airtable-fields";
import { mapMessageRecord } from "@/lib/airtable-mappers";
import { getCurrentPublishedHarvest } from "@/lib/harvest";
import type { SubscriberNotification } from "@/types/subscriber-notification";

const NOTIFICATION_LIMIT = 50;

function staffFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function messagePreview(body: string) {
  const trimmed = body.trim();
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 137)}…`;
}

async function listStaffMessageNotifications(
  currentHarvest: { id: string; name: string } | null
): Promise<SubscriberNotification[]> {
  if (!currentHarvest) return [];

  const base = getAirtableBase();
  const tableName = getHarvestMessagesTableName();
  const createdField = getMessageCreatedField();
  const harvestLink = getMessageHarvestLinkField();

  const records = await base(tableName)
    .select({
      sort: [{ field: createdField, direction: "desc" }],
      maxRecords: 200,
    })
    .all();

  const notifications: SubscriberNotification[] = [];

  for (const record of records) {
    const fields = (record.fields || {}) as Record<string, unknown>;
    const harvestIds = getLinkedRecordIds(fields, harvestLink);
    const harvestId = harvestIds[0];
    if (harvestId !== currentHarvest.id) continue;

    const message = mapMessageRecord({
      id: record.id,
      fields,
      createdTime: record._rawJson.createdTime,
    });

    if (!message.isStaff || !message.body.trim()) continue;

    const author = staffFirstName(message.authorName);

    notifications.push({
      id: `message-${message.id}`,
      type: "message",
      title: `Message from ${author}`,
      body: messagePreview(message.body),
      sentAt: message.createdAt,
      harvestId,
      harvestName: currentHarvest.name,
      messageId: message.id,
      href: `/?message=${message.id}`,
    });
  }

  return notifications;
}

async function getCurrentHarvestLiveNotification(
  harvest: NonNullable<Awaited<ReturnType<typeof getCurrentPublishedHarvest>>>
): Promise<SubscriberNotification> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();
  const record = await base(tableName).find(harvest.id);
  const fields = (record.fields || {}) as Record<string, unknown>;
  const sentAt =
    (typeof fields["Last Modified"] === "string" && fields["Last Modified"]) ||
    harvest.startDate ||
    new Date().toISOString();

  return {
    id: `harvest-live-${harvest.id}`,
    type: "harvest_live",
    title: "New harvest is live",
    body: `${harvest.name} is ready — RSVP now!`,
    sentAt,
    harvestId: harvest.id,
    harvestName: harvest.name,
    href: "/harvest/rsvp",
  };
}

export async function listSubscriberNotifications(): Promise<SubscriberNotification[]> {
  const currentHarvest = await getCurrentPublishedHarvest();

  const [messageNotifications, harvestLive] = await Promise.all([
    listStaffMessageNotifications(currentHarvest),
    currentHarvest
      ? getCurrentHarvestLiveNotification(currentHarvest)
      : Promise.resolve(null),
  ]);

  const notifications = harvestLive
    ? [harvestLive, ...messageNotifications]
    : messageNotifications;

  return notifications
    .sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    )
    .slice(0, NOTIFICATION_LIMIT);
}
