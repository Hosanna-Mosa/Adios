import { router } from "expo-router";

import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";

export const authHeaders = (token: string): Record<string, string> => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

/** Signs out and bounces to /auth when the token is genuinely rejected. */
export function bailIfUnauthorized(status: number): boolean {
  if (status === 401 || status === 403) {
    useDriverStore.getState().logout();
    router.replace("/auth");
    return true;
  }
  return false;
}

export async function patchOnboarding(token: string, data: Record<string, any>) {
  const res = await fetch(`${API_URL}/onboarding`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return res;
}

export async function postOnboarding(token: string, path: string, body?: Record<string, any>) {
  return fetch(`${API_URL}/onboarding/${path}`, {
    method: "POST",
    headers: authHeaders(token),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

export async function getOnboarding(token: string) {
  return fetch(`${API_URL}/onboarding`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getZones(token: string) {
  return fetch(`${API_URL}/zones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAddresses(token: string) {
  return fetch(`${API_URL}/users/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function postHomeAddress(
  token: string,
  addressLine: string,
  lat: number | null,
  lng: number | null,
) {
  return fetch(`${API_URL}/users/addresses`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      label: "Home",
      addressLine,
      // The driver's own number. Left out when the store doesn't have it yet —
      // the backend then saves the account's phone — instead of a made-up one.
      phone: useDriverStore.getState().driverPhone || undefined,
      coordinates: { lat, lng },
    }),
  });
}
