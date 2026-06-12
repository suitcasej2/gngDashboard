/** In-content placeholder — keeps the nav shell visible during route transitions. */
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-[max(env(safe-area-inset-top),1.5rem)] animate-pulse lg:px-8 lg:pt-8">
      <div className="h-7 w-36 rounded-lg bg-muted/70" />
      <div className="h-40 rounded-2xl bg-muted/50" />
      <div className="h-28 rounded-2xl bg-muted/40" />
    </div>
  );
}
