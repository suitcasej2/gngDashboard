"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { RsvpAutomationPanel } from "@/components/admin/rsvp/rsvp-automation-panel";
import { cn } from "@/lib/utils";

export function DeveloperSettingsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border bg-background/70 ring-1 ring-foreground/5">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <div>
          <p className="text-base font-semibold">Developer settings</p>
          <p className="text-sm text-muted-foreground">
            Cron tools and testing helpers
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="border-t px-4 pb-4 pt-4">
          <RsvpAutomationPanel />
        </div>
      ) : null}
    </div>
  );
}
