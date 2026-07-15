import { notFound } from "next/navigation";

import { HarvestShellProvider } from "@/components/layout/harvest-shell-context";
import { getHarvestById } from "@/lib/harvest";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function HarvestDetailLayout({ children, params }: Props) {
  const { id } = await params;
  const harvest = await getHarvestById(id);
  if (!harvest) notFound();

  return <HarvestShellProvider harvest={harvest}>{children}</HarvestShellProvider>;
}
