import {
  getAirtableBase,
  getHarvestMessagesTableName,
  getMessageBodyField,
  getMessageHarvestLinkField,
} from "@/lib/airtable";
import { notifyCeoMessage } from "@/lib/push-notifications";

export async function postCeoHarvestMessage(input: {
  harvestId: string;
  body: string;
}) {
  const body = input.body.trim();
  if (!body) {
    throw new Error("Message cannot be empty.");
  }

  const base = getAirtableBase();
  const tableName = getHarvestMessagesTableName();
  const harvestLink = getMessageHarvestLinkField();
  const messageField = getMessageBodyField();

  const record = await base(tableName).create({
    [messageField]: body,
    [harvestLink]: [input.harvestId],
  });

  void notifyCeoMessage(body, input.harvestId);

  return { id: record.id };
}
