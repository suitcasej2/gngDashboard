"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import type { HarvestMessage } from "@/types/message";
import { formatMessageTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const POLL_MS = 10_000;
const SCROLL_TOP_THRESHOLD = 320;

function mergePolledMessages(
  current: HarvestMessage[],
  fetched: HarvestMessage[]
): HarvestMessage[] {
  const fetchedIds = new Set(fetched.map((message) => message.id));
  const pending = current.filter(
    (message) =>
      message.id.startsWith("optimistic_") && !fetchedIds.has(message.id)
  );
  return [...fetched, ...pending].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

async function fetchMessages(
  harvestId: string,
  signal?: AbortSignal
): Promise<{
  messages: HarvestMessage[];
  chatOpen: boolean;
} | null> {
  try {
    const res = await fetch(`/api/harvest/${harvestId}/messages`, {
      cache: "no-store",
      signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      messages: HarvestMessage[];
      chatOpen: boolean;
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return null;
    return null;
  }
}

async function postMessage(harvestId: string, body: string) {
  try {
    const res = await fetch(`/api/harvest/${harvestId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const json = (await res.json()) as {
      message?: HarvestMessage;
      error?: string;
    };
    if (!res.ok) {
      return { ok: false as const, message: json.error ?? "Could not post message." };
    }
    if (!json.message) {
      return { ok: false as const, message: "Could not post message." };
    }
    return { ok: true as const, message: json.message };
  } catch {
    return {
      ok: false as const,
      message: "Could not reach the server. Check your connection and try again.",
    };
  }
}

export function MessageThread({
  harvestId,
  initialMessages,
  chatOpen,
  currentSubscriberId,
  currentSubscriberAvatarUrl,
  embedded = false,
  scrollContainerId,
}: {
  harvestId: string;
  initialMessages: HarvestMessage[];
  chatOpen: boolean;
  currentSubscriberId: string;
  currentSubscriberAvatarUrl: string | null;
  /** Inline layout for home screen — grows with content, no fixed height */
  embedded?: boolean;
  /** Element id of scroll parent on desktop (e.g. home right panel) */
  scrollContainerId?: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const getScrollPosition = useCallback(() => {
    if (embedded && scrollContainerId) {
      const panel = document.getElementById(scrollContainerId);
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (panel && isDesktop) return panel.scrollTop;
    }
    return window.scrollY;
  }, [embedded, scrollContainerId]);

  const scrollToTop = useCallback(() => {
    if (embedded && scrollContainerId) {
      const panel = document.getElementById(scrollContainerId);
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (panel && isDesktop) {
        panel.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [embedded, scrollContainerId]);

  useEffect(() => {
    if (!chatOpen) return;

    let cancelled = false;
    const controller = new AbortController();

    async function poll() {
      if (cancelled || document.visibilityState !== "visible") return;
      const result = await fetchMessages(harvestId, controller.signal);
      if (!cancelled && result) {
        setMessages((prev) => mergePolledMessages(prev, result.messages));
      }
    }

    void poll();
    const id = window.setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [harvestId, chatOpen]);

  useEffect(() => {
    if (!embedded) return;

    function handleScroll() {
      const next = getScrollPosition() > SCROLL_TOP_THRESHOLD;
      setShowBackToTop((prev) => (prev === next ? prev : next));
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    const panel = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : null;
    panel?.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      panel?.removeEventListener("scroll", handleScroll);
    };
  }, [embedded, getScrollPosition, scrollContainerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const optimistic: HarvestMessage = {
      id: `optimistic_${Date.now()}`,
      harvestId,
      subscriberId: currentSubscriberId,
      authorName: "You",
      authorAvatarUrl: currentSubscriberAvatarUrl,
      body: body.trim(),
      isStaff: false,
      createdAt: new Date().toISOString(),
    };

    setIsPosting(true);
    setMessages((prev) => [...prev, optimistic]);
    const draft = body;
    setBody("");

    const result = await postMessage(harvestId, draft);
    setIsPosting(false);

    if (!result.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setBody(draft);
      setError(result.message);
      return;
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === optimistic.id ? result.message : m))
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3",
        embedded ? "min-h-0" : "min-h-[50dvh] gap-4 lg:min-h-[calc(100dvh-10rem)]"
      )}
    >
      {!embedded && !chatOpen && (
        <Alert>
          <AlertTitle>Chat closed</AlertTitle>
          <AlertDescription>
            This harvest is completed. You can read past messages but cannot post new ones.
          </AlertDescription>
        </Alert>
      )}

      {embedded && (
        <p className="text-sm font-medium text-foreground">Harvest chat</p>
      )}

      <div
        className={cn(
          "space-y-3 rounded-2xl border bg-background/70 p-3 ring-1 ring-foreground/5",
          !embedded && "flex-1 overflow-y-auto lg:p-4"
        )}
      >
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.subscriberId === currentSubscriberId;
            const displayName = isOwn ? "You" : message.authorName;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-[92%] items-end gap-2",
                  isOwn ? "ml-auto" : "mr-auto"
                )}
              >
                <ProfileAvatar
                  avatarUrl={message.authorAvatarUrl}
                  name={displayName}
                  size={32}
                  className="mb-0.5"
                />
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-2xl px-3 py-2 text-sm",
                    message.isStaff
                      ? "border border-[#FFF904]/40 bg-[#FFF904]/15"
                      : isOwn
                        ? "bg-primary/15"
                        : "bg-muted"
                  )}
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {displayName}
                    </span>
                    {message.isStaff && (
                      <span className="rounded bg-[#FFF904]/50 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase">
                        GNG
                      </span>
                    )}
                    <span>{formatMessageTime(message.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {chatOpen && (
        <form onSubmit={handleSubmit} className="space-y-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Textarea
            placeholder="Add a comment…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={cn("min-h-16", embedded && "min-h-14 text-sm")}
          />
          <Button
            type="submit"
            className={cn(
              "h-12 w-full bg-[var(--brand-brown)] text-white hover:bg-[color-mix(in_oklab,var(--brand-brown),white_8%)]",
              embedded && "h-10"
            )}
            disabled={isPosting || !body.trim()}
          >
            {isPosting ? "Sending…" : "Post comment"}
          </Button>
        </form>
      )}

      {embedded && showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-30 inline-flex size-12 items-center justify-center rounded-full bg-[var(--brand-brown)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
    </div>
  );
}
