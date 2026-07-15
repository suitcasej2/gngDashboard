"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  startRegistration,
} from "@simplewebauthn/browser";
import { ScanFace } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AdminPasskeyEnroll({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleEnroll() {
    setError(null);
    setPending(true);

    try {
      const optionsRes = await fetch("/api/admin/passkey/register/options", {
        method: "POST",
      });
      const optionsJson = (await optionsRes.json()) as {
        error?: string;
      };
      if (!optionsRes.ok) {
        setError(optionsJson.error ?? "Could not start Face ID setup.");
        return;
      }

      const registrationResponse = await startRegistration({
        optionsJSON: optionsJson as Parameters<
          typeof startRegistration
        >[0]["optionsJSON"],
      });

      const verifyRes = await fetch("/api/admin/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationResponse),
      });
      const verifyJson = (await verifyRes.json()) as { error?: string };
      if (!verifyRes.ok) {
        setError(verifyJson.error ?? "Could not save your passkey.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Face ID setup was cancelled or is not available."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Setup failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{adminName}</span>.
        Register this device so only you can open the admin dashboard.
      </p>

      <Button
        type="button"
        className="h-12 w-full"
        disabled={pending}
        onClick={() => void handleEnroll()}
      >
        <ScanFace className="size-5" />
        {pending ? "Follow the Face ID prompt…" : "Set up Face ID"}
      </Button>
    </div>
  );
}
