

// Module-level values shared by the parts of useHelperTask.

export const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export type Step = "compose" | "bidding" | "searching" | "assigned";

/** Backend statuses meaning a helper has taken the task, in both casings the API uses. */
export const ASSIGNED_STATUSES = ["DRIVER_ASSIGNED", "driver_assigned", "accepted", "ACCEPTED"];

/** Backend statuses meaning the helper has begun the work. */
export const STARTED_STATUSES = ["IN_PROGRESS", "in_progress", "EN_ROUTE_DELIVERY", "en_route_delivery"];

/** Backend statuses meaning the task ended before anyone started it. */
export const DEAD_STATUSES = ["CANCELLED", "cancelled", "REJECTED", "rejected"];
