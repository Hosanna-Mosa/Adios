import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getOutletOrderingState, type OutletOrderingState } from "@/services/catalog.service";

// How often an open menu re-checks, so a partner switching "Accepting orders"
// off shows up here without the customer leaving the screen.
const REFRESH_MS = 30_000;

/**
 * Live "is this outlet taking orders?" for the restaurant / meat-centre menu.
 * Read on focus and every 30 s while focused. Until the first answer (or if it
 * can't be fetched) the outlet counts as open — the server refuses the order
 * anyway (OrdersService.assertOutletAcceptingOrders), so a network blip never
 * locks the menu.
 */
export function useOutletOrderingState(outletId: string | undefined) {
  const [orderingState, setOrderingState] = useState<OutletOrderingState | null>(null);
  const latestId = useRef(outletId);
  latestId.current = outletId;

  const refresh = useCallback(async () => {
    if (!outletId) return null;
    try {
      const state = await getOutletOrderingState(outletId);
      if (latestId.current === outletId) setOrderingState(state);
      return state;
    } catch {
      return null;
    }
  }, [outletId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      const timer = setInterval(refresh, REFRESH_MS);
      return () => clearInterval(timer);
    }, [refresh])
  );

  const isClosed = orderingState ? !orderingState.isOpen : false;
  return { orderingState, isClosed, refresh };
}
