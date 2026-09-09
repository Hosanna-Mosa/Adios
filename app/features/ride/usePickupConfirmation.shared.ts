import * as Location from "expo-location";

// Module-level values shared by the parts of usePickupConfirmation.

export type FareEstimate = {
  distanceInKm: number;
  estimatedMinutes: number;
  fareBreakdown: {
    total: number;
  };
};

export const normalizeServiceType = (serviceId?: string) => {
  if (serviceId === "bike-lite") return "bike";
  // if (serviceId === "cab-prime") return "cab_prime";
  if (serviceId === "bike" || serviceId === "auto" || serviceId === "cab") {
    return serviceId;
  }
  return "cab";
};

export const formatGeocodeAddress = (place: Location.LocationGeocodedAddress) => {
  const parts = [
    place.name,
    place.street,
    place.district,
    place.city,
    place.region,
    place.postalCode,
  ].filter(Boolean);
  return parts.join(", ") || "Current location";
};
