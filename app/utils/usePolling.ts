import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

// Live screens poll the REST API instead of listening on a socket. One interval
// per caller; a tick is skipped while the previous request is still running,
// polling pauses in the background and fetches at once on return to the app.

/** Passed to the task: false once the caller unmounted or polling restarted. */
export type IsCurrent = () => boolean;

interface Options {
  /** false stops the interval (refresh() still works). Default true. */
  enabled?: boolean;
  /** Run once as soon as polling starts. Default true. */
  immediate?: boolean;
}

export function usePolling(
  task: (isCurrent: IsCurrent) => Promise<unknown>,
  intervalMs: number | null,
  { enabled = true, immediate = true }: Options = {},
) {
  const taskRef = useRef(task);
  taskRef.current = task;
  const inFlight = useRef<Promise<void> | null>(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback((): Promise<void> => {
    if (inFlight.current) return inFlight.current;
    const gen = generation.current;
    const isCurrent = () => mounted.current && generation.current === gen;
    const p = taskRef.current(isCurrent)
      .then(() => undefined)
      .catch((err) => console.warn("[poll] request failed:", err?.message ?? err))
      .finally(() => {
        inFlight.current = null;
      });
    inFlight.current = p;
    return p;
  }, []);

  /** Fetch now; `refreshing` is true until it settles (joins a tick already in flight). */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await run();
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, [run]);

  useEffect(() => {
    if (!enabled || intervalMs == null) return;
    if (immediate && AppState.currentState === "active") run();
    const timer = setInterval(() => {
      if (AppState.currentState === "active") run();
    }, intervalMs);
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") run();
    });
    return () => {
      generation.current += 1;
      clearInterval(timer);
      sub.remove();
    };
  }, [enabled, intervalMs, immediate, run]);

  return { refresh, refreshing };
}
