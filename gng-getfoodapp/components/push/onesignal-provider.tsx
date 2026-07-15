"use client";

import { useEffect, useRef } from "react";

import {
  ensureOneSignalInitialized,
  getOneSignalUnavailableMessage,
  isOneSignalConfigured,
  linkSubscriberToOneSignal,
} from "@/lib/onesignal-client";

export function OneSignalProvider() {
  const linked = useRef(false);

  useEffect(() => {
    if (!isOneSignalConfigured()) return;

    const unavailable = getOneSignalUnavailableMessage();
    if (unavailable) return;

    let cancelled = false;

    async function setup() {
      try {
        await ensureOneSignalInitialized();
      } catch {
        return;
      }
      if (cancelled || linked.current) return;

      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as {
          subscriber: { id: string; email: string } | null;
        };
        if (json.subscriber) {
          await linkSubscriberToOneSignal(json.subscriber);
          linked.current = true;
        }
      } catch {
        // Session lookup can fail during dev reloads.
      }
    }

    void setup();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
