"use client";

import { useTransition, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
};

export function DashboardRefreshButton({
  className,
  variant = "outline",
  size = "default",
}: Props) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("shrink-0", className)}
      disabled={isPending}
      aria-busy={isPending}
      aria-label="Refresh dashboard"
      onClick={() => {
        start(() => {
          router.refresh();
        });
      }}
    >
      <RefreshCw
        className={cn("size-4 sm:mr-2", isPending && "animate-spin")}
        aria-hidden
      />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  );
}
