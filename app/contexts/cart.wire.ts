import type { CartItem } from "./cart.types";

// Translation between the cart as the app holds it and the shape the /cart
// endpoint expects. Split out of contexts/cartStore.ts unchanged — the
// defensive coercion here is what keeps a malformed row from reaching the UI.

export const cartKey = (userId: string) => `cart:${userId}`;

export const toWire = (items: CartItem[]) =>
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

export const fromWire = (rows: any[]): CartItem[] =>
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
