"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import {
  disablePushNotifications,
  enablePushNotifications,
  getBravePushHelpMessage,
  getOneSignalUnavailableMessage,
  getPushSubscriptionState,
  isBraveBrowserAsync,
  isOneSignalAvailable,
  isOneSignalConfigured,
  onPushSubscriptionChange,
} from "@/lib/onesignal-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function PushSettings() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [braveHelp, setBraveHelp] = useState<string | null>(null);

  useEffect(() => {
    if (!isOneSignalAvailable()) return;

    let cancelled = false;

    void isBraveBrowserAsync().then((isBrave) => {
      if (!cancelled && isBrave) {
        setBraveHelp(getBravePushHelpMessage());
      }
    });

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setSupported(false);
      setOptedIn(false);
      setError(
        "Push notifications are taking too long to load. Refresh the page or check for ad blockers."
      );
    }, 22_000);

    async function readState() {
      try {
        const state = await getPushSubscriptionState();
        if (!cancelled) {
          window.clearTimeout(timeoutId);
          setSupported(state.supported);
          setOptedIn(state.optedIn);
        }
      } catch (e) {
        if (!cancelled) {
          window.clearTimeout(timeoutId);
          setSupported(false);
          setOptedIn(false);
          setError(
            e instanceof Error
              ? e.message
              : "Could not initialize push notifications."
          );
        }
      }
    }

    void readState();

    const unsubscribe = onPushSubscriptionChange((next) => {
      if (!cancelled) setOptedIn(next);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  if (!isOneSignalConfigured()) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Push notifications</CardTitle>
          <CardDescription>
            Push notifications are not configured for this deployment.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const unavailableMessage = getOneSignalUnavailableMessage();
  if (unavailableMessage) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4" />
            Push notifications
          </CardTitle>
          <CardDescription>{unavailableMessage}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  async function handleToggle(checked: boolean) {
    if (busy || optedIn === null) return;

    setBusy(true);
    setError(null);
    const previous = optedIn;
    setOptedIn(checked);

    try {
      if (checked) {
        const result = await enablePushNotifications();
        setOptedIn(result.optedIn);
        if (!result.ok) {
          setOptedIn(previous);
          if (result.message) setError(result.message);
        }
      } else {
        await disablePushNotifications();
        setOptedIn(false);
      }
    } catch (e) {
      setOptedIn(previous);
      setError(
        e instanceof Error
          ? e.message
          : "Could not update notification settings. Try again."
      );
    } finally {
      setBusy(false);
    }
  }

  const statusLabel =
    optedIn === null
      ? "Checking…"
      : optedIn
        ? "On"
        : supported
          ? "Off"
          : "Not supported on this device";

  const switchDisabled =
    busy || optedIn === null || supported === false || supported === null;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-4" />
          Push notifications
        </CardTitle>
        <CardDescription>
          Get alerts when a new harvest goes live or Mia sends a broadcast.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {braveHelp && (
          <Alert>
            <AlertDescription className="space-y-2">
              <p>{braveHelp}</p>
              <p className="text-xs text-muted-foreground">
                Quick link:{" "}
                <a
                  href="brave://settings/privacy"
                  className="font-medium underline underline-offset-2"
                >
                  brave://settings/privacy
                </a>
              </p>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/20 px-3 py-3">
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {busy ? "Updating…" : statusLabel}
            </p>
          </div>
          <Switch
            checked={optedIn === true}
            disabled={switchDisabled}
            onCheckedChange={(checked) => void handleToggle(checked)}
            aria-label="Push notifications"
          />
        </div>
      </CardContent>
    </Card>
  );
}
