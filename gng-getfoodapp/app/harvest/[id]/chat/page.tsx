import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionSubscriber } from "@/lib/auth";
import { getHarvestById, isHarvestChatOpen } from "@/lib/harvest";
import { listMessagesForHarvest } from "@/lib/harvest-messages";
import { AppShell } from "@/components/layout/app-shell";
import { MessageThread } from "@/components/chat/message-thread";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const harvest = await getHarvestById(id);
  return {
    title: harvest ? `${harvest.name} chat` : "Harvest chat",
  };
}

export default async function HarvestChatPage({ params }: Props) {
  const { id } = await params;
  const harvest = await getHarvestById(id);
  if (!harvest) notFound();

  const subscriber = await getSessionSubscriber();
  if (!subscriber) notFound();

  const messages = await listMessagesForHarvest(id);

  return (
    <AppShell title={harvest.name} wide>
      <MessageThread
        harvestId={id}
        initialMessages={messages}
        chatOpen={isHarvestChatOpen(harvest)}
        currentSubscriberId={subscriber.id}
        currentSubscriberAvatarUrl={subscriber.avatarUrl}
      />
    </AppShell>
  );
}
