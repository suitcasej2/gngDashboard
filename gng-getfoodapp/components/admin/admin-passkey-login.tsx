"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";
import { ScanFace } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AdminPasskeyLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSignIn() {
    setError(null);
    setPending(true);

    try {
      const optionsRes = await fetch("/api/admin/passkey/auth/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const optionsJson = (await optionsRes.json()) as {
        error?: string;
      };
      if (!optionsRes.ok) {
        setError(optionsJson.error ?? "Could not start Face ID sign-in.");
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
      });
      const verifyJson = (await verifyRes.json()) as { error?: string };
      if (!verifyRes.ok) {
        setError(verifyJson.error ?? "Face ID sign-in failed.");
        return;
      }

      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Face ID was cancelled or is not available on this device."
      );
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

      <Button
        type="button"
        className="h-12 w-full"
        disabled={pending}
        onClick={() => void handleSignIn()}
      >
        <ScanFace className="size-5" />
        {pending ? "Waiting for Face ID…" : "Sign in with Face ID"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        First time?{" "}
        <a href="/login?next=/admin/enroll" className="font-medium underline">
          Sign in with email to set up Face ID
        </a>
      </p>
    </div>
  );
}
