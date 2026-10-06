import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCart } from "@/services/cart.service";
import { cartKey, fromWire } from "@/contexts/cart.wire";
import type { CartState } from "@/contexts/cart.types";

type Set = (partial: Partial<CartState>) => void;
type Get = () => CartState;

/**
 * Re-checks the cart against the outlet's live menu while the app is open.
 * Hydrate does this only at sign-in, so a dish the restaurant deleted, sold out
 * or repriced afterwards stayed in the cart. Pending edits are written first,
 * so the server's copy is the screen's copy; the cart is only replaced when the
 * server actually corrected something, and those corrections become the
 * notices the cart screen shows.
 */
export const createRefresh = (set: Set, get: Get, flush: () => Promise<void>) => async () => {
  const ownerId = get().ownerId;
  if (!ownerId || get().status !== "ready") return;

  await flush();
  const before = get().items;
  try {
    const data = await getCart();
    // Signed out, or the customer changed the cart while this was in flight —
    // leave it; the next refresh checks the newer cart.
    if (get().ownerId !== ownerId || get().items !== before) return;

    const changes = Array.isArray(data?.changes) ? data.changes : [];
    if (!changes.length) return;

    const items = fromWire(data?.items ?? []);
    const vendorId = items.length ? (data?.vendorId ?? null) : null;
    set({ items, vendorId, ...(items.length ? {} : { vendorName: null }), syncNotices: changes });
    await AsyncStorage.setItem(cartKey(ownerId), JSON.stringify({ vendorId, items })).catch(() => {});
  } catch {
    // Offline: keep the cart as it is until the next check.
  }
};
