"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { value: "broadcast", label: "Broadcast" },
  { value: "subscribers", label: "Neighbors" },
  { value: "drafts", label: "Drafts" },
  { value: "live", label: "Live" },
  { value: "rsvps", label: "RSVPs" },
  { value: "developer", label: "Developer" },
] as const;

export function AdminDashboardTabs(props: {
  broadcast: ReactNode;
  subscribers: ReactNode;
  drafts: ReactNode;
  live: ReactNode;
  rsvps: ReactNode;
  developer: ReactNode;
}) {
  const [value, setValue] = useState<string>("broadcast");
  const lastScrollY = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (lastScrollY.current == null) return;
    window.scrollTo({
      top: lastScrollY.current,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });
    lastScrollY.current = null;
  }, [value]);

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        lastScrollY.current = window.scrollY;
        setValue(next);
      }}
      className="w-full"
    >
      <div className="sticky top-0 z-10 -mx-4 bg-[color-mix(in_oklab,var(--background)_88%,transparent)] px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--background)_72%,transparent)]">
        <TabsList className="grid h-auto w-full grid-cols-6 gap-1 p-1 sm:h-11">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-10 px-1 text-xs sm:h-9 sm:px-2 sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="broadcast" className="mt-4">
        {props.broadcast}
      </TabsContent>
      <TabsContent value="subscribers" className="mt-4">
        {props.subscribers}
      </TabsContent>
      <TabsContent value="drafts" className="mt-4">
        {props.drafts}
      </TabsContent>
      <TabsContent value="live" className="mt-4">
        {props.live}
      </TabsContent>
      <TabsContent value="rsvps" className="mt-4">
        {props.rsvps}
      </TabsContent>
      <TabsContent value="developer" className="mt-4">
        {props.developer}
      </TabsContent>
    </Tabs>
  );
}
