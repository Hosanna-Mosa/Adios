import { customFetch } from "@/utils/api/custom-fetch";
import type { CartItem, CartSyncNotice } from "@/contexts/cart.types";

// The server-side cart. Paths, methods and bodies are unchanged from the call
// sites these replaced.
//
// `headers` is explicit on the writes because sign-out clears the auth token
// before the debounced push runs — the pending write has to carry the
// credentials it was made under, so it cannot rely on the global token getter.

export interface CartResponse {
  vendorId: string | null;
  items: any[];
  changes?: CartSyncNotice[];
}

export const getCart = () => customFetch<CartResponse>("/cart");

export const clearRemoteCart = (headers?: HeadersInit) =>
  customFetch("/cart", { method: "DELETE", headers });

export const putCart = (
  body: { vendorId: string | null; items: ReturnType<typeof Object>[] | unknown },
  headers?: HeadersInit,
) => customFetch("/cart", { method: "PUT", headers, body: JSON.stringify(body) });
