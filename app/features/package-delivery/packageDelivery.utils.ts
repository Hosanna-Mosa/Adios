import * as Location from "expo-location";
import type { ImageSourcePropType } from "react-native";
import type { PackageDeliveryPoint, PackageDeliveryVehicle } from "@/contexts/packageDeliveryStore";
import { reverseGeocode } from "@/services/places.service";

// Plain helpers shared by the package delivery screens.

/** The last 10 digits of a phone as stored or typed ("+91 97047 26252" → "9704726252"). */
export const toPhone10 = (value?: string | null) => String(value || "").replace(/\D/g, "").slice(-10);

export const isPhone10 = (value: string) => /^\d{10}$/.test(value);

/** One-line title for an address: its first two comma parts ("507, Ganesh Nagar"). */
export const firstLine = (address?: string) => {
  const parts = String(address || "").split(",").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return "";
  // A bare house number reads as nothing on its own, so keep the street with it.
  return /^\d+[a-z]?$/i.test(parts[0]) && parts[1] ? `${parts[0]}, ${parts[1]}` : parts[0];
};

/** What the driver reads: the typed flat/house number ahead of the searched address. */
export const fullAddress = (point: PackageDeliveryPoint) => {
  const houseNo = point.houseNo?.trim();
  return houseNo ? `${houseNo}, ${point.address}` : point.address;
};

export const contactLine = (point: PackageDeliveryPoint) => `${point.contactName} (${point.contactPhone})`;

/** Straight-line distance, for "captain is N min away" — not a route. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** The device's position and its address — Google's formatted one, else the OS geocoder's. */
export async function locateDevice(): Promise<{ lat: number; lng: number; address: string } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  try {
    const [best] = await reverseGeocode(lat, lng);
    if (best?.address) return { lat, lng, address: best.address };
  } catch {
    // Fall through to the on-device geocoder.
  }
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const parts = [place?.name, place?.street, place?.district, place?.city, place?.region, place?.postalCode];
    const address = parts.filter(Boolean).join(", ");
    if (address) return { lat, lng, address };
  } catch {
    // Coordinates alone are still a usable pickup.
  }
  return { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
}

export interface PackageDeliveryVehicleOption {
  id: PackageDeliveryVehicle;
  nameKey: string;
  hintKey: string;
  image: ImageSourcePropType;
}

/** Bike and auto are the only vehicles dispatch supports today. */
export const PACKAGE_DELIVERY_VEHICLES: PackageDeliveryVehicleOption[] = [
  { id: "bike", nameKey: "app.packageDelivery.vehicle.bike", hintKey: "app.packageDelivery.vehicle.bikeHint", image: require("@/assets/images/services/package_delivery_scooter.png") },
  { id: "auto", nameKey: "app.packageDelivery.vehicle.auto", hintKey: "app.packageDelivery.vehicle.autoHint", image: require("@/assets/images/services/auto_resized.png") },
];
