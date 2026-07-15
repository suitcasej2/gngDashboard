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

export default async function AdminEditHarvestPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const data = await getHarvestForEdit(id).catch(() => null);
  if (!data) notFound();

  const { recordId, initial } = data;

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-xl px-4 pt-4">
        <Button asChild variant="secondary" className="h-11 w-full sm:w-auto">
          <Link href="/admin">Back to dashboard</Link>
        </Button>
      </div>
      <HarvestForm recordId={recordId} initial={initial} />
    </div>
  );
}
