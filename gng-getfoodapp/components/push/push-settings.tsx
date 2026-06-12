"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import OneSignal from "react-onesignal";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

export function PushSettings() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!APP_ID) return;

    async function readState() {
      try {
        setSupported(OneSignal.Notifications.isPushSupported());
        setOptedIn(Boolean(OneSignal.User.PushSubscription.optedIn));
      } catch {
        setSupported(false);
        setOptedIn(false);
      }
    }

    const timer = window.setTimeout(() => {
      void readState();
    }, 800);

    return () => window.clearTimeout(timer);
  }, []);

  if (!APP_ID) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Push notifications</CardTitle>
          <CardDescription>
            Notifications are not configured for this environment yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  async function handleEnable() {
    setBusy(true);
    try {
      await OneSignal.Slidedown.promptPush();
      setOptedIn(Boolean(OneSignal.User.PushSubscription.optedIn));
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    try {
      await OneSignal.User.PushSubscription.optOut();
      setOptedIn(false);
    } finally {
      setBusy(false);
    }
  }

  const statusLabel =
    optedIn === null
      ? "Checking…"
      : optedIn
        ? "Enabled"
        : supported
          ? "Off"
          : "Not supported on this device";

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-4" />
          Push notifications
        </CardTitle>
        <CardDescription>
          Get alerts when a new harvest goes live or GNG sends a message.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Status:{" "}
          <span className="font-medium text-foreground">{statusLabel}</span>
        </p>
        {supported && optedIn !== true ? (
          <Button
            type="button"
            className="h-11"
            disabled={busy}
            onClick={() => void handleEnable()}
          >
            {busy ? "Working…" : "Enable notifications"}
          </Button>
        ) : supported && optedIn ? (
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={busy}
            onClick={() => void handleDisable()}
          >
            {busy ? "Working…" : "Turn off notifications"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
