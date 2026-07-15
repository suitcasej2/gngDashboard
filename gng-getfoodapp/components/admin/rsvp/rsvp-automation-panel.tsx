"use client";

import { useEffect, useState, useTransition } from "react";

import {
  previewRsvpAutomationAction,
  runRsvpAutomationJobAction,
} from "@/app/actions/admin/rsvp-automation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  RunnableRsvpJob,
  RsvpAutomationPreview,
  RsvpAutomationResult,
} from "@/lib/rsvp-automation";

const JOB_LABELS: Record<RunnableRsvpJob, string> = {
  friday_reminder: "Friday reminder",
  monday_reminder: "Monday reminder",
  auto_donate: "Day-of auto-Donate",
};

function formatResult(result: RsvpAutomationResult) {
  const lines = [
    `Job: ${result.job}`,
    result.dryRun ? "Mode: dry run (no writes)" : "Mode: live",
    result.harvestName
      ? `Harvest: ${result.harvestName}`
      : "Harvest: (none)",
    `Non-responders: ${result.nonResponderCount}`,
  ];

  if (result.job === "auto_donate") {
    lines.push(`Donate rows created: ${result.autoDonateCreated}`);
  }

  if (result.push) {
    if (result.push.ok) {
      lines.push(`Push: sent (${result.push.notificationId})`);
    } else if (result.push.skipped) {
      lines.push(`Push: skipped — ${result.push.message}`);
    } else {
      lines.push(`Push: failed — ${result.push.message}`);
    }
  }

  if (result.skippedReason) {
    lines.push(result.skippedReason);
  }

  return lines.join("\n");
}

export function RsvpAutomationPanel() {
  const [preview, setPreview] = useState<RsvpAutomationPreview | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadPreview() {
    startTransition(async () => {
      setError(null);
      const res = await previewRsvpAutomationAction();
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setPreview(res.preview);
    });
  }

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  function runJob(job: RunnableRsvpJob, dryRun: boolean, force: boolean) {
    if (!dryRun && job === "auto_donate") {
      const ok = window.confirm(
        force
          ? "Force auto-Donate now? This creates Donate RSVPs for every Active subscriber who hasn’t responded, then sends them a push. Markers will be cleared first."
          : "Run auto-Donate now? This creates Donate RSVPs for every Active subscriber who hasn’t responded, then sends them a push."
      );
      if (!ok) return;
    } else if (!dryRun) {
      const ok = window.confirm(
        force
          ? `Force ${JOB_LABELS[job]} now? This sends real push notifications to non-responders.`
          : `Run ${JOB_LABELS[job]} now? This sends real push notifications to non-responders.`
      );
      if (!ok) return;
    }

    startTransition(async () => {
      setError(null);
      setLastResult(null);
      const res = await runRsvpAutomationJobAction({ job, dryRun, force });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setLastResult(formatResult(res.result));
      const refreshed = await previewRsvpAutomationAction();
      if (refreshed.ok) setPreview(refreshed.preview);
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">RSVP automation</CardTitle>
        <CardDescription>
          Friday / Monday reminders and day-of auto-Donate (Pacific). Use dry
          run to preview counts without writing Airtable or sending pushes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t run automation</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {preview ? (
          <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-medium">
              {preview.harvestName
                ? `Current harvest: ${preview.harvestName}`
                : "No published harvest"}
            </p>
            <p className="mt-1 text-muted-foreground">
              Now (Pacific): {preview.pacificNow}
            </p>
            {preview.startDate ? (
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>
                  Friday reminder: {preview.fridayReminderDate} at 10:00 PT
                  {preview.markers.friday_reminder ? " · already sent" : ""}
                </li>
                <li>
                  Monday reminder: {preview.mondayReminderDate} at 10:00 PT
                  {preview.markers.monday_reminder ? " · already sent" : ""}
                </li>
                <li>
                  Auto-Donate: {preview.autoDonateDate} at 9:00 PT
                  {preview.markers.auto_donate ? " · already ran" : ""}
                </li>
                <li>
                  Active non-responders right now:{" "}
                  <span className="font-medium text-foreground">
                    {preview.nonResponderCount}
                  </span>
                </li>
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isPending ? "Loading schedule…" : "No preview yet."}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={loadPreview}
          >
            Refresh
          </Button>
        </div>

        {(
          [
            "friday_reminder",
            "monday_reminder",
            "auto_donate",
          ] as RunnableRsvpJob[]
        ).map((job) => (
          <div
            key={job}
            className="flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">{JOB_LABELS[job]}</p>
              <p className="text-xs text-muted-foreground">
                {job === "auto_donate"
                  ? "Creates Donate RSVPs + push"
                  : "Push only to Active non-responders"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending || !preview?.startDate}
                onClick={() => runJob(job, true, false)}
              >
                Dry run
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isPending || !preview?.startDate}
                onClick={() => runJob(job, false, false)}
              >
                Run
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending || !preview?.startDate}
                onClick={() => runJob(job, false, true)}
              >
                Force
              </Button>
            </div>
          </div>
        ))}

        {lastResult ? (
          <Alert className="border-primary/30 bg-primary/5">
            <AlertTitle>Result</AlertTitle>
            <AlertDescription>
              <pre className="mt-1 whitespace-pre-wrap font-sans text-sm">
                {lastResult}
              </pre>
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
