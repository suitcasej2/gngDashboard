import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { listDraftHarvests } from "@/lib/draft-harvests";
import { listReadyOrSentHarvests } from "@/lib/outbox-harvests";
import { listLiveHarvestRsvpChoiceCounts } from "@/lib/live-harvest-rsvp-stats";
import { listSentGiftRecipients, listSentNeedsDelivery, listSentNonRespondersAutoDonate } from "@/lib/rsvp-tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DraftHarvestsTable } from "@/components/harvest/draft-harvests-table";
import { LiveHarvestsTable } from "@/components/harvest/live-harvests-table";
import { RsvpChoiceChart } from "@/components/harvest/rsvp-choice-chart";
import { GiftRecipientsTable, NeedsDeliveryTable, NonRespondersTable } from "@/components/rsvp/rsvp-tables";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "CEO Harvest Dashboard",
  description: "Draft harvests and publishing",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let rows: Awaited<ReturnType<typeof listDraftHarvests>> = [];
  let draftError: string | null = null;

  let outboxRows: Awaited<ReturnType<typeof listReadyOrSentHarvests>> = [];
  let outboxError: string | null = null;

  let rsvpCounts: Awaited<ReturnType<typeof listLiveHarvestRsvpChoiceCounts>> = [];
  let rsvpError: string | null = null;

  let deliveryRows: Awaited<ReturnType<typeof listSentNeedsDelivery>> = [];
  let giftRows: Awaited<ReturnType<typeof listSentGiftRecipients>> = [];
  let nonResponderRows: Awaited<ReturnType<typeof listSentNonRespondersAutoDonate>> = [];
  let rsvpTablesError: string | null = null;

  try {
    rows = await listDraftHarvests();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Couldn’t load drafts from Airtable.";
    draftError = msg;
  }

  try {
    outboxRows = await listReadyOrSentHarvests();
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Couldn’t load ready/sent harvests from Airtable.";
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
    [deliveryRows, giftRows, nonResponderRows] = await Promise.all([
      listSentNeedsDelivery(),
      listSentGiftRecipients(),
      listSentNonRespondersAutoDonate(),
    ]);
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Couldn’t load RSVP tables from Airtable.";
    rsvpTablesError = msg;
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_circle_at_20%_-10%,theme(colors.primary/18),transparent_45%),radial-gradient(900px_circle_at_100%_0%,theme(colors.accent/40),transparent_40%)]">
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-6">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border bg-background/70 p-2 shadow-sm ring-1 ring-foreground/5 backdrop-blur">
                <Image src="/GNG.svg" alt="Good Neighbor Gardens" width={92} height={46} priority />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                  Good Neighbor Gardens
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">Harvest Box Dashboard</h1>
              </div>
            </div>

            <div className="hidden sm:block">
              <Button asChild className="h-12 px-6 text-base">
                <Link href="/publish">Publish a new Harvest</Link>
              </Button>
            </div>
          </div>

          <div className="mt-4 sm:hidden">
            <Button
              asChild
              className="h-14 w-full rounded-2xl border-2 border-foreground/15 bg-primary text-primary-foreground shadow-sm"
            >
              <Link href="/publish">Publish a new Harvest</Link>
            </Button>
          </div>

          <div className="mt-4">
            <div className="rounded-2xl border bg-background/60 p-3 shadow-sm ring-1 ring-foreground/5 backdrop-blur">
              <div className="rounded-xl border-2 border-foreground/10 bg-[linear-gradient(180deg,theme(colors.accent/35),theme(colors.background))] p-3">
                <p className="text-sm text-foreground/90">
                  Quick view of <span className="font-semibold">Drafts</span>,{" "}
                  <span className="font-semibold">Live Harvests</span>, and{" "}
                  <span className="font-semibold">RSVP operations</span>.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6">
          {draftError ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn’t load drafts</AlertTitle>
              <AlertDescription>
                {draftError}
                <br />
                This is usually a permissions issue (your Airtable token needs read access) or a table/field name mismatch.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Draft harvests</CardTitle>
                <CardDescription>Sorted by most recently modified.</CardDescription>
              </CardHeader>
              <CardContent>
                {rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No draft harvests found.</p>
                ) : (
                  <DraftHarvestsTable rows={rows} />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8">
          {outboxError ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn’t load ready / sent harvests</AlertTitle>
              <AlertDescription>
                {outboxError}
                <br />
                This is usually a permissions issue (your Airtable token needs read access) or a Status option name mismatch
                (the filter expects <span className="font-medium">Ready to Send</span> and <span className="font-medium">Sent</span>).
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Live Harvests</CardTitle>
                <CardDescription>
                  Harvests with Status = Ready to Send or Sent (most recently modified first). Use the row menu (⋯) to
                  open <span className="font-medium">Send Urgent Message</span> and update fields for that harvest.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {outboxRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No ready/sent harvests found.</p>
                ) : (
                  <LiveHarvestsTable rows={outboxRows} />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8">
          {rsvpError || rsvpTablesError ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn’t load Live Harvest RSVPs</AlertTitle>
              <AlertDescription>{rsvpError ?? rsvpTablesError}</AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Live Harvest RSVPs</CardTitle>
                <CardDescription>
                  Records from <span className="font-medium">Harvest RSVPs</span> where the linked harvest status is{" "}
                  <span className="font-medium">Sent</span>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="live" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="live">Live RSVPs</TabsTrigger>
                    <TabsTrigger value="delivery">Needs delivery</TabsTrigger>
                    <TabsTrigger value="gifts">Gift recipients</TabsTrigger>
                    <TabsTrigger value="nonresponders">Non responders</TabsTrigger>
                  </TabsList>

                  <TabsContent value="live" className="mt-4">
                    {rsvpCounts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No matching RSVPs found.</p>
                    ) : (
                      <RsvpChoiceChart data={rsvpCounts} />
                    )}
                  </TabsContent>

                  <TabsContent value="delivery" className="mt-4">
                    {deliveryRows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No delivery-needed RSVPs found.</p>
                    ) : (
                      <NeedsDeliveryTable rows={deliveryRows} />
                    )}
                  </TabsContent>

                  <TabsContent value="gifts" className="mt-4">
                    {giftRows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No gift recipient RSVPs found.</p>
                    ) : (
                      <GiftRecipientsTable rows={giftRows} />
                    )}
                  </TabsContent>

                  <TabsContent value="nonresponders" className="mt-4">
                    {nonResponderRows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No non-responders found.</p>
                    ) : (
                      <NonRespondersTable rows={nonResponderRows} />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
