"use client";

import { createContext, useContext } from "react";

import type { Harvest } from "@/types/harvest";

const HarvestShellContext = createContext<Harvest | null>(null);

export function HarvestShellProvider({
  harvest,
  children,
}: {
  harvest: Harvest;
  children: React.ReactNode;
}) {
  return (
    <HarvestShellContext.Provider value={harvest}>
      {children}
    </HarvestShellContext.Provider>
  );
}

export function useHarvestShell() {
  return useContext(HarvestShellContext);
}
