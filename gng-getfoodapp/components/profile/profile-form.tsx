"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { updateProfileAction } from "@/app/actions/profile";
import { ProfileAvatarPicker } from "@/components/profile/profile-avatar-picker";
import { PushSettings } from "@/components/push/push-settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Subscriber } from "@/types/subscriber";

export function ProfileForm({ subscriber }: { subscriber: Subscriber }) {
  const router = useRouter();
  const [phone, setPhone] = useState(subscriber.phone);
  const [address, setAddress] = useState(subscriber.address);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateProfileAction({
        phone,
        address,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-[#FFF904]/35 bg-background/70 backdrop-blur ring-1 ring-foreground/5">
        <CardHeader className="space-y-4">
          <ProfileAvatarPicker
            name={subscriber.fullName}
            initialAvatarUrl={subscriber.avatarUrl}
          />
          <div>
            <CardTitle>{subscriber.fullName}</CardTitle>
            <CardDescription>
              {subscriber.email} · {subscriber.subscriptionStatus}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Couldn&apos;t save</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-primary/30 bg-primary/5">
                <AlertTitle>Profile updated</AlertTitle>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                className="h-12"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                className="h-12"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <Button type="submit" className="h-12 w-full" disabled={isPending}>
              {isPending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <PushSettings />

      <Button
        variant="outline"
        className="h-12 w-full"
        onClick={handleLogout}
        disabled={isPending}
      >
        Sign out
      </Button>
    </div>
  );
}
