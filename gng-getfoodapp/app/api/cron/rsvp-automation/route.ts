import { NextResponse } from "next/server";

import { runRsvpAutomation } from "@/lib/rsvp-automation";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.error("[cron/rsvp-automation] CRON_SECRET is not configured.");
    return false;
  }

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runRsvpAutomation();
    console.log("[cron/rsvp-automation]", JSON.stringify(result));
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "RSVP automation failed.";
    console.error("[cron/rsvp-automation]", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
