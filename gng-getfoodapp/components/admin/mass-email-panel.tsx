"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { queueMassEmailAction } from "@/app/actions/admin/mass-email";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  buildMassEmailHtml,
  getMassEmailAppIconUrl,
} from "@/lib/mass-email-template";

const emptyForm = {
  subject: "",
  eyebrow: "Good Neighbor Gardens",
  headline: "",
  opening: "",
  highlight: "",
  middle: "",
  bullets: "",
  buttonLabel: "",
  buttonUrl: "",
  closing: "",
  notes: "",
};

export function MassEmailPanel() {
  const [pending, start] = useTransition();
  const [form, setForm] = useState(emptyForm);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewIconUrl, setPreviewIconUrl] = useState<string | null>(null);

  // Embed the icon as a data URL so the srcDoc preview iframe can show it
  // even when external/same-origin image loads are blocked.
  useEffect(() => {
    let cancelled = false;
    const src = getMassEmailAppIconUrl(window.location.origin);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Icon fetch failed (${res.status})`);
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          })
      )
      .then((dataUrl) => {
        if (!cancelled) setPreviewIconUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setPreviewIconUrl(src);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const previewHtml = useMemo(() => {
    if (!form.subject.trim() || !form.opening.trim()) return null;
    return buildMassEmailHtml(
      {
        subject: form.subject,
        eyebrow: form.eyebrow || undefined,
        headline: form.headline || undefined,
        opening: form.opening,
        highlight: form.highlight || undefined,
        middle: form.middle || undefined,
        bullets: form.bullets || undefined,
        buttonLabel: form.buttonLabel || undefined,
        buttonUrl: form.buttonUrl || undefined,
        closing: form.closing || undefined,
      },
      {
        origin: window.location.origin,
        appIconUrl: previewIconUrl || undefined,
      }
    );
  }, [form, previewIconUrl]);

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleQueue() {
    setError(null);
    setSuccess(null);

    const confirmed = window.confirm(
      "Queue this email for Zapier to send to neighbors?\n\nMake sure the preview looks right first."
    );
    if (!confirmed) return;

    start(async () => {
      const res = await queueMassEmailAction({
        subject: form.subject,
        eyebrow: form.eyebrow,
        headline: form.headline,
        opening: form.opening,
        highlight: form.highlight,
        middle: form.middle,
        bullets: form.bullets,
        buttonLabel: form.buttonLabel,
        buttonUrl: form.buttonUrl,
        closing: form.closing,
        notes: form.notes,
      });

      if (!res.ok) {
        setError(res.message);
        return;
      }

      setSuccess(
        res.recordId
          ? `Queued in Airtable (${res.recordId}). Zapier can pick it up as Status = Queued.`
          : "Queued in Airtable. Zapier can pick it up as Status = Queued."
      );
      setForm(emptyForm);
      setShowPreview(false);
    });
  }

  return (
    <Card className="overflow-hidden border-[#56bb55]/25">
      <CardContent className="space-y-5 pt-6">
        {success ? (
          <Alert>
            <AlertTitle>Email queued</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t queue email</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="mass-subject">Subject</Label>
          <Input
            id="mass-subject"
            className="h-12 text-base"
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            placeholder="Get Food has a new home"
            disabled={pending}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mass-eyebrow">Small label (optional)</Label>
            <Input
              id="mass-eyebrow"
              className="h-12 text-base"
              value={form.eyebrow}
              onChange={(e) => update("eyebrow", e.target.value)}
              placeholder="Good Neighbor Gardens"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mass-headline">Headline (optional)</Label>
            <Input
              id="mass-headline"
              className="h-12 text-base"
              value={form.headline}
              onChange={(e) => update("headline", e.target.value)}
              placeholder="Defaults to subject if blank"
              disabled={pending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mass-highlight">
            Important callout (optional)
          </Label>
          <Textarea
            id="mass-highlight"
            className="min-h-20 resize-y text-base"
            value={form.highlight}
            onChange={(e) => update("highlight", e.target.value)}
            placeholder={
              "Starting August 19th\nEvery Distribution Day moves to the app."
            }
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            Yellow branded box shown right under the headline — use for dates
            and must-do actions. First line is the big title; extra lines are
            supporting text.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mass-opening">Opening</Label>
          <Textarea
            id="mass-opening"
            className="min-h-32 resize-y text-base"
            value={form.opening}
            onChange={(e) => update("opening", e.target.value)}
            placeholder="Blank line between paragraphs…"
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            Line breaks: press Enter once for a soft break; leave a blank line
            between paragraphs for more space.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mass-middle">What&apos;s changing (optional)</Label>
          <Textarea
            id="mass-middle"
            className="min-h-24 resize-y text-base"
            value={form.middle}
            onChange={(e) => update("middle", e.target.value)}
            placeholder="More paragraphs…"
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mass-bullets">Bullet list (optional)</Label>
          <Textarea
            id="mass-bullets"
            className="min-h-32 resize-y text-base"
            value={form.bullets}
            onChange={(e) => update("bullets", e.target.value)}
            placeholder={"One item per line\nRSVP options\nImpact tracking"}
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            One item per line. Leading dashes are fine.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mass-btn-label">Button label (optional)</Label>
            <Input
              id="mass-btn-label"
              className="h-12 text-base"
              value={form.buttonLabel}
              onChange={(e) => update("buttonLabel", e.target.value)}
              placeholder="Install Get Food"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mass-btn-url">Button link (optional)</Label>
            <Input
              id="mass-btn-url"
              className="h-12 text-base"
              inputMode="url"
              value={form.buttonUrl}
              onChange={(e) => update("buttonUrl", e.target.value)}
              placeholder="https://gng-get-food-app.vercel.app/install"
              disabled={pending}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Both label and link are required. With a callout filled in, the button
          appears twice — right under the app icon and again after the bullets.
          The Get Food home-screen icon sits between the yellow callout and the
          first button.
          {form.buttonLabel.trim() && !form.buttonUrl.trim()
            ? " Add a link to show the button."
            : null}
          {!form.buttonLabel.trim() && form.buttonUrl.trim()
            ? " Add a label to show the button."
            : null}
        </p>

        <div className="space-y-2">
          <Label htmlFor="mass-closing">Closing (optional)</Label>
          <Textarea
            id="mass-closing"
            className="min-h-24 resize-y text-base"
            value={form.closing}
            onChange={(e) => update("closing", e.target.value)}
            placeholder="Save the date: August 19th is the first Distribution Day…"
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            Dates like August 19th get a yellow highlight automatically in
            opening, what&apos;s changing, and closing.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mass-notes">Internal notes (optional)</Label>
          <Input
            id="mass-notes"
            className="h-12 text-base"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Only stored in Airtable — not emailed"
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="h-12 flex-1"
            disabled={pending || !previewHtml}
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "Hide preview" : "Preview email"}
          </Button>
          <Button
            type="button"
            className="h-12 flex-1"
            disabled={
              pending || !form.subject.trim() || !form.opening.trim()
            }
            onClick={handleQueue}
          >
            {pending ? "Queueing…" : "Queue for Zapier"}
          </Button>
        </div>

        {showPreview && previewHtml ? (
          <div className="overflow-hidden rounded-xl border bg-[#faf9f7]">
            <p className="border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              Preview — what neighbors will see
            </p>
            <iframe
              key={previewHtml}
              title="Mass email preview"
              className="h-[min(70vh,640px)] w-full bg-[#faf9f7]"
              srcDoc={previewHtml}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
