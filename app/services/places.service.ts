import { customFetch } from "@/utils/api/custom-fetch";

// Location lookups: place search, zone coverage, route optimisation and the
// nearby-driver feed. Paths, methods and bodies are unchanged from the call
// sites these replaced.

export interface PlaceCoords {
  lat: number;
  lng: number;
}

/** `locationQuery` is an optional pre-encoded "&lat=..&lng=.." bias. */
export const searchPlaces = (input: string, locationQuery = "") =>
  customFetch<any[]>(`/places/autocomplete?input=${encodeURIComponent(input)}${locationQuery}`);

/** helper-task needs the JSON path explicitly. */
export const searchPlacesJson = (input: string) =>
  customFetch<any[]>(`/places/autocomplete?input=${encodeURIComponent(input)}`, { responseType: "json" });

export const getPlaceDetails = <T = PlaceCoords>(placeId: string) =>
  customFetch<T>(`/places/details/${placeId}`);

/** Google's formatted addresses for a point, best match first. */
export const reverseGeocode = (lat: number, lng: number) =>
  customFetch<{ id?: string; name?: string; address: string }[]>(`/places/reverse-geocode?lat=${lat}&lng=${lng}`);

/** Answers whether the app operates at this point. */
export const checkZone = (lat: number | string, lng: number | string) =>
  customFetch<any>(`/zones/check?lat=${lat}&lng=${lng}`);

/** Both callers asked for responseType "json" explicitly; kept here so the
 *  request is byte-for-byte what it was. */
export const optimizeRoute = <T>(body: unknown) =>
  customFetch<T>("/routing/optimize", {
    method: "POST",
    body: JSON.stringify(body),
    responseType: "json",
  });

/** `query` is already-encoded search params (lat/lng/radius). */
export const getNearbyDrivers = <T = any[]>(query: string) =>
  customFetch<T>(`/drivers/nearby?${query}`);

/** Same feed, but for the callers that asked for JSON explicitly. */
export const getNearbyDriversJson = <T = any[]>(query: string) =>
  customFetch<T>(`/drivers/nearby?${query}`, { responseType: "json" });

/** Home passes its own auth header: the count is fetched before the token
 *  getter is installed on a cold start. */
export const getNearbyDriversWithHeaders = <T = any[]>(query: string, headers: HeadersInit) =>
  customFetch<T>(`/drivers/nearby?${query}`, { headers });

/** location-selection asked for JSON explicitly. */
export const searchPlacesJsonBiased = (input: string, locationQuery = "") =>
  customFetch<any[]>(`/places/autocomplete?input=${encodeURIComponent(input)}${locationQuery}`, {
    responseType: "json",
  });
