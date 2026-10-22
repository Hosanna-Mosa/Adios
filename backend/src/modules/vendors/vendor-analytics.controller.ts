import { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware";
import Order from "../../database/models/Order";
import { computeVendorAnalytics } from "./vendor-analytics";

const VENDOR_ROLES = ["restaurant_vendor", "meat_vendor"];
const ALLOWED_DAYS = [7, 30, 90];
// Enough for a busy outlet over 90 days; the figures say so when the cap is hit.
const MAX_ORDERS = 20000;

/** GET /vendors/me/analytics?days=7|30|90 — daily sales, top dishes and cancellations for the signed-in outlet. */
export const getMyAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.userId;
    if (!id || !VENDOR_ROLES.includes(String(req.user?.role))) return res.status(403).json({ message: "Only partner accounts have sales analytics" });

    const requested = Number(req.query.days);
    const days = ALLOWED_DAYS.includes(requested) ? requested : 7;
    const now = new Date();
    // One extra day so the earliest India-time day is complete whatever the clock says in UTC.
    const since = new Date(now.getTime() - (days + 1) * 86_400_000);

    const orders = await Order.find({ vendor: id, createdAt: { $gte: since } })
      .select("createdAt status priceBreakdown.baseFare stops.items")
      .sort({ createdAt: -1 })
      .limit(MAX_ORDERS)
      .lean();

    return res.json({ periodDays: days, truncated: orders.length >= MAX_ORDERS, ...computeVendorAnalytics(orders as any[], days, now) });
  } catch (error) {
    console.error("Error computing vendor analytics:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
