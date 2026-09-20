import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCart } from "@/services/cart.service";
import { cartKey, fromWire } from "@/contexts/cart.wire";
import type { CartState, CartSyncNotice } from "@/contexts/cart.types";

// Restores an account's cart on sign-in: local mirror first for an instant
// paint, then the server copy, which is authoritative because it has been
// reconciled against the outlet's live menu. Split out of cartStore.ts
// unchanged, including the ownerId guards that stop a late response from
// repainting an account that has since signed out.

type Set = (partial: Partial<CartState>) => void;
type Get = () => CartState;

export const createHydrate = (set: Set, get: Get) => async (userId: string) => {
    if (get().ownerId === userId && get().status !== "idle") return;
    // Starts empty, so a different account never sees the previous one's items,
    // not even for a frame.
    set({ ownerId: userId, status: "hydrating", items: [], vendorId: null, vendorName: null, pendingConflict: null, syncNotices: [] });

    try {
      const raw = await AsyncStorage.getItem(cartKey(userId));
      if (raw && get().ownerId === userId) {
        const cached = JSON.parse(raw);
        set({ items: Array.isArray(cached?.items) ? cached.items : [], vendorId: cached?.vendorId ?? null });
      }
    } catch {
      // A corrupt mirror just means we wait for the server copy.
    }

    try {
      const data = await getCart();
      // A late response for an account that has since signed out must not repaint.
      if (get().ownerId !== userId) return;
      const items = fromWire(data?.items ?? []);
      const vendorId = data?.vendorId ?? null;
      // The server reconciles the stored cart against the live menu, so this
      // response — not the local mirror — is what the customer should see.
      set({ items, vendorId, syncNotices: Array.isArray(data?.changes) ? data.changes : [] });
      await AsyncStorage.setItem(cartKey(userId), JSON.stringify({ vendorId, items })).catch(() => {});
    } catch {
      // Offline sign-in: keep the locally mirrored cart rather than blanking it.
    } finally {
      if (get().ownerId === userId) set({ status: "ready" });
    }
};
