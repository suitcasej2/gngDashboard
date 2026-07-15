"use client";

import { useEffect, useRef } from "react";
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
  highlightMessageId,
}: {
  harvestId: string;
  chatOpen: boolean;
  currentSubscriberId: string;
  currentSubscriberAvatarUrl: string | null;
  highlightMessageId?: string | null;
}) {
  const scrolledToSection = useRef<string | null>(null);

  useEffect(() => {
    if (!highlightMessageId) {
      scrolledToSection.current = null;
      return;
    }
    if (scrolledToSection.current === highlightMessageId) return;

    const section = document.getElementById("harvest-messages");
    if (!section) return;

    scrolledToSection.current = highlightMessageId;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlightMessageId]);

  return (
    <div id="harvest-messages" className="scroll-mt-4">
      <MessageThread
        harvestId={harvestId}
        initialMessages={[]}
        chatOpen={chatOpen}
        currentSubscriberId={currentSubscriberId}
        currentSubscriberAvatarUrl={currentSubscriberAvatarUrl}
        embedded
        scrollContainerId="home-panel-scroll"
        highlightMessageId={highlightMessageId}
      />
    </div>
  );
}
