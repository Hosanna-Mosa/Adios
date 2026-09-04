import { Skeleton } from "@/components/ui/skeleton";

/**
 * Suspense fallback for lazy-loaded routes. Since pages still call their own
 * layout internally (layout isn't hoisted to the route level in this pass),
 * this mimics the sidebar + header + content shell so the swap reads as
 * "content loading" rather than a jarring full-page blank/spinner.
 */
export function RouteLoadingFallback() {
  const isVendor = !!localStorage.getItem("vendor_token") && !localStorage.getItem("admin_token") && !localStorage.getItem("support_token");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden w-[240px] shrink-0 border-r border-border bg-card p-4 md:flex md:flex-col md:gap-2">
        <Skeleton className="mb-6 h-8 w-32" />
        {Array.from({ length: isVendor ? 4 : 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-xl" />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="flex-1 space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
