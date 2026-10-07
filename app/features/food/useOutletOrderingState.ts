import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getOutletOrderingState, getVendor, type OutletOrderingState } from "@/services/catalog.service";

// How often an open menu re-checks, so a partner switching "Accepting orders"
// off shows up here without the customer leaving the screen.
const REFRESH_MS = 30_000;

/**
 * GET /vendors/:id/ordering-state is newer than GET /vendors/:id, which has long
 * carried the same evaluated `openState`. A server without the newer route (or a
 * blip on it) falls back to that, so a closed restaurant still reads as closed.
 */
async function fetchOrderingState(outletId: string): Promise<OutletOrderingState> {
  try {
    return await getOutletOrderingState(outletId);
  } catch (error) {
    const vendor: any = await getVendor(outletId).catch(() => null);
    if (!vendor?.openState) throw error;
    return {
      name: vendor.name || "",
      manuallyClosed: vendor.isManuallyClosed === true,
      isOpen: vendor.openState.isOpen !== false,
      label: vendor.openState.label || "",
      opensAt: vendor.openState.opensAt ?? null,
    };
  }
}

/**
 * Live "is this outlet taking orders?" for the restaurant / meat-centre menu
 * and the cart. Read on focus and every 30 s while focused.
 *
 * `knownOpen` is what the screen already knows before the first answer — the
 * home card's verdict, passed along as a route param. A closed card stays
 * closed here from the very first frame instead of briefly letting adds
 * through. With no hint and no answer the outlet counts as open: the server
 * refuses the order anyway (OrdersService.assertOutletAcceptingOrders), so a
 * network blip never locks the menu.
 */
export function useOutletOrderingState(outletId: string | undefined | null, knownOpen?: boolean) {
  const [orderingState, setOrderingState] = useState<OutletOrderingState | null>(null);
  const latestId = useRef(outletId);
  latestId.current = outletId;

  const refresh = useCallback(async () => {
    if (!outletId) return null;
    try {
      const state = await fetchOrderingState(outletId);
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

  const isClosed = orderingState ? !orderingState.isOpen : knownOpen === false;
  return { orderingState, isClosed, refresh };
}
