import type { Metadata } from "next";
import { HarvestForm } from "@/components/harvest/HarvestForm";

export const metadata: Metadata = {
  title: "Publish Harvest",
  description: "Create and publish a harvest",
};

export default function PublishPage() {
  return <HarvestForm />;
}
