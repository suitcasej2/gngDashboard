import Link from "next/link";
import { Bell, ChevronRight, Leaf, MessageSquare } from "lucide-react";

import { formatMessageTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SubscriberNotification } from "@/types/subscriber-notification";

function NotificationIcon({ type }: { type: SubscriberNotification["type"] }) {
  if (type === "message") {
    return <MessageSquare className="size-4 shrink-0" />;
  }
  return <Leaf className="size-4 shrink-0" />;
}

export function NotificationsList({
  notifications,
}: {
  notifications: SubscriberNotification[];
}) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-background/70 px-4 py-10 text-center ring-1 ring-foreground/5">
        <Bell className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="text-sm font-medium">No notifications yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Harvest updates and messages from the team will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <Link
            href={notification.href}
            className={cn(
              "flex items-start gap-3 rounded-2xl border bg-background/70 px-4 py-3 ring-1 ring-foreground/5 transition-colors hover:bg-muted/40",
              notification.type === "message" &&
                "border-[#FFF904]/30 bg-[#FFF904]/8"
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                notification.type === "message"
                  ? "bg-[#FFF904]/35 text-foreground"
                  : "bg-primary/15 text-foreground"
              )}
            >
              <NotificationIcon type={notification.type} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <p className="font-medium leading-tight">{notification.title}</p>
                <time
                  dateTime={notification.sentAt}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatMessageTime(notification.sentAt)}
                </time>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {notification.body}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {notification.harvestName}
              </p>
            </div>

            <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
