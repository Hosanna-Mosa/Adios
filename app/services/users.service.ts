import { customFetch } from "@/utils/api/custom-fetch";
import type { MenuItem, Vendor } from "@/types/models";

// Every /users and /auth call the app makes. Paths, methods and bodies are
// unchanged from the call sites these replaced.
//
// The profile and address payloads stay loosely typed: the server returns more
// than the app reads and the shapes differ per endpoint, so narrowing them here
// would be a guess rather than a contract.

export interface SavedAddress {
  _id?: string;
  id?: string;
  label?: string;
  address?: string;
  addressLine?: string;
  landmark?: string;
  phone?: string;
  receiverName?: string;
  receiverPhone?: string;
  lat?: number;
  lng?: number;
  /** The endpoint returns more than the app reads; the rest stays open rather
   *  than guessed. */
  [key: string]: any;
}

export const getProfile = () => customFetch<any>("/users/profile");

export const updateProfile = (body: { name: string; username: string; email: string }) =>
  customFetch<any>("/users/profile", { method: "PATCH", body: JSON.stringify(body) });

/** Multipart upload — isFormData tells customFetch not to set a JSON content type. */
export const uploadProfilePicture = (form: FormData) =>
  customFetch<any>("/users/profile-pic", { method: "POST", body: form, isFormData: true });

export const changePassword = (body: { currentPassword: string; newPassword: string }) =>
  customFetch("/users/change-password", { method: "POST", body: JSON.stringify(body) });

export const setBookingPreference = (body: unknown) =>
  customFetch("/users/booking-preference", { method: "PATCH", body: JSON.stringify(body) });

export const getAddresses = () => customFetch<SavedAddress[]>("/users/addresses");

export const getRecentLocations = () => customFetch<SavedAddress[]>("/users/recent-locations");

/** All three address writes return the full updated list, not just the row. */
export const createAddress = (payload: unknown) =>
  customFetch<SavedAddress[]>("/users/addresses", { method: "POST", body: JSON.stringify(payload) });

export const updateAddress = (id: string, payload: unknown) =>
  customFetch<SavedAddress[]>(`/users/addresses/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteAddress = (id: string) =>
  customFetch<SavedAddress[]>(`/users/addresses/${id}`, { method: "DELETE" });

export const getFavouriteOutlets = () => customFetch<Vendor[]>("/users/favorites");

export const getFavouriteItems = () => customFetch<MenuItem[]>("/users/favorite-items");

export const signOutAllDevices = () => customFetch("/auth/logout-all", { method: "POST" });
