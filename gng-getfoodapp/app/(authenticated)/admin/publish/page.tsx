import type { Metadata } from "next";
import { HarvestForm } from "@/components/admin/harvest/HarvestForm";

export const metadata: Metadata = {
  title: "Publish Harvest — GNG",
  description: "Create and publish a harvest",
};

export default function AdminPublishPage() {
  return <HarvestForm />;
}
