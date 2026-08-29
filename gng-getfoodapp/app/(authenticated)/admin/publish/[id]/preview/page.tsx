import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeScreen } from "@/components/home/home-screen";
import { Button } from "@/components/ui/button";
import { getHarvestForAdminPreview } from "@/lib/harvest-by-id";
import type { Subscriber } from "@/types/subscriber";

export const metadata: Metadata = {
  title: "Draft preview — GNG Admin",
  description: "Preview a draft harvest as it will appear on the home page",
};

export const dynamic = "force-dynamic";

const PREVIEW_SUBSCRIBER: Subscriber = {
  id: "admin-preview",
  fullName: "Jordan Neighbor",
  email: "preview@goodneighborgardens.com",
  phone: "",
  address: "",
  deliveryPreference: "",
  subscriptionStatus: "Active",
  depositPaid: true,
  subscriptionStartDate: null,
  firstHarvestReceived: null,
  rsvpCount: 0,
  lifetimeBoxCount: 0,
  bankedBoxes: 0,
  bankedBoxCount: 0,
  giftLog: "",
  avatarUrl: null,
};

export default async function AdminHarvestPreviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const harvest = await getHarvestForAdminPreview(id).catch(() => null);
  if (!harvest) notFound();

  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 z-40 border-b border-[#2a1f12]/10 bg-[#FFF904] px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-brown)]/70">
              Admin preview
            </p>
            <p className="text-sm font-medium text-[var(--brand-brown)]">
              Draft view of “{harvest.name}” — not visible to neighbors
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="h-10">
              <Link href={`/admin/publish/${id}`}>Back to edit</Link>
            </Button>
            <Button asChild className="h-10">
              <Link href="/admin">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      <HomeScreen
        subscriber={PREVIEW_SUBSCRIBER}
        harvest={harvest}
        rsvp={null}
        chatOpen={false}
        rsvpParticipants={[]}
        previewMode
      />
    </div>
  );
}
