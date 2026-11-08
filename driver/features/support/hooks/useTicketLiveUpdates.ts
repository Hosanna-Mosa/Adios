import { useRef } from "react";
import { usePolling } from "@/hooks/usePolling";

const POLL_MS = 4000;

/** Keeps an open ticket live by polling GET /support/tickets (paused in the
 * background). Returns a manual refresh for the header button. */
export function useTicketLiveUpdates(fetchTickets: (showLoading?: boolean) => Promise<void> | void) {
  // First load shows the spinner and picks the view; later polls refresh quietly.
  const loaded = useRef(false);
  const { refresh, refreshing } = usePolling(
    () => {
      const first = !loaded.current;
      loaded.current = true;
      return fetchTickets(first);
    },
    POLL_MS,
    true,
  );

  return { refresh, refreshing };
}
