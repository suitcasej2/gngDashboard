"use client";

import dynamic from "next/dynamic";
const MessageThread = dynamic(
  () =>
    import("@/components/chat/message-thread").then((mod) => mod.MessageThread),
  {
    ssr: false,
    loading: () => <div className="min-h-24 rounded-2xl bg-muted/30" aria-hidden />,
  }
);

export function HomeEmbeddedChat({
  harvestId,
  chatOpen,
  currentSubscriberId,
  currentSubscriberAvatarUrl,
}: {
  harvestId: string;
  chatOpen: boolean;
  currentSubscriberId: string;
  currentSubscriberAvatarUrl: string | null;
}) {
  return (
    <MessageThread
      harvestId={harvestId}
      initialMessages={[]}
      chatOpen={chatOpen}
      currentSubscriberId={currentSubscriberId}
      currentSubscriberAvatarUrl={currentSubscriberAvatarUrl}
      embedded
      scrollContainerId="home-panel-scroll"
    />
  );
}
