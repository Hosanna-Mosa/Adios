import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";

// What a place search is doing right now, so the dropdown under a search field can say
// "searching", "no places found" or "couldn't search" instead of just not appearing.
// A store rather than props: the dropdown sits several components below the screen that
// owns the search, and only one place search is on screen at a time.

export type PlaceSearchStatus = "idle" | "loading" | "results" | "empty" | "error";

export const usePlaceSearchStatus = create<{ status: PlaceSearchStatus; setStatus: (s: PlaceSearchStatus) => void }>((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),
}));

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

/**
 * Debounced place search that ignores out-of-date responses (typing "hyd" then
 * "hyderabad" can no longer land the older answer last) and reports its status.
 */
export function usePlaceSearchRunner() {
  const requestId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    requestId.current++;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => () => {
    cancel();
    usePlaceSearchStatus.getState().setStatus("idle");
  }, [cancel]);

  const run = useCallback(
    (text: string, fetcher: (text: string) => Promise<any>, onResults: (results: any[]) => void, setBusy?: (busy: boolean) => void) => {
      const { setStatus } = usePlaceSearchStatus.getState();
      cancel();
      const query = text.trim();
      if (query.length < MIN_CHARS) {
        onResults([]);
        setBusy?.(false);
        setStatus("idle");
        return;
      }
      const id = requestId.current;
      setBusy?.(true);
      setStatus("loading");
      timer.current = setTimeout(async () => {
        try {
          const data = await fetcher(query);
          if (id !== requestId.current) return;
          const results = Array.isArray(data) ? data : [];
          onResults(results);
          setStatus(results.length > 0 ? "results" : "empty");
        } catch (error) {
          if (id !== requestId.current) return;
          console.error("Place search error:", error);
          onResults([]);
          setStatus("error");
        } finally {
          if (id === requestId.current) setBusy?.(false);
        }
      }, DEBOUNCE_MS);
    },
    [cancel],
  );

  return { run };
}
