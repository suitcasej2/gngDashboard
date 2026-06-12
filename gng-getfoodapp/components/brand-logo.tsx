import { cn } from "@/lib/utils";

/** Plain img for SVG — avoids Next/Image aspect-ratio warnings. */
export function BrandLogo({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src="/GNG.svg"
      alt="Good Neighbor Gardens"
      width={size}
      height={size}
      className={cn("size-auto shrink-0", className)}
      style={{ width: size, height: "auto" }}
    />
  );
}
