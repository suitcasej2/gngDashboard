export function DeveloperCredit({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <p
      className={
        className ??
        (inverted
          ? "text-xs text-white/70"
          : "text-center text-xs text-muted-foreground")
      }
    >
      Application developed by{" "}
      <a
        href="https://jordanhodges.xyz"
        target="_blank"
        rel="noopener noreferrer"
        className={
          inverted
            ? "font-medium text-white/90 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/70"
            : "font-medium text-foreground underline-offset-4 hover:underline"
        }
      >
        jordanhodges.xyz
      </a>
    </p>
  );
}
