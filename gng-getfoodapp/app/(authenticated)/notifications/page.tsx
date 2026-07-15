import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AirtableErrorAlert } from "@/components/layout/airtable-error-alert";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { getSessionSubscriber } from "@/lib/auth";
import { friendlyAirtableError } from "@/lib/airtable-errors";
import { listSubscriberNotifications } from "@/lib/subscriber-notifications";
import type { SubscriberNotification } from "@/types/subscriber-notification";

export const metadata: Metadata = {
  title: "Notifications — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) redirect("/login");

  let notifications: SubscriberNotification[] = [];
  let loadError: string | null = null;

  try {
    notifications = await listSubscriberNotifications();
  } catch (e) {
    loadError = friendlyAirtableError(e);
  }

  if (loadError) {
    return (
      <AirtableErrorAlert title="Couldn't load notifications" message={loadError} />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Recent harvest updates and messages from the team.
      </p>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
