

// Module-level values shared by the parts of useLocationSelection.

export type RecentPlace = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export const RECENT_LOCATIONS_KEY = "recent_locations";

export const recentLocationsKeyFor = (userId?: string | number | null) =>
  userId ? `${RECENT_LOCATIONS_KEY}:${userId}` : `${RECENT_LOCATIONS_KEY}:guest`;

export const toRecentPlace = (place: Partial<RecentPlace> & { description?: string }) => ({
  id: String(place.id || place.address || place.description || Date.now()),
  name: place.name || place.description?.split(",")[0]?.trim() || place.address?.split(",")[0]?.trim() || "Recent place",
  address: place.address || place.description || place.name || "",
  lat: Number(place.lat),
  lng: Number(place.lng),
});
