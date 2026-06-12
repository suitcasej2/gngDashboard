import {
  getAirtableBase,
  getHarvestMessagesTableName,
  getMessageBodyField,
  getMessageCreatedField,
  getMessageHarvestLinkField,
  getMessageSubscriberLinkField,
} from "@/lib/airtable";
import { getLinkedRecordIds } from "@/lib/airtable-fields";
import { mapMessageRecord } from "@/lib/airtable-mappers";
import { notifyCeoMessage } from "@/lib/push-notifications";
import { getSubscriberAvatarsByIds } from "@/lib/subscriber";
import type { HarvestMessage } from "@/types/message";

async function enrichMessagesWithAvatars(
  messages: HarvestMessage[]
): Promise<HarvestMessage[]> {
  const subscriberIds = messages
    .map((message) => message.subscriberId)
    .filter((id): id is string => Boolean(id));
  const avatars = await getSubscriberAvatarsByIds(subscriberIds);

  return messages.map((message) => ({
    ...message,
    authorAvatarUrl: message.subscriberId
      ? (avatars[message.subscriberId] ?? null)
      : null,
  }));
}

export async function listMessagesForHarvest(
  harvestId: string
): Promise<HarvestMessage[]> {
  const base = getAirtableBase();
  const tableName = getHarvestMessagesTableName();
  const createdField = getMessageCreatedField();
  const harvestLink = getMessageHarvestLinkField();

  const records = await base(tableName)
    .select({
      sort: [{ field: createdField, direction: "asc" }],
    })
    .all();

  const messages = records
    .filter((record) => {
      const harvestIds = getLinkedRecordIds(
        (record.fields || {}) as Record<string, unknown>,
        harvestLink
      );
      return harvestIds.includes(harvestId);
    })
    .map((record) =>
      mapMessageRecord({
        id: record.id,
        fields: (record.fields || {}) as Record<string, unknown>,
        createdTime: record._rawJson.createdTime,
      })
    )
    .filter((message) => message.body.trim().length > 0);

  return enrichMessagesWithAvatars(messages);
}

export async function postHarvestMessage(input: {
  harvestId: string;
  subscriberId: string;
  body: string;
}): Promise<HarvestMessage> {
  const base = getAirtableBase();
  const tableName = getHarvestMessagesTableName();
  const harvestLink = getMessageHarvestLinkField();
  const subscriberLink = getMessageSubscriberLinkField();
  const messageField = getMessageBodyField();

  const record = await base(tableName).create({
    [messageField]: input.body.trim(),
    [harvestLink]: [input.harvestId],
    [subscriberLink]: [input.subscriberId],
  });

  const [message] = await enrichMessagesWithAvatars([
    mapMessageRecord({
      id: record.id,
      fields: (record.fields || {}) as Record<string, unknown>,
      createdTime: record._rawJson.createdTime,
    }),
  ]);

  return message;
}

/** For future CEO dashboard integration — staff posts into the same thread. */
export async function postStaffHarvestMessage(input: {
  harvestId: string;
  body: string;
}): Promise<HarvestMessage> {
  const base = getAirtableBase();
  const tableName = getHarvestMessagesTableName();
  const harvestLink = getMessageHarvestLinkField();
  const messageField = getMessageBodyField();

  const body = input.body.trim();

  const record = await base(tableName).create({
    [messageField]: body,
    [harvestLink]: [input.harvestId],
  });

  void notifyCeoMessage(body);

  return mapMessageRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
    createdTime: record._rawJson.createdTime,
  });
}
