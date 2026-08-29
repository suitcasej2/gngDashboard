"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallAppButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [fallbackHint, setFallbackHint] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setInstalled(true);
      return;
    }

    void (async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;
      } catch {
        // Install prompt may still appear; WebAPK needs a controlling SW.
      }
    })();

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setFallbackHint(false);
    }

    function onAppInstalled() {
      setInstalled(true);
      setInstallEvent(null);
      setFallbackHint(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    setInstalling(true);
    setFallbackHint(false);
    try {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.ready;
      }
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      setInstallEvent(null);
      if (choice.outcome === "accepted") {
        // WebAPK installs fire appinstalled; shortcut fallback often does not.
        window.setTimeout(() => {
          if (!isStandaloneDisplay()) {
            setFallbackHint(true);
          }
        }, 2500);
      }
    } finally {
      setInstalling(false);
    }
  }

  if (installed) return null;
  if (!installEvent) {
    if (!fallbackHint) return null;
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Chrome added a shortcut instead of the full app. Remove the Get Food
        icon from your Home Screen, free a little storage, stay signed into
        Google Play, then try{" "}
        <span className="font-medium text-foreground">Install app</span> again
        from Chrome’s menu.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={handleInstall}
        disabled={installing}
      >
        {installing ? "Installing…" : "Install app on this device"}
      </Button>
      {fallbackHint ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          If you still see a Chrome badge on the icon, delete that shortcut and
          install again with{" "}
          <span className="font-medium text-foreground">Install app</span> —
          not Add to Home screen.
        </p>
      ) : null}
    </div>
  );
}
