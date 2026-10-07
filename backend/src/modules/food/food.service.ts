import mongoose from "mongoose";
import Order, { OrderStatus } from "../../database/models/Order";

// Both casings are excluded so an order cancelled through either code path never counts.
const CANCELLED_STATUSES = [OrderStatus.CANCELLED, "cancelled"];

/**
 * Total quantity ordered per dish id across one outlet's non-cancelled orders.
 *
 * Stop items are persisted as `{ lines: [...] }`, but older orders hold a bare array,
 * so both shapes are unwrapped. A line's dish id is `id ?? _id ?? itemId` and its
 * quantity defaults to 1 (the same rules as OrdersService.extractOrderItems).
 * The `{ vendor: 1, createdAt: -1 }` index serves the leading $match.
 */
export async function getDishOrderCounts(vendorId: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!mongoose.Types.ObjectId.isValid(vendorId)) return counts;

  const rows: { _id: string; count: number }[] = await Order.aggregate([
    {
      $match: {
        vendor: new mongoose.Types.ObjectId(vendorId),
        status: { $nin: CANCELLED_STATUSES },
      },
    },
    { $project: { stops: 1 } },
    { $unwind: "$stops" },
    {
      $project: {
        lines: {
          $cond: [
            { $isArray: "$stops.items" },
            "$stops.items",
            { $cond: [{ $isArray: "$stops.items.lines" }, "$stops.items.lines", []] },
          ],
        },
      },
    },
    { $unwind: "$lines" },
    {
      $project: {
        dishId: {
          $convert: {
            input: { $ifNull: ["$lines.id", { $ifNull: ["$lines._id", "$lines.itemId"] }] },
            to: "string",
            onError: null,
            onNull: null,
          },
        },
        qty: {
          $max: [
            1,
            {
              $round: [
                { $convert: { input: "$lines.quantity", to: "double", onError: 1, onNull: 1 } },
                0,
              ],
            },
          ],
        },
      },
    },
    { $match: { dishId: { $nin: [null, ""] } } },
    { $group: { _id: "$dishId", count: { $sum: "$qty" } } },
  ]);

  for (const row of rows) counts.set(String(row._id), row.count);
  return counts;
}

/** round((price - offerPrice) / price * 100) when the offer is valid, else null. */
export function computeDiscountPercent(price: unknown, offerPrice: unknown): number | null {
  const p = Number(price);
  if (typeof offerPrice !== "number" || !Number.isFinite(p) || p <= 0) return null;
  if (!(offerPrice > 0 && offerPrice < p)) return null;
  return Math.round(((p - offerPrice) / p) * 100);
}

/** Adds the computed orderCount / isBestseller / discountPercent fields to a stored FoodItem. */
export function withComputedDishFields(item: any, counts: Map<string, number>) {
  const orderCount = counts.get(String(item._id)) || 0;
  const threshold = item.bestsellerMinOrders;
  return {
    ...item,
    orderCount,
    isBestseller: typeof threshold === "number" && orderCount >= threshold,
    discountPercent: computeDiscountPercent(item.price, item.offerPrice),
  };
}
