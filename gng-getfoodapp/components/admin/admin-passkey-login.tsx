"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  browserSupportsWebAuthn,
  startAuthentication,
} from "@simplewebauthn/browser";
import { ScanFace } from "lucide-react";

import { AdminPasskeySetup } from "@/components/admin/admin-passkey-setup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Mode = "signin" | "setup";

export function AdminPasskeyLogin() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [mode, setMode] = useState<Mode>("setup");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSignIn() {
    setError(null);
    setPending(true);

    try {
      if (!browserSupportsWebAuthn()) {
        setError(
          "This browser doesn’t support passkeys. Try Safari, Chrome, or Edge."
        );
        return;
      }

      const optionsRes = await fetch("/api/admin/passkey/auth/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "same-origin",
      });
      const optionsJson = (await optionsRes.json()) as {
        error?: string;
      };
      if (!optionsRes.ok) {
        setError(
          optionsJson.error ??
            "No passkey found yet. Use “Set up a new passkey” below first."
        );
        setMode("setup");
        return;
      }

      const authResponse = await startAuthentication({
        optionsJSON: optionsJson as Parameters<
          typeof startAuthentication
        >[0]["optionsJSON"],
      });

      const verifyRes = await fetch("/api/admin/passkey/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResponse),
        credentials: "same-origin",
      });
      const verifyJson = (await verifyRes.json()) as { error?: string };
      if (!verifyRes.ok) {
        setError(verifyJson.error ?? "Passkey sign-in failed.");
        return;
      }

      window.location.assign(next);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Passkey was cancelled or isn’t available on this device.";
      if (/notallowed|cancel|timed out/i.test(message)) {
        setError(
          "Passkey prompt was cancelled or timed out. On Mac use Touch ID; otherwise try a security key or set up again below."
        );
      } else {
        setError(message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t sign in</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "setup" ? "default" : "outline"}
          className="h-10 flex-1"
          onClick={() => {
            setMode("setup");
            setError(null);
          }}
        >
          Set up passkey
        </Button>
        <Button
          type="button"
          variant={mode === "signin" ? "default" : "outline"}
          className="h-10 flex-1"
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
        >
          Sign in
        </Button>
      </div>

      {mode === "setup" ? (
        <AdminPasskeySetup />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Only works after you&apos;ve created a passkey on this (or another)
            device.
          </p>
          <Button
            type="button"
            className="h-12 w-full"
            disabled={pending}
            onClick={() => void handleSignIn()}
          >
            <ScanFace className="size-5" />
            {pending ? "Waiting for passkey…" : "Sign in with passkey"}
          </Button>
        </div>
      )}
    </div>
  );
}
