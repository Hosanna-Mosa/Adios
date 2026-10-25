// A request still pending after SLOW_REQUEST_MS is a slow-network signal. customFetch
// reports it here; <SlowNetworkToast /> subscribes and shows a short message.

export const SLOW_REQUEST_MS = 6000;

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeSlowNetwork(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Start timing a request. Call the returned function when it settles (success or
 * failure) — it cancels the timer so only requests that really took long notify.
 */
export function trackRequestDuration(): () => void {
  const timer = setTimeout(() => {
    listeners.forEach((l) => l());
  }, SLOW_REQUEST_MS);
  return () => clearTimeout(timer);
}
