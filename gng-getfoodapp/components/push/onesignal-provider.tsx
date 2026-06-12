"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

async function linkSubscriberToOneSignal(subscriber: {
  id: string;
  email: string;
}) {
  await OneSignal.login(subscriber.id);
  await OneSignal.User.addTags({
    role: "subscriber",
    active: "true",
  });
  await OneSignal.User.addEmail(subscriber.email);
}

export function OneSignalProvider() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!APP_ID || initialized.current) return;
    initialized.current = true;

    let cancelled = false;

    async function setup() {
      await OneSignal.init({
        appId: APP_ID!,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: "/OneSignalSDKWorker.js",
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: "push",
                autoPrompt: false,
                text: {
                  actionMessage:
                    "Get notified when a new harvest is published or GNG sends an update.",
                  acceptButton: "Allow",
                  cancelButton: "Not now",
                },
                delay: { pageViews: 1, timeDelay: 12 },
              },
            ],
          },
        },
      });

      if (cancelled) return;

      try {
        const res = await fetch("/api/session", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as {
          subscriber: { id: string; email: string } | null;
        };
        if (json.subscriber) {
          await linkSubscriberToOneSignal(json.subscriber);
        }
      } catch {
        // Session lookup can fail during dev reloads — push will retry on next visit.
      }
    }

    void setup();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
