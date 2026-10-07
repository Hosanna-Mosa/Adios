import { customFetch } from "@/utils/api/custom-fetch";
import type { Banner, MenuItem, Offer, Vendor } from "@/types/models";

// The browsable catalogue: outlets, their menus, the ₹149 store and the home
// banners. Paths are unchanged from the call sites these replaced.
//
// `extraParams` is an already-encoded, already-&-prefixed string (radius,
// filters, search). It is passed through verbatim so the query the server sees
// is byte-for-byte what it was before.

export const getNearbyVendors = <T = Vendor[]>(
  lat: number | string,
  lng: number | string,
  page: number | string,
  extraParams = "",
) => customFetch<T>(`/vendors/nearby?lat=${lat}&lng=${lng}&page=${page}&limit=20${extraParams}`);

export const getNearbyMeatCentres = <T = Vendor[]>(
  lat: number | string,
  lng: number | string,
  page: number | string,
  extraParams = "",
) => customFetch<T>(`/meat/nearby?lat=${lat}&lng=${lng}&page=${page}&limit=20${extraParams}`);

/** `id` may arrive straight from a route param, which is string | string[]. */
export const getVendor = <T = Vendor>(id: string | string[]) => customFetch<T>(`/vendors/${id}`);

/** Whether a restaurant or meat centre is taking orders right now (see backend utils/outletOrderingState.ts). */
export interface OutletOrderingState {
  name: string;
  /** The partner turned "Accepting orders" off, or the outlet was closed by the Adios team. */
  manuallyClosed: boolean;
  isOpen: boolean;
  label: string;
  opensAt: string | null;
}

export const getOutletOrderingState = (id: string) =>
  customFetch<OutletOrderingState>(`/vendors/${id}/ordering-state`);

export const getVendorMenu = (vendorId: string) =>
  customFetch<MenuItem[]>(`/food/vendor/${vendorId}`);

export const getMeatMenu = (vendorId: string) =>
  customFetch<MenuItem[]>(`/meat/menu/${vendorId}`);

export const getStore149 = <T = any>(lat: number | string, lng: number | string) =>
  customFetch<T>(`/food/store-149?lat=${lat}&lng=${lng}`);

/** `coordParams` is an optional pre-encoded "&lat=..&lng=.." bias. */
export const searchDishes = <T = any>(query: string, coordParams = "") =>
  customFetch<T>(`/food/search?query=${encodeURIComponent(query)}${coordParams}`);

export const getBanners = <T = { data?: Banner[] }>() => customFetch<T>("/banners");

/** Active admin-managed offers, vendor populated (see the Offers page). */
export const getOffers = () => customFetch<{ success?: boolean; data?: Offer[] }>("/offers");

/** meat-centres builds its own filtered URL (paging + rating + open-now). */
export const getMeatCentresByUrl = <T = any>(url: string) => customFetch<T>(url);
