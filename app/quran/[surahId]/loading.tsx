export default function QuranLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="h-9 w-36 rounded-md bg-muted animate-pulse" />
          <div className="hidden md:block h-6 w-48 rounded-md bg-muted/60 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
            <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
            <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Title block skeleton */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
          <div className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-32 rounded bg-muted/80 animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
          <div className="mt-4 h-8 w-64 rounded bg-muted/40 animate-pulse" />
        </div>

        {/* Book Container Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-md md:border-l-4 md:border-l-accent/40 space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/80 bg-background/50 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-8 w-3/4 ml-auto rounded bg-muted/80 animate-pulse" />
                <div className="h-8 w-1/2 ml-auto rounded bg-muted/60 animate-pulse" />
              </div>
              <div className="border-t border-border/40 pt-3 space-y-2">
                <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-muted/40 animate-pulse" />
              </div>
            </div>
          ))}

          {/* Pagination skeleton */}
          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
            <div className="h-10 w-28 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-28 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
