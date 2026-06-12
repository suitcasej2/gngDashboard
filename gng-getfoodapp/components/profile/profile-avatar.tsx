import Image from "next/image";

import { cn } from "@/lib/utils";

export function ProfileAvatar({
  avatarUrl,
  name,
  size = 80,
  className,
}: {
  avatarUrl: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  if (avatarUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-2 ring-[#FFF904]/50",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={avatarUrl}
          alt={`${name} profile photo`}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[var(--brand-yellow)] ring-2 ring-[#FFF904]/60",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={`${name} default avatar`}
    >
      <img
        src="/Tomato.svg"
        alt=""
        className="object-contain"
        style={{ width: size * 0.6, height: "auto" }}
      />
    </div>
  );
}
