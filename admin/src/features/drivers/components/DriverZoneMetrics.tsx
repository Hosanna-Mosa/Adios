import { useTranslation } from "react-i18next";
import type { AdminDriver, AdminOrderSummary, AdminZone } from "../types";

const COMPLETED = ["DELIVERED", "COMPLETED", "delivered", "completed"];
const CANCELLED = ["CANCELLED", "cancelled", "rejected", "failed"];

interface DriverZoneMetricsProps {
  zones: AdminZone[];
  /** The full fleet (not the search-filtered list) so metrics don't shift while searching. */
  drivers: AdminDriver[];
  orders: AdminOrderSummary[];
}

const zoneIdOf = (d: AdminDriver) => (typeof d.preferredZone === "object" && d.preferredZone ? d.preferredZone._id : d.preferredZone);
const driverIdOf = (o: AdminOrderSummary) => (typeof o.driver === "string" ? o.driver : o.driver?._id);

/** Per-zone coverage and demand, assembled from the zones, drivers and orders the page already has. */
export function DriverZoneMetrics({ zones, drivers, orders }: DriverZoneMetricsProps) {
  const { t } = useTranslation();

  const zoneMetrics = zones.map((z) => {
    const zoneDrivers = drivers.filter((d) => zoneIdOf(d) === z._id);
    const zoneDriverIds = new Set(zoneDrivers.map((d) => d._id));
    const zoneOrders = orders.filter((o) => {
      const driverId = driverIdOf(o);
      return !!driverId && zoneDriverIds.has(driverId);
    });
    const completed = zoneOrders.filter((o) => COMPLETED.includes(o.status || ""));
    return {
      id: z._id,
      name: z.name,
      type: z.type,
      isActive: z.isActive,
      multiplier: z.pricingMultiplier ?? 1,
      driverCount: zoneDrivers.length,
      onlineDrivers: zoneDrivers.filter((d) => d.status === "ONLINE").length,
      orderCount: zoneOrders.length,
      completedCount: completed.length,
      cancelledCount: zoneOrders.filter((o) => CANCELLED.includes(o.status || "")).length,
      revenue: completed.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    };
  });

  return (
    <div>
      <h4 className="text-sm font-bold text-foreground mb-1">{t("drivers.zoneMetrics")}</h4>
      <p className="text-xs text-muted-foreground mb-3">{t("drivers.zoneMetricsDesc")}</p>
      {zoneMetrics.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">{t("drivers.noZonesConfiguredYet")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border bg-muted/20 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="text-left px-4 py-3">{t("drivers.zoneCol")}</th>
                <th className="text-left px-4 py-3">{t("drivers.typeCol")}</th>
                <th className="text-left px-4 py-3">{t("drivers.statusCol")}</th>
                <th className="text-left px-4 py-3">{t("drivers.surgeCol")}</th>
                <th className="text-left px-4 py-3">{t("drivers.driversCol")}</th>
                <th className="text-left px-4 py-3">{t("drivers.onDutyCol")}</th>
                <th className="text-left px-4 py-3">{t("drivers.ordersCol")}</th>
                <th className="text-left px-4 py-3">{t("drivers.completedCol")}</th>
                <th className="text-left px-4 py-3">{t("drivers.cancelledCol")}</th>
                <th className="text-left px-4 py-3">{t("drivers.revenueCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {zoneMetrics.map((z) => (
                <tr key={z.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">{z.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{z.type || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        z.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {z.isActive ? t("drivers.zoneActive") : t("drivers.zoneInactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{z.multiplier}x</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">{z.driverCount}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{z.onlineDrivers}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">{z.orderCount}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{z.completedCount}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{z.cancelledCount}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">₹{z.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
