import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { listAllSubscribers } from "@/lib/subscriber";
import { listDraftHarvests } from "@/lib/draft-harvests";
import { getCurrentPublishedHarvest } from "@/lib/harvest";
import { listStaffMessagesForHarvest } from "@/lib/harvest-messages";
import { listReadyOrSentHarvests } from "@/lib/outbox-harvests";
import { listLiveHarvestRsvpChoiceCounts } from "@/lib/live-harvest-rsvp-stats";
import {
  listSentGiftRecipients,
  listSentNeedsDelivery,
  listSentNonRespondersAutoDonate,
  listSentRsvpsAll,
} from "@/lib/rsvp-tables";
import { AdminDashboardTabs } from "@/components/admin/admin-dashboard-tabs";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { CeoMessagesPanel } from "@/components/admin/harvest/ceo-messages-panel";
import { DashboardRefreshButton } from "@/components/admin/dashboard-refresh-button";
import { DraftHarvestsTable } from "@/components/admin/harvest/draft-harvests-table";
import { LiveHarvestsTable } from "@/components/admin/harvest/live-harvests-table";
import { DeveloperSettingsPanel } from "@/components/admin/developer-settings-panel";
import { SubscribersTable } from "@/components/admin/subscribers-table";
import { LiveRsvpTabs } from "@/components/admin/rsvp/live-rsvp-tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HarvestMessage } from "@/types/message";

export const metadata: Metadata = {
  title: "Harvest Dashboard — GNG",
  description: "Draft harvests and publishing",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let rows: Awaited<ReturnType<typeof listDraftHarvests>> = [];
  let draftError: string | null = null;

  let outboxRows: Awaited<ReturnType<typeof listReadyOrSentHarvests>> = [];
  let outboxError: string | null = null;

  let rsvpCounts: Awaited<ReturnType<typeof listLiveHarvestRsvpChoiceCounts>> =
    [];
  let rsvpError: string | null = null;

  let deliveryRows: Awaited<ReturnType<typeof listSentNeedsDelivery>> = [];
  let giftRows: Awaited<ReturnType<typeof listSentGiftRecipients>> = [];
  let nonResponderRows: Awaited<
    ReturnType<typeof listSentNonRespondersAutoDonate>
  > = [];
  let allRsvpRows: Awaited<ReturnType<typeof listSentRsvpsAll>> = [];
  let rsvpTablesError: string | null = null;

  let subscribers: Awaited<ReturnType<typeof listAllSubscribers>> = [];
  let subscribersError: string | null = null;

  let currentHarvest: Awaited<ReturnType<typeof getCurrentPublishedHarvest>> =
    null;
  let ceoMessages: HarvestMessage[] = [];
  let ceoMessagesError: string | null = null;

  try {
    rows = await listDraftHarvests();
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Couldn’t load drafts from Airtable.";
    draftError = msg;
  }

  try {
    outboxRows = await listReadyOrSentHarvests();
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Couldn’t load ready/sent harvests from Airtable.";
    outboxError = msg;
  }

  try {
    rsvpCounts = await listLiveHarvestRsvpChoiceCounts();
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Couldn’t load RSVP stats from Airtable.";
    rsvpError = msg;
  }

  try {
    [deliveryRows, giftRows, nonResponderRows, allRsvpRows] = await Promise.all(
      [
        listSentNeedsDelivery(),
        listSentGiftRecipients(),
        listSentNonRespondersAutoDonate(),
        listSentRsvpsAll(),
      ]
    );
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Couldn’t load RSVP tables from Airtable.";
    rsvpTablesError = msg;
  }

  try {
    subscribers = await listAllSubscribers();
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Couldn't load subscribers from Airtable.";
    subscribersError = msg;
  }

  try {
    currentHarvest = await getCurrentPublishedHarvest();
    if (currentHarvest) {
      ceoMessages = await listStaffMessagesForHarvest(currentHarvest.id);
    }
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Couldn’t load Mia’s Broadcast from Airtable.";
    ceoMessagesError = msg;
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_circle_at_20%_-10%,theme(colors.primary/18),transparent_45%),radial-gradient(900px_circle_at_100%_0%,theme(colors.accent/40),transparent_40%)]">
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-6">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border bg-background/70 p-2 shadow-sm ring-1 ring-foreground/5 backdrop-blur [box-shadow:0_0_0_2px_color-mix(in_oklab,var(--brand-yellow),white_35%),0_1px_0_0_color-mix(in_oklab,var(--brand-brown),white_80%),0_10px_25px_-15px_rgba(0,0,0,0.35)]">
                <Image
                  src="/GNG.svg"
                  alt="Good Neighbor Gardens"
                  width={92}
                  height={46}
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                  Good Neighbor Gardens
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Harvest Box Dashboard
                </h1>
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <Button asChild variant="secondary" className="h-12 px-4">
                <Link href="/">Neighbor app</Link>
              </Button>
              <DashboardRefreshButton className="h-12 px-3 sm:px-4" />
              <Button asChild variant="secondary" className="h-12 px-4">
                <Link href="/admin/mass-email">Mass email</Link>
              </Button>
              <Button asChild className="h-12 px-6 text-base">
                <Link href="/admin/publish">Publish harvest</Link>
              </Button>
              <AdminSignOutButton className="h-12" />
            </div>
          </div>

          <div className="mt-4 space-y-2 sm:hidden">
            <div className="flex gap-2">
              <Button
                asChild
                variant="secondary"
                className="h-14 shrink-0 rounded-2xl px-4"
              >
                <Link href="/">App</Link>
              </Button>
              <DashboardRefreshButton className="h-14 w-14 shrink-0 rounded-2xl px-0" />
              <AdminSignOutButton className="h-14 min-w-0 flex-1 rounded-2xl px-4" />
            </div>
            <div className="flex gap-2">
              <Button
                asChild
                variant="secondary"
                className="h-14 min-w-0 flex-1 rounded-2xl"
              >
                <Link href="/admin/mass-email">Mass email</Link>
              </Button>
              <Button
                asChild
                className="h-14 min-w-0 flex-1 rounded-2xl border-2 border-foreground/15 bg-primary text-primary-foreground shadow-sm"
              >
                <Link href="/admin/publish">Publish harvest</Link>
              </Button>
            </div>
          </div>
        </header>

        <AdminDashboardTabs
          broadcast={
            ceoMessagesError ? (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t load Mia&apos;s Broadcast</AlertTitle>
                <AlertDescription>{ceoMessagesError}</AlertDescription>
              </Alert>
            ) : (
              <CeoMessagesPanel
                harvest={
                  currentHarvest
                    ? { id: currentHarvest.id, name: currentHarvest.name }
                    : null
                }
                initialMessages={ceoMessages}
              />
            )
          }
          subscribers={
            subscribersError ? (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t load neighbors</AlertTitle>
                <AlertDescription>{subscribersError}</AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Neighbors</CardTitle>
                  <CardDescription>
                    All neighbors — click the pencil to edit email or status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscribersTable initialRows={subscribers} />
                </CardContent>
              </Card>
            )
          }
          drafts={
            draftError ? (
              <Alert variant="destructive">
                <AlertTitle>Couldn’t load drafts</AlertTitle>
                <AlertDescription>
                  {draftError}
                  <br />
                  This is usually a permissions issue (your Airtable token needs
                  read access) or a table/field name mismatch.
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Draft harvests</CardTitle>
                  <CardDescription>
                    Sorted by most recently modified.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No draft harvests found.
                    </p>
                  ) : (
                    <DraftHarvestsTable rows={rows} />
                  )}
                </CardContent>
              </Card>
            )
          }
          live={
            outboxError ? (
              <Alert variant="destructive">
                <AlertTitle>Couldn’t load ready / sent harvests</AlertTitle>
                <AlertDescription>
                  {outboxError}
                  <br />
                  This is usually a permissions issue (your Airtable token needs
                  read access) or a Status option name mismatch (the filter
                  expects <span className="font-medium">Publish</span> and{" "}
                  <span className="font-medium">Sent</span>).
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Live Harvests</CardTitle>
                  <CardDescription>
                    Harvests with Status = Publish or Sent (most recently
                    modified first). Use the row menu (⋯) to send urgent
                    updates, manage the album, or change status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {outboxRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No ready/sent harvests found.
                    </p>
                  ) : (
                    <LiveHarvestsTable rows={outboxRows} />
                  )}
                </CardContent>
              </Card>
            )
          }
          rsvps={
            rsvpError || rsvpTablesError ? (
              <Alert variant="destructive">
                <AlertTitle>Couldn’t load Live Harvest RSVPs</AlertTitle>
                <AlertDescription>
                  {rsvpError ?? rsvpTablesError}
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Live Harvest RSVPs</CardTitle>
                  <CardDescription>
                    Records from{" "}
                    <span className="font-medium">Harvest RSVPs</span> where the
                    linked harvest status is{" "}
                    <span className="font-medium">Publish</span>,{" "}
                    <span className="font-medium">Published</span>, or{" "}
                    <span className="font-medium">Sent</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveRsvpTabs
                    rsvpCounts={rsvpCounts}
                    allRsvpRows={allRsvpRows}
                    deliveryRows={deliveryRows}
                    giftRows={giftRows}
                    nonResponderRows={nonResponderRows}
                  />
                </CardContent>
              </Card>
            )
          }
          developer={<DeveloperSettingsPanel />}
        />
      </div>

      <footer className="mt-10 border-t border-foreground/10 bg-[var(--brand-brown)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/85">Good Neighbor Gardens</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a
              href="https://goodneighborgardens.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/90 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/70"
            >
              goodneighborgardens.com
            </a>
            <a
              href="https://goodneighborgardens.slack.com/archives/C0AQJCUJRBQ"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/90 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/70"
            >
              Slack
            </a>
            <a
              href="https://airtable.com/appmgTpf4jbMG2dip/tblXgO5kjGWZhIZcv/viw61Kth8sqoJaCpe"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/90 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/70"
            >
              Airtable
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
