import { OrderStatus } from "@/contexts/deliveryStore";

// Lives in contexts/ so the food checkout can set the stage too; re-exported for existing imports.
export { foodStageOf, nextFoodStage } from "@/contexts/foodStage";

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

/** How far the rider must travel before their marker turns to the new direction. */
const TURN_AFTER_METERS = 10;

function metersBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

/**
 * The rider's next position for the map, with a steady heading. The direction is
 * the way they actually travelled since the last turn point, and only once that is
 * at least 10 m — GPS wobble of a metre or two used to swing the marker around, and
 * so did the phone's compass (sent with live updates), which turns whenever the
 * phone does. The compass is only used before there's any movement to go by.
 */
export function nextDriverLocation(prev: any, lat: number, lng: number, reportedHeading?: number | null) {
  if (!prev) {
    return { lat, lng, heading: Number(reportedHeading) || 0, turnLat: lat, turnLng: lng };
  }
  const fromLat = prev.turnLat ?? prev.lat;
  const fromLng = prev.turnLng ?? prev.lng;
  if (metersBetween(fromLat, fromLng, lat, lng) >= TURN_AFTER_METERS) {
    return { lat, lng, heading: calculateBearing(fromLat, fromLng, lat, lng), turnLat: lat, turnLng: lng };
  }
  return { lat, lng, heading: prev.heading ?? 0, turnLat: fromLat, turnLng: fromLng };
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
