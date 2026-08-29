"use client";

import { useEffect, useState, useTransition } from "react";
import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser";
import { ScanFace } from "lucide-react";

import { signInForAdminEnrollAction } from "@/app/actions/admin/passkey-enroll";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "email" | "passkey";

export function AdminPasskeySetup({
  initialName,
  initialEmail,
}: {
  initialName?: string | null;
  initialEmail?: string | null;
}) {
  const [step, setStep] = useState<Step>(
    initialName && initialEmail ? "passkey" : "email"
  );
  const [email, setEmail] = useState(initialEmail ?? "");
  const [adminName, setAdminName] = useState(initialName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [webauthnOk, setWebauthnOk] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    setWebauthnOk(browserSupportsWebAuthn());
  }, []);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setStatus(null);

    startTransition(async () => {
      const result = await signInForAdminEnrollAction(email);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setAdminName(result.name);
      setEmail(result.email);
      setStep("passkey");
      setStatus(`Signed in as ${result.email}. Now register a passkey.`);
    });
  }

  async function handleEnroll(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setError(null);
    setStatus(null);

    if (!browserSupportsWebAuthn()) {
      setError(
        "This browser doesn’t support passkeys. Try Chrome (not Brave Shields blocking), Safari, or Edge — or use an iPhone."
      );
      return;
    }

    setEnrolling(true);
    setStatus("Starting passkey registration…");

    try {
      const optionsRes = await fetch("/api/admin/passkey/register/options", {
        method: "POST",
        credentials: "same-origin",
      });
      const optionsJson = (await optionsRes.json()) as {
        error?: string;
      };
      if (!optionsRes.ok) {
        setError(optionsJson.error ?? "Could not start passkey setup.");
        setStatus(null);
        return;
      }

      setStatus("Waiting for browser passkey prompt…");
      const registrationResponse = await startRegistration({
        optionsJSON: optionsJson as Parameters<
          typeof startRegistration
        >[0]["optionsJSON"],
      });

      setStatus("Saving passkey to Airtable…");
      const verifyRes = await fetch("/api/admin/passkey/register/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationResponse),
      });
      const verifyJson = (await verifyRes.json()) as { error?: string };
      if (!verifyRes.ok) {
        setError(verifyJson.error ?? "Could not save your passkey.");
        setStatus(null);
        return;
      }

      setStatus("Passkey saved. Opening admin…");
      window.location.assign("/admin");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Passkey setup was cancelled or is not available.";
      if (/notallowed|abort|cancel|timed out/i.test(message)) {
        setError(
          "The passkey prompt was cancelled or blocked. In Brave: try disabling Shields for this site, or use Chrome/Safari. On Mac, Touch ID should appear; otherwise use a security key."
        );
      } else {
        setError(message);
      }
      setStatus(null);
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div className="space-y-4">
      {webauthnOk === false ? (
        <Alert variant="destructive">
          <AlertTitle>Passkeys not supported here</AlertTitle>
          <AlertDescription>
            Brave sometimes blocks passkeys behind Shields. Turn Shields off for
            this site, or open Chrome / Safari / Edge.
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Setup failed</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
        </Alert>
      ) : null}

      {status ? (
        <Alert className="border-primary/30 bg-primary/5">
          <AlertTitle>Status</AlertTitle>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      ) : null}

      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin / Staff email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full"
            disabled={isPending || enrolling}
          >
            {isPending ? "Checking…" : "Continue"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Account must be Subscription Status = Staff, or listed in
            GNG_ADMIN_EMAILS.
          </p>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {adminName || email}
            </span>
            . Register a passkey for this browser.
          </p>
          <Button
            type="button"
            className="h-12 w-full"
            disabled={enrolling || isPending || webauthnOk === false}
            onClick={(e) => void handleEnroll(e)}
          >
            <ScanFace className="size-5" />
            {enrolling ? "Follow the passkey prompt…" : "Create passkey"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full"
            disabled={enrolling}
            onClick={() => {
              setStep("email");
              setError(null);
              setStatus(null);
            }}
          >
            Use a different email
          </Button>
          <p className="text-xs text-muted-foreground">
            Brave tip: click the Shields icon and set it to Down for this site,
            then try again. Chrome or Safari are more reliable for passkeys.
          </p>
        </div>
      )}
    </div>
  );
}
