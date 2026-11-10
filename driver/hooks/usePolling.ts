import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

/** Runs `task` now and every `intervalMs` while `enabled`. A tick is skipped
 * while the previous run is still in flight; polling pauses in the background
 * and runs at once on return. `refresh` runs it on demand (for a Refresh
 * button) and `refreshing` is true while that manual run is going. */
export function usePolling(task: () => Promise<void> | void, intervalMs: number, enabled: boolean) {
  const taskRef = useRef(task);
  useEffect(() => {
    taskRef.current = task;
  });
  const inFlight = useRef<Promise<void> | null>(null);
  const mounted = useRef(true);
  const [refreshing, setRefreshing] = useState(false);

  const run = useCallback((): Promise<void> => {
    if (inFlight.current) return inFlight.current;
    const p = Promise.resolve()
      .then(() => taskRef.current())
      .catch((err) => console.warn("[usePolling] Poll failed:", err))
      .finally(() => {
        inFlight.current = null;
      });
    inFlight.current = p;
    return p;
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await run();
    if (mounted.current) setRefreshing(false);
  }, [run]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (!interval) interval = setInterval(run, intervalMs);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    run();
    if (AppState.currentState !== "background") start();
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        run();
        start();
      } else if (next === "background") {
        stop();
      }
    });
    return () => {
      stop();
      sub.remove();
    };
  }, [enabled, intervalMs, run]);

  return { run, refresh, refreshing, mounted };
}
