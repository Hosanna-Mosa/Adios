// Cart domain types. Split out of contexts/cartStore.ts unchanged.

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

/** A correction the server made after checking the cart against the outlet's live menu. */
export interface CartSyncNotice {
  itemId: string;
  name: string;
  status: "price_changed" | "unavailable" | "removed";
  /** Only on "price_changed". */
  previousPrice?: number;
  price?: number;
}

/** "idle" = nobody signed in yet, "hydrating" = restoring this account's cart, "ready" = safe to push. */
export type CartStatus = "idle" | "hydrating" | "ready";

export interface CartState {
  items: CartItem[];
  vendorId: string | null;
  vendorName: string | null;
  isHoveringSearch: boolean;
  /** The account this cart belongs to. A different account never inherits these items. */
  ownerId: string | null;
  status: CartStatus;
  pendingConflict: PendingCartConflict | null;
  /** Corrections from the last hydrate — stale prices fixed, sold-out lines dropped. */
  syncNotices: CartSyncNotice[];
  clearSyncNotices: () => void;
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
  /** Re-checks the cart against the outlet's live menu (deleted / sold-out / repriced dishes). */
  refresh: () => Promise<void>;
  reset: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}
