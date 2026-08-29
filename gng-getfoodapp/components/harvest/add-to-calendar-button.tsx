"use client";

import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildGoogleCalendarUrl,
  buildHarvestCalendarEvent,
  buildHarvestIcs,
} from "@/lib/harvest-calendar";
import { cn } from "@/lib/utils";
import type { Harvest } from "@/types/harvest";

function preferGoogleCalendar() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function AddToCalendarButton({
  harvest,
  className,
  variant = "outline",
}: {
  harvest: Harvest;
  className?: string;
  variant?: "outline" | "default" | "secondary";
}) {
  const event = buildHarvestCalendarEvent(harvest);
  const ics = buildHarvestIcs(harvest);
  const googleUrl = buildGoogleCalendarUrl(harvest);

  if (!event || !ics) return null;

  function handleAdd() {
    if (preferGoogleCalendar() && googleUrl) {
      window.open(googleUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const blob = new Blob([ics!], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = event!.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn("h-12 w-full gap-2", className)}
      onClick={handleAdd}
    >
      <CalendarPlus className="size-4" />
      Add to calendar
    </Button>
  );
}
