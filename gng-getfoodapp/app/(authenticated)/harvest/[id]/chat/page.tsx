import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageThread } from "@/components/chat/message-thread";
import { AirtableErrorAlert } from "@/components/layout/airtable-error-alert";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { getHarvestById, isHarvestChatOpen } from "@/lib/harvest";
import { listMessagesForHarvest } from "@/lib/harvest-messages";
import type { HarvestMessage } from "@/types/message";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0]?.trim() : value?.trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const harvest = await getHarvestById(id);
  return {
    title: harvest ? `${harvest.name} chat` : "Harvest chat",
  };
}

export default async function HarvestChatPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const highlightMessageId = firstParam(query.message);
  const harvest = await getHarvestById(id);
  if (!harvest) notFound();

  const subscriber = await getSessionSubscriber();
  if (!subscriber) notFound();

  let messages: HarvestMessage[] = [];
  let loadError: string | null = null;

  try {
    messages = await listMessagesForHarvest(id);
  } catch (e) {
    loadError = friendlyAirtableError(e);
  }

  if (loadError) {
    return (
      <AirtableErrorAlert title="Couldn't load chat" message={loadError} />
    );
  }

  return (
    <MessageThread
      harvestId={id}
      initialMessages={messages}
      chatOpen={isHarvestChatOpen(harvest)}
      currentSubscriberId={subscriber.id}
      currentSubscriberAvatarUrl={subscriber.avatarUrl}
      highlightMessageId={highlightMessageId}
    />
  );
}
