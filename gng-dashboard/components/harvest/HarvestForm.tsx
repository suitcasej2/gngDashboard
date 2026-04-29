"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { createHarvest, updateHarvest, uploadImageToBlob } from "@/app/actions/harvest";
import type { CreateHarvestInput, HarvestStatus } from "@/app/actions/harvest";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEFAULT_PICKUP_LOCATION =
  '3550 Park Blvd SD CA 92103 Garage 7 (Turn the Garage handle to the left until it clicks and roll the door up!)';
const DEFAULT_BOX_CONTENTS =
  "You get what you get :) You are responsible for bringing back the box set cleaned so we can reuse it for the next Harvest day!";
const DEFAULT_TEXT_ME_NUMBER = "858-375-6121";

export function defaultHarvestFormState(): Omit<CreateHarvestInput, "status"> {
  return {
    harvestName: "",
    description: "",
    pickupLocation: DEFAULT_PICKUP_LOCATION,
    boxContents: DEFAULT_BOX_CONTENTS,
    textMeNumber: DEFAULT_TEXT_ME_NUMBER,
    startDate: "",
    endDate: "",
    startTime: "16:30",
    endTime: "19:00",
    recipeTitle: "",
    recipeUrl: "",
    storageTips: "",
    bbSponsorName: "",
    bbMessage: "",
    donorName: "",
    donorLink: "",
    harvestBoxImageUrl: undefined,
    recipeImageUrl: undefined,
    bbImageUrl: undefined,
    donorLogoUrl: undefined,
  };
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span
        className="inline-block size-4 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-muted-foreground"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}

function UploadZone(props: {
  title: string;
  help?: string;
  value?: string;
  onChange: (url?: string) => void;
  folder: "harvest-box" | "recipe" | "bread-butter-jam" | "donor-logo";
}) {
  const { title, help, value, onChange, folder } = props;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {help ? <CardDescription className="text-sm">{help}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-[72px_1fr] gap-3 items-center">
          <div className="relative size-[72px] overflow-hidden rounded-xl border bg-muted/30">
            {value || localPreview ? (
              // Use <img> for previews to avoid Next/Image SVG restrictions.
              // (The final saved value is still a permanent Blob URL.)
              <img
                src={value || localPreview || ""}
                alt={`${title} preview`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="sr-only">{title}</Label>
            <Input
              type="file"
              accept="image/*"
              disabled={pending}
              onChange={(e) => {
                setError(null);
                const f = e.currentTarget.files?.[0];
                if (!f) return;
                const preview = URL.createObjectURL(f);
                setLocalPreview(preview);

                startTransition(async () => {
                  try {
                    const { url } = await uploadImageToBlob({ file: f, folder });
                    onChange(url);
                    setError(null);
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : "Upload failed.";
                    setError(msg);
                  }
                });
              }}
            />

            {pending ? (
              <div className="space-y-2">
                <Progress value={100} className="h-2 animate-pulse" />
                <Spinner label="Uploading…" />
              </div>
            ) : value ? (
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs text-muted-foreground">Saved to Blob</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onChange("");
                    setLocalPreview(null);
                    setError(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : null}

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : value ? (
              <p className="text-xs text-muted-foreground break-all">{value}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HarvestForm(props?: {
  recordId?: string;
  initial?: Partial<Omit<CreateHarvestInput, "status">> & { status?: HarvestStatus };
}) {
  const recordId = props?.recordId;
  const initial = props?.initial;
  const isEdit = Boolean(recordId);

  const [status, setStatus] = useState<HarvestStatus>(initial?.status ?? "Draft");
  const [isSaving, startSaving] = useTransition();

  const [harvestBoxImageUrl, setHarvestBoxImageUrl] = useState<string | undefined>(
    initial?.harvestBoxImageUrl,
  );
  const [recipeImageUrl, setRecipeImageUrl] = useState<string | undefined>(initial?.recipeImageUrl);
  const [bbImageUrl, setBbImageUrl] = useState<string | undefined>(initial?.bbImageUrl);
  const [donorLogoUrl, setDonorLogoUrl] = useState<string | undefined>(initial?.donorLogoUrl);

  const [form, setForm] = useState<Omit<CreateHarvestInput, "status">>(() => ({
    ...defaultHarvestFormState(),
    ...(initial ?? {}),
  }));

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!form.harvestName.trim()) return false;
    return true;
  }, [form.harvestName]);

  if (publishedId) {
    return (
      <div className="px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">{isEdit ? "Harvest Updated" : "Harvest Published"}</CardTitle>
            <CardDescription>
              Your harvest has been saved to Airtable and is ready for your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Record ID</p>
              <p className="break-all text-muted-foreground">{publishedId}</p>
            </div>
            <Button asChild className="w-full h-12 text-base">
              <Link href="/">Back to dashboard</Link>
            </Button>
            {!isEdit ? (
              <Button
                variant="secondary"
                className="w-full h-12 text-base"
                onClick={() => {
                  setPublishedId(null);
                  setSubmitError(null);
                  setStatus("Draft");
                  setHarvestBoxImageUrl(undefined);
                  setRecipeImageUrl(undefined);
                  setBbImageUrl(undefined);
                  setDonorLogoUrl(undefined);
                  setForm(defaultHarvestFormState());
                }}
              >
                Create another harvest
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_circle_at_20%_-10%,theme(colors.primary/15),transparent_40%),radial-gradient(900px_circle_at_100%_0%,theme(colors.accent/35),transparent_35%)]">
      <div className="mx-auto max-w-xl px-4 pb-10 pt-6">
        <header className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            CEO Harvest Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Publish a new Harvest</h1>
          <p className="text-sm text-muted-foreground">
            Mobile-first console for creating harvests with reliable image uploads.
          </p>
          <div className="pt-1">
            <Button asChild variant="secondary" className="h-11 w-full sm:w-auto">
              <Link href="/">Back to dashboard</Link>
            </Button>
          </div>
        </header>

        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status</CardTitle>
              <CardDescription>Draft now, publish when ready.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{status}</p>
                <p className="text-xs text-muted-foreground">
                  {status === "Published"
                    ? "Visible as published in Airtable."
                    : "Safe to save while you’re still editing."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Draft</span>
                <Switch
                  checked={status === "Published"}
                  onCheckedChange={(checked) => setStatus(checked ? "Published" : "Draft")}
                  aria-label="Draft / Published"
                />
                <span className="text-xs text-muted-foreground">Published</span>
              </div>
            </CardContent>
          </Card>

          <UploadZone
            title="Harvest Box Image (Primary)"
            help="This is the main image people will see first."
            value={harvestBoxImageUrl}
            onChange={(url) => setHarvestBoxImageUrl(url)}
            folder="harvest-box"
          />
          <UploadZone
            title="Recipe Image"
            value={recipeImageUrl}
            onChange={(url) => setRecipeImageUrl(url)}
            folder="recipe"
          />
          <UploadZone
            title="Bread & Butter Jam Image"
            value={bbImageUrl}
            onChange={(url) => setBbImageUrl(url)}
            folder="bread-butter-jam"
          />
          <UploadZone
            title="Donor Organization Logo"
            value={donorLogoUrl}
            onChange={(url) => setDonorLogoUrl(url)}
            folder="donor-logo"
          />

          <Separator />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Harvest Details</CardTitle>
              <CardDescription>What’s in the box and where to pick up.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="harvestName">Harvest Name</Label>
                <Input
                  id="harvestName"
                  placeholder="e.g. Spring Greens Harvest"
                  value={form.harvestName}
                  onChange={(e) => setForm((p) => ({ ...p, harvestName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A longer description for this harvest..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  placeholder="e.g. Main Office Lobby"
                  value={form.pickupLocation}
                  onChange={(e) => setForm((p) => ({ ...p, pickupLocation: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="boxContents">Box Contents</Label>
                <Textarea
                  id="boxContents"
                  placeholder="List what's included..."
                  value={form.boxContents}
                  onChange={(e) => setForm((p) => ({ ...p, boxContents: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textMeNumber">Text Me Number</Label>
                <Input
                  id="textMeNumber"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="e.g. 858-555-1234"
                  value={form.textMeNumber}
                  onChange={(e) => setForm((p) => ({ ...p, textMeNumber: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Logistics</CardTitle>
              <CardDescription>Dates and times for pickup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Featured Content</CardTitle>
              <CardDescription>Recipe, links, and storage tips.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipeTitle">Recipe Title</Label>
                <Input
                  id="recipeTitle"
                  placeholder="e.g. Lemon Garlic Kale"
                  value={form.recipeTitle}
                  onChange={(e) => setForm((p) => ({ ...p, recipeTitle: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipeUrl">Recipe URL</Label>
                <Input
                  id="recipeUrl"
                  inputMode="url"
                  placeholder="https://..."
                  value={form.recipeUrl}
                  onChange={(e) => setForm((p) => ({ ...p, recipeUrl: e.target.value }))}
                />
              </div>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <a
                    href="https://www.goodneighborgardens.com/recipes"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Browse recipes
                  </a>
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storageTips">Storage Tips</Label>
                <Textarea
                  id="storageTips"
                  placeholder="How to store the produce..."
                  value={form.storageTips}
                  onChange={(e) => setForm((p) => ({ ...p, storageTips: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sponsors & Donors</CardTitle>
              <CardDescription>Optional sponsor message and donor link.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bbSponsorName">B&B Sponsor Name</Label>
                <Input
                  id="bbSponsorName"
                  value={form.bbSponsorName}
                  onChange={(e) => setForm((p) => ({ ...p, bbSponsorName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bbMessage">B&B Message</Label>
                <Textarea
                  id="bbMessage"
                  value={form.bbMessage}
                  onChange={(e) => setForm((p) => ({ ...p, bbMessage: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="donorName">Donor Name</Label>
                  <Input
                    id="donorName"
                    value={form.donorName}
                    onChange={(e) => setForm((p) => ({ ...p, donorName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donorLink">Donor Link</Label>
                  <Input
                    id="donorLink"
                    inputMode="url"
                    placeholder="https://..."
                    value={form.donorLink}
                    onChange={(e) => setForm((p) => ({ ...p, donorLink: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {submitError ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn’t save to Airtable</AlertTitle>
              <AlertDescription>
                {submitError}
                <br />
                If Airtable is temporarily down, please try again in a moment.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="sticky bottom-3 z-10">
            <Card className="border-primary/20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {status === "Published" ? "Publish Harvest" : "Save Draft"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {status === "Published"
                        ? "Saves to Airtable with Status = Published."
                        : "Saves to Airtable with Status = Draft."}
                    </p>
                  </div>
                  <Button
                    className="h-12 px-5 text-base"
                    disabled={!canSubmit || isSaving}
                    onClick={() => {
                      setSubmitError(null);
                      startSaving(async () => {
                        const payload = {
                          ...form,
                          status,
                          harvestBoxImageUrl,
                          recipeImageUrl,
                          bbImageUrl,
                          donorLogoUrl,
                        };

                        const res = isEdit
                          ? await updateHarvest({ recordId: recordId as string, ...payload })
                          : await createHarvest(payload);

                        if (!res.ok) {
                          setSubmitError(res.message);
                          return;
                        }

                        setPublishedId(res.recordId || "Saved");
                      });
                    }}
                  >
                    {isSaving ? "Saving…" : status === "Published" ? "Publish" : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

