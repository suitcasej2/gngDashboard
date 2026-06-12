"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

import { clearAvatarAction, uploadAvatarAction } from "@/app/actions/avatar";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProfileAvatarPicker({
  name,
  initialAvatarUrl,
}: {
  name: string;
  initialAvatarUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePickClick() {
    setError(null);
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    startTransition(async () => {
      const result = await uploadAvatarAction(file);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setAvatarUrl(result.avatarUrl);
      router.refresh();
    });
  }

  function handleReset() {
    setError(null);
    startTransition(async () => {
      const result = await clearAvatarAction();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setAvatarUrl(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
      <div className="relative">
        <ProfileAvatar avatarUrl={avatarUrl} name={name} size={96} />
        <button
          type="button"
          onClick={handlePickClick}
          disabled={isPending}
          aria-label="Change profile photo"
          className={cn(
            "absolute -bottom-1 -right-1 inline-flex size-9 items-center justify-center rounded-full",
            "bg-[var(--brand-brown)] text-white shadow-md transition-transform",
            "hover:scale-105 active:scale-95 disabled:opacity-50"
          )}
        >
          <Camera className="size-4" />
        </button>
      </div>

      <div className="space-y-2 text-center sm:text-left">
        <p className="text-sm text-muted-foreground">
          {avatarUrl ? "Custom profile photo" : "Default tomato avatar"}
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePickClick}
            disabled={isPending}
          >
            {isPending ? "Uploading…" : "Change photo"}
          </Button>
          {avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
            >
              Use default
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
