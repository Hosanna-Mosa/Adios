import type { FoodStage } from "./delivery.types";

/**
 * A restaurant food order's stage before a delivery partner is assigned, read from
 * the order the backend returns (GET /orders/:id). See FoodStage.
 */
export function foodStageOf(order: any): FoodStage {
  if (order?.dispatchMode !== "broadcast") return null;
  const s = String(order.status || "").toLowerCase();
  if (s === "created" && !order.restaurantAcceptedAt) return "awaiting_restaurant";
  if (s === "searching_driver") return "preparing";
  return null;
}

/**
 * The same, from a live status update — which carries only the status. A food
 * order waiting on the restaurant moves to "preparing" when it is accepted
 * (SEARCHING_DRIVER); any later status means the stage is over.
 */
export function nextFoodStage(current: FoodStage, backendStatus: string): FoodStage {
  if (!current) return null;
  const s = String(backendStatus || "").toLowerCase();
  if (s === "created") return current;
  if (s === "searching_driver") return "preparing";
  return null;
}
