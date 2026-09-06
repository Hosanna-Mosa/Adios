/**
 * Suspense fallback for lazy-loaded routes. Unlike admin/'s version, this
 * site has no persistent sidebar/shell to mimic — just a simple centered
 * spinner, since the fallback is only ever visible for a moment during a
 * route-chunk download.
 */
export function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}
