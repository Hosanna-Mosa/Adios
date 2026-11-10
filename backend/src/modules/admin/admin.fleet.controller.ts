import { Request, Response } from "express";
import Driver, { DriverStatus } from "../../database/models/Driver";
import Order, { OrderStatus } from "../../database/models/Order";

// GET /admin/fleet — every online driver with their last known position, and whether they are on
// a job, for the dashboard's live fleet map. Read straight from the database each time.

// The three raw lowercase strings are legacy client-tracking-sequence values (see Order.ts's
// "_LC" enum members) — "in_transit" has no formal _LC member, but is kept here defensively
// rather than removed outright without confirming no legacy order still uses it.
const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.DRIVER_ASSIGNED,
  OrderStatus.IN_TRANSIT,
  OrderStatus.PICKING_ITEMS,
  "driver_assigned" as OrderStatus,
  "in_transit" as OrderStatus,
  "picking_items" as OrderStatus,
];
const SEARCHING_STATUSES: OrderStatus[] = [OrderStatus.SEARCHING_DRIVER, "searching_driver" as OrderStatus];

export const getFleet = async (_req: Request, res: Response) => {
  try {
    const [drivers, busyDriverIds, searching] = await Promise.all([
      Driver.find({ status: DriverStatus.ONLINE, "currentLocation.coordinates.1": { $exists: true } })
        .select("user vehicleType currentLocation updatedAt")
        .populate("user", "name")
        .lean<any[]>(),
      Order.distinct("driver", { driver: { $ne: null }, status: { $in: ACTIVE_STATUSES } }),
      Order.countDocuments({ status: { $in: SEARCHING_STATUSES } }),
    ]);
    const busy = new Set(busyDriverIds.map(String));
    const points = drivers
      .map((d) => ({
        id: String(d._id),
        name: d.user?.name || "Driver",
        vehicleType: d.vehicleType ?? null,
        busy: busy.has(String(d._id)),
        lng: d.currentLocation.coordinates[0],
        lat: d.currentLocation.coordinates[1],
        updatedAt: d.updatedAt,
      }))
      // [0, 0] is what a driver who never reported a position is stored with.
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng) && !(p.lat === 0 && p.lng === 0));
    return res.json({
      drivers: points,
      counts: {
        online: points.length,
        onJob: points.filter((p) => p.busy).length,
        free: points.filter((p) => !p.busy).length,
        searching,
      },
    });
  } catch (error) {
    console.error("[admin.fleet] failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
