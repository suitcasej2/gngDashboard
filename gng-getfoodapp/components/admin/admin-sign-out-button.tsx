"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { adminLogoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await adminLogoutAction();
      router.replace("/admin/login");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(className)}
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
