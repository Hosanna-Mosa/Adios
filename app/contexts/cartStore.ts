import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { customFetch } from "@/utils/api/custom-fetch";
import { useAuthStore } from "@/contexts/authStore";

export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  images: string[];
}

export interface CartItem extends FoodItem {
  quantity: number;
}

/** An add that was blocked because the cart already holds another outlet's items. */
export interface PendingCartConflict {
  item: FoodItem;
  vendorId: string;
  vendorName?: string;
}

/** "idle" = nobody signed in yet, "hydrating" = restoring this account's cart, "ready" = safe to push. */
export type CartStatus = "idle" | "hydrating" | "ready";

interface CartState {
  items: CartItem[];
  vendorId: string | null;
  vendorName: string | null;
  isHoveringSearch: boolean;
  /** The account this cart belongs to. A different account never inherits these items. */
  ownerId: string | null;
  status: CartStatus;
  pendingConflict: PendingCartConflict | null;
  setIsHoveringSearch: (hovering: boolean) => void;
  addItem: (item: FoodItem, vendorId: string, vendorName?: string) => void;
  /** Returns 'added' when the item went in, 'conflict' when a dialog is now pending. */
  requestAddItem: (item: FoodItem, vendorId: string, vendorName?: string) => "added" | "conflict";
  /** 'clear' empties the cart then adds the pending item. 'keep' discards the pending item. */
  resolveConflict: (choice: "clear" | "keep") => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  /** Swaps the whole cart in one write — used by reorder so a burst is a single sync. */
  replaceCart: (vendorId: string | null, items: CartItem[], vendorName?: string) => void;
  hydrate: (userId: string) => Promise<void>;
  reset: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const cartKey = (userId: string) => `cart:${userId}`;

const toWire = (items: CartItem[]) =>
  items.map((item) => ({
    itemId: item._id,
    name: item.name || "Item",
    description: item.description ?? "",
    price: Number(item.price) || 0,
    category: item.category ?? "",
    isVeg: item.isVeg !== false,
    images: Array.isArray(item.images) ? item.images.filter((url) => typeof url === "string") : [],
    quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
  }));

const fromWire = (rows: any[]): CartItem[] =>
  (rows ?? [])
    .map((row) => ({
      _id: String(row?.itemId ?? row?._id ?? ""),
      name: String(row?.name ?? ""),
      description: String(row?.description ?? ""),
      price: Number(row?.price) || 0,
      category: String(row?.category ?? ""),
      isVeg: row?.isVeg !== false,
      images: Array.isArray(row?.images) && row.images.length
        ? row.images
        : row?.image
          ? [String(row.image)]
          : [],
      quantity: Math.max(1, Math.round(Number(row?.quantity) || 1)),
    }))
    .filter((item) => !!item._id);

let syncTimer: ReturnType<typeof setTimeout> | null = null;
// One chain rather than parallel requests, so a stale +1 can never land after a
// +2 and resurrect an old quantity.
let syncChain: Promise<void> = Promise.resolve();

/**
 * Pushes the current cart to the server and mirrors it under the owner's key.
 * `owner`/`token` are passed explicitly on sign-out, where the auth store has
 * already dropped the credentials the pending write still needs.
 */
function runSync(owner?: string, token?: string | null) {
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
        await customFetch("/cart", { method: "DELETE", headers });
      } else {
        await customFetch("/cart", {
          method: "PUT",
          headers,
          body: JSON.stringify({ vendorId: snapshot.vendorId, items: toWire(snapshot.items) }),
        });
      }
    } catch {
      // Offline or a failed request: the local cart is untouched and the mirror
      // above still survives a restart. The next successful write wins.
    }
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
    scheduleSync();
  },

  removeItem: (itemId) => {
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

  hydrate: async (userId) => {
    if (get().ownerId === userId && get().status !== "idle") return;
    // Starts empty, so a different account never sees the previous one's items,
    // not even for a frame.
    set({ ownerId: userId, status: "hydrating", items: [], vendorId: null, vendorName: null, pendingConflict: null });

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
      const data = await customFetch<{ vendorId: string | null; items: any[] }>("/cart");
      // A late response for an account that has since signed out must not repaint.
      if (get().ownerId !== userId) return;
      const items = fromWire(data?.items ?? []);
      const vendorId = data?.vendorId ?? null;
      set({ items, vendorId });
      await AsyncStorage.setItem(cartKey(userId), JSON.stringify({ vendorId, items })).catch(() => {});
    } catch {
      // Offline sign-in: keep the locally mirrored cart rather than blanking it.
    } finally {
      if (get().ownerId === userId) set({ status: "ready" });
    }
  },

  reset: () => {
    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
    }
    set({ items: [], vendorId: null, vendorName: null, ownerId: null, status: "idle", pendingConflict: null });
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

const ownerIdOf = (state: { user: any | null; token: string | null }) => {
  if (!state.token || !state.user) return null;
  const id = state.user._id || state.user.id;
  return id ? String(id) : null;
};

let lastOwnerId: string | null = null;
let lastToken: string | null = null;

/**
 * The cart follows the account, not the JS runtime. Every sign-in path
 * (cold-start restore, password login, OTP login) and sign-out ends in an auth
 * store write, so one subscription covers all of them — including an account
 * switch, which resets before it hydrates.
 */
function syncOwnerFromAuth(state: { user: any | null; token: string | null }) {
  const nextOwner = ownerIdOf(state);
  const previousOwner = lastOwnerId;
  const previousToken = lastToken;
  lastOwnerId = nextOwner;
  lastToken = state.token;

  if (nextOwner === previousOwner) return;

  if (previousOwner) {
    // Sign-out drops the token before any debounced write has run, so the last
    // edit is pushed here with the credentials it was made under.
    if (syncTimer) {
      clearTimeout(syncTimer);
      syncTimer = null;
    }
    runSync(previousOwner, previousToken);
  }

  useCartStore.getState().reset();
  if (nextOwner) {
    void useCartStore.getState().hydrate(nextOwner);
  }
}

useAuthStore.subscribe((state) => syncOwnerFromAuth(state));
syncOwnerFromAuth(useAuthStore.getState());
