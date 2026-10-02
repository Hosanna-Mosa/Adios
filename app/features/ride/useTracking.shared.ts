import { OrderStatus } from "@/contexts/deliveryStore";

// Module-level values shared by the parts of useTracking.

export const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime"];

export const STATUS_ORDER: OrderStatus[] = [
  "confirmed",
  "driver_assigned",
  "en_route_pickup",
  "arrived_pickup",
  "picking_items",
  "en_route_delivery",
  "arrived_delivery",
  "delivered",
];

export function normalizeStatus(backendStatus: string): OrderStatus {
  const s = backendStatus.toLowerCase();
  switch (s) {
    case "created":
    case "searching_driver":
      return "confirmed";
    case "driver_assigned":
      return "driver_assigned";
    case "en_route_pickup":
    case "on_the_way":
      return "en_route_pickup";
    case "arrived_pickup":
      return "arrived_pickup";
    case "picking_items":
      return "picking_items";
    case "en_route_delivery":
    case "in_transit":
    // A helper task has no pickup/drop legs; IN_PROGRESS is its "work underway"
    // status (see OrderStatus in the backend's Order model) and maps to the same
    // slot. Unmapped, it hit the default below and knocked the timeline back to
    // "confirmed" the moment the helper started.
    case "in_progress":
      return "en_route_delivery";
    case "arrived_delivery":
      return "arrived_delivery";
    case "delivered":
    case "completed":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "confirmed";
  }
}

export function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const deltaLambda = (lng2 - lng1) * rad;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (theta * (180 / Math.PI) + 360) % 360;
}

export function calculateDynamicETA(
  driverLoc: { lat: number; lng: number } | null,
  targetLoc: { lat: number; lng: number } | null,
  fallbackEta: number
): number {
  if (!driverLoc || !targetLoc || !driverLoc.lat || !targetLoc.lat) return fallbackEta;
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (targetLoc.lat - driverLoc.lat) * rad;
  const dLng = (targetLoc.lng - driverLoc.lng) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(driverLoc.lat * rad) * Math.cos(targetLoc.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const minutes = Math.round((distanceKm / 22) * 60);
  return Math.max(1, minutes);
}

export type TimelineStep = { label: string; done: boolean; current: boolean };
