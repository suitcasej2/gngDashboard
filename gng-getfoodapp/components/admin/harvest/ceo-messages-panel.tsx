"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MessageSquare } from "lucide-react";

import { postCeoHarvestMessageAction } from "@/app/actions/admin/harvest-messages";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMessageTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HarvestMessage } from "@/types/message";

type CeoMessagesPanelProps = {
  harvest: { id: string; name: string } | null;
  initialMessages: HarvestMessage[];
};

function staffDisplayName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function CeoMessagesPanel({ harvest, initialMessages }: CeoMessagesPanelProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionWarning, setActionWarning] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function handlePost() {
    if (!harvest || !draft.trim()) return;

    setActionError(null);
    setActionWarning(null);
    setActionSuccess(null);

    start(async () => {
      const res = await postCeoHarvestMessageAction({
        harvestId: harvest.id,
        body: draft,
      });

      if (!res.ok) {
        setActionError(res.message);
        return;
      }

      setDraft("");
      router.refresh();

      if ("pushWarning" in res && res.pushWarning) {
        setActionWarning(res.pushWarning);
      } else {
        setActionSuccess("Message posted and push notification sent.");
      }
    });
  }

  return (
    <Card className="overflow-hidden border-[#FFF904]/35">
      <CardHeader className="border-b border-[#FFF904]/25 bg-[linear-gradient(180deg,rgba(255,249,4,0.22),rgba(255,249,4,0.06),transparent)] pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4" />
          CEO messages
        </CardTitle>
        <CardDescription>
          {harvest ? (
            <>
              Post to the chat for{" "}
              <span className="font-medium text-foreground">{harvest.name}</span> and
              notify subscribers.
            </>
          ) : (
            "No live harvest right now. Publish a harvest or set status to Publish/Sent to send messages."
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {actionSuccess ? (
          <Alert>
            <AlertTitle>Message sent</AlertTitle>
            <AlertDescription>{actionSuccess}</AlertDescription>
          </Alert>
        ) : null}

        {actionWarning ? (
          <Alert>
            <AlertTitle>Saved, but push failed</AlertTitle>
            <AlertDescription>{actionWarning}</AlertDescription>
          </Alert>
        ) : null}

        {actionError ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t post message</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        ) : null}

        {harvest ? (
          <div className="space-y-2">
            <Label htmlFor="ceo-compose">New message</Label>
            <Textarea
              id="ceo-compose"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              placeholder="Write a message for subscribers…"
              className="min-h-28 resize-y text-base"
              disabled={pending}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                className="h-12 px-6"
                disabled={pending || !draft.trim()}
                onClick={handlePost}
              >
                {pending ? "Sending…" : "Post message"}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-3 text-left transition-colors hover:bg-muted/35"
            onClick={() => setHistoryOpen((open) => !open)}
            aria-expanded={historyOpen}
          >
            <span className="text-sm font-medium">
              Message history
              {sortedMessages.length > 0 ? (
                <span className="ml-2 font-normal text-muted-foreground">
                  ({sortedMessages.length})
                </span>
              ) : null}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                historyOpen && "rotate-180"
              )}
              aria-hidden
            />
          </button>

          {historyOpen ? (
            sortedMessages.length === 0 ? (
              <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                {harvest
                  ? "No CEO messages for this harvest yet."
                  : "Messages will appear here once a live harvest is available."}
              </p>
            ) : (
              <ul className="space-y-2">
                {sortedMessages.map((message) => (
                  <li
                    key={message.id}
                    className="rounded-xl border border-[#FFF904]/30 bg-[#FFF904]/10 px-3 py-3"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {staffDisplayName(message.authorName)}
                      </span>
                      <span>{formatMessageTime(message.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
