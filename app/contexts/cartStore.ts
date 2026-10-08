import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearRemoteCart, putCart } from "@/services/cart.service";
import { useAuthStore } from "@/contexts/authStore";
import type { CartItem, CartState, CartSyncNotice } from "@/contexts/cart.types";
import { cartKey, toWire } from "@/contexts/cart.wire";
import { createHydrate } from "@/contexts/cart.hydrate";
import { createRefresh } from "@/contexts/cart.refresh";
import { trackEvent } from "@/utils/analytics";
export type { CartItem, CartState, CartStatus, CartSyncNotice, FoodItem, PendingCartConflict } from "@/contexts/cart.types";

let syncTimer: ReturnType<typeof setTimeout> | null = null;
// One chain rather than parallel requests, so a stale +1 can never land after a
// +2 and resurrect an old quantity.
let syncChain: Promise<void> = Promise.resolve();

/**
 * Pushes the current cart to the server and mirrors it under the owner's key.
 * `owner`/`token` are passed explicitly on sign-out, where the auth store has
 * already dropped the credentials the pending write still needs.
 */
export function runSync(owner?: string, token?: string | null) {
  const { ownerId, status, items, vendorId } = useCartStore.getState();
  const targetOwner = owner ?? ownerId;
  if (!targetOwner) return;
  // An idle or still-hydrating cart is not the account's cart yet — pushing it
  // would overwrite the saved one with an empty placeholder.
  if (!owner && status !== "ready") return;

  const authToken = token !== undefined ? token : useAuthStore.getState().token;
  const snapshot = { vendorId, items };

  syncChain = syncChain.then(async () => {
    try {
      await AsyncStorage.setItem(cartKey(targetOwner), JSON.stringify(snapshot));
    } catch {
      // A missing local mirror only costs a slower first paint next sign-in.
    }
    try {
      const headers = authToken ? { authorization: `Bearer ${authToken}` } : undefined;
      if (!snapshot.items.length) {
        await clearRemoteCart(headers);
      } else {
        await putCart({ vendorId: snapshot.vendorId, items: toWire(snapshot.items) }, headers);
      }
    } catch {
      // Offline or a failed request: the local cart is untouched and the mirror
      // above still survives a restart. The next successful write wins.
    }
  });
}

/** add_to_cart / remove_from_cart, one unit at a time, with the item and outlet. */
function trackCartChange(
  name: "add_to_cart" | "remove_from_cart",
  item: Pick<CartItem, "_id" | "name" | "price" | "category" | "isVeg">,
  quantity: number,
  vendorId: string | null,
  vendorName: string | null | undefined,
) {
  trackEvent(name, {
    item_id: item._id,
    item_name: item.name,
    item_category: item.category,
    price: item.price,
    is_veg: item.isVeg,
    quantity,
    vendor_id: vendorId ?? undefined,
    vendor_name: vendorName ?? undefined,
  });
}

function scheduleSync(immediate = false) {
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
  if (immediate) {
    runSync();
    return;
  }
  syncTimer = setTimeout(() => {
    syncTimer = null;
    runSync();
  }, 400);
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  vendorId: null,
  vendorName: null,
  isHoveringSearch: false,
  ownerId: null,
  status: "idle",
  pendingConflict: null,
  syncNotices: [],
  clearSyncNotices: () => set({ syncNotices: [] }),
  setIsHoveringSearch: (hovering) => set({ isHoveringSearch: hovering }),

  addItem: (item, vendorId, vendorName) => {
    get().requestAddItem(item, vendorId, vendorName);
  },

  requestAddItem: (item, vendorId, vendorName) => {
    const { items, vendorId: currentVendorId } = get();

    // Items from two outlets can't share one cart — surface the choice instead
    // of silently replacing what's already there.
    if (currentVendorId && items.length > 0 && currentVendorId !== vendorId) {
      set({ pendingConflict: { item, vendorId, vendorName } });
      return "conflict";
    }

    const existingItem = items.find((i) => i._id === item._id);
    if (existingItem) {
      set({
        items: items.map((i) => (i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i)),
        vendorId,
        vendorName: vendorName ?? get().vendorName,
      });
    } else {
      set({
        items: [...items, { ...item, quantity: 1 }],
        vendorId,
        vendorName: vendorName ?? get().vendorName,
      });
    }
    trackCartChange("add_to_cart", item, 1, vendorId, vendorName ?? get().vendorName);
    scheduleSync();
    return "added";
  },

  resolveConflict: (choice) => {
    const pending = get().pendingConflict;
    if (!pending) return;
    if (choice === "keep") {
      set({ pendingConflict: null });
      return;
    }
    set({
      items: [{ ...pending.item, quantity: 1 }],
      vendorId: pending.vendorId,
      vendorName: pending.vendorName ?? null,
      pendingConflict: null,
    });
    trackCartChange("add_to_cart", pending.item, 1, pending.vendorId, pending.vendorName);
    scheduleSync();
  },

  removeItem: (itemId) => {
    const removed = get().items.find((i) => i._id === itemId);
    if (removed) trackCartChange("remove_from_cart", removed, removed.quantity, get().vendorId, get().vendorName);
    set((state) => {
      const newItems = state.items.filter((i) => i._id !== itemId);
      return {
        items: newItems,
        vendorId: newItems.length === 0 ? null : state.vendorId,
        vendorName: newItems.length === 0 ? null : state.vendorName,
      };
    });
    scheduleSync();
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    const current = get().items.find((i) => i._id === itemId);
    if (current && quantity !== current.quantity) {
      trackCartChange(
        quantity > current.quantity ? "add_to_cart" : "remove_from_cart",
        current,
        Math.abs(quantity - current.quantity),
        get().vendorId,
        get().vendorName,
      );
    }
    set((state) => ({
      items: state.items.map((i) => (i._id === itemId ? { ...i, quantity } : i)),
    }));
    scheduleSync();
  },

  clearCart: () => {
    set({ items: [], vendorId: null, vendorName: null, pendingConflict: null });
    // Order placement navigates away immediately, so this one can't sit on a debounce.
    scheduleSync(true);
  },

  replaceCart: (vendorId, items, vendorName) => {
    set({
      items,
      vendorId: items.length ? vendorId : null,
      vendorName: items.length ? vendorName ?? null : null,
      pendingConflict: null,
    });
    scheduleSync();
  },

  hydrate: createHydrate(set, get),
  refresh: createRefresh(set, get, flushCartSync),

  reset: () => {
    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
    }
    set({ items: [], vendorId: null, vendorName: null, ownerId: null, status: "idle", pendingConflict: null, syncNotices: [] });
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

/** Sends an edit still waiting on the debounce, then resolves once every queued write has landed. */
export function flushCartSync(): Promise<void> {
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
    runSync();
  }
  return syncChain;
}

/** Cancels a pending debounced push — used on sign-out and on reset. */
export function clearSyncTimer() {
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
}
