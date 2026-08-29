import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HarvestForm } from "@/components/admin/harvest/HarvestForm";
import { getHarvestForEdit } from "@/lib/harvest-by-id";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Edit Harvest — GNG",
  description: "Edit an existing harvest",
};

export const dynamic = "force-dynamic";

function isLiveStatus(status: string | null) {
  const s = status?.trim() ?? "";
  return s === "Publish" || s === "Published" || s === "Sent";
}

export default async function AdminEditHarvestPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const data = await getHarvestForEdit(id).catch(() => null);
  if (!data) notFound();

  const { recordId, initial, airtableStatus } = data;
  const live = isLiveStatus(airtableStatus);

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex max-w-xl flex-col gap-2 px-4 pt-4 sm:flex-row sm:items-center">
        <Button asChild variant="secondary" className="h-11 w-full sm:w-auto">
          <Link href="/admin">Back to dashboard</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
          <Link href={`/admin/publish/${recordId}/preview`}>Preview home</Link>
        </Button>
      </div>

      {live ? (
        <div className="mx-auto mt-4 max-w-xl px-4">
          <div className="rounded-xl border border-[#FFF904]/50 bg-[#FFF904]/20 px-4 py-3 text-sm text-[var(--brand-brown)]">
            Editing a <span className="font-medium">live</span> harvest
            {airtableStatus ? ` (status: ${airtableStatus})` : ""}. Saving updates
            details for neighbors without changing its live status unless you
            switch it back to Draft.
          </div>
        </div>
      ) : null}

      <HarvestForm
        recordId={recordId}
        initial={initial}
        isLiveHarvest={live}
      />
    </div>
  );
}
