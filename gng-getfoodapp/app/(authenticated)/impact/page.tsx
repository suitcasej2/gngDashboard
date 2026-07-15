import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionSubscriber } from "@/lib/auth";
import { SubscriberImpact } from "@/components/impact/subscriber-impact";

export const metadata: Metadata = {
  title: "Impact — GNG Get Food",
};

export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  const subscriber = await getSessionSubscriber();
  if (!subscriber) redirect("/login");

  return <SubscriberImpact subscriber={subscriber} />;
}
