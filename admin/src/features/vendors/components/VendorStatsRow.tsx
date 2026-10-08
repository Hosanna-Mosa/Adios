import { Utensils, Star, Clock, IndianRupee, Drumstick } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

interface VendorStatsRowProps {
  ordersCount: number;
  menuCount: number;
  isMeatVendor: boolean;
  totalRevenue: number;
  /** The outlet's real rating from GET /vendors/me; null until it has one. */
  rating: number | null;
}

/**
 * The 4-card stats row on VendorDashboard. Not built on the shared
 * StatCard: each card here has its own icon background/text color
 * (blue/green/yellow/purple) where StatCard hardcodes one fixed color for
 * every icon. Reusing StatCard would drop the per-card color coding, a
 * real visible change, so this stays its own component. The "+0%" trend pill
 * every card used to carry was decorative (no period-over-period figure
 * exists behind it) and was removed, as was the hardcoded "4.8" rating.
 */
export function VendorStatsRow({ ordersCount, menuCount, isMeatVendor, totalRevenue, rating }: VendorStatsRowProps) {
  const { t } = useTranslation();
  const stats = [
    { title: t("vendorDashboard.todaysOrders"), value: ordersCount.toString(), icon: Clock, color: "bg-blue-500/10 text-blue-500" },
    { title: isMeatVendor ? t("vendorDashboard.activeMeatItems") : t("vendorDashboard.activeMenuItems"), value: menuCount.toString(), icon: isMeatVendor ? Drumstick : Utensils, color: "bg-green-500/10 text-green-500" },
    { title: t("vendorDashboard.averageRating"), value: rating && rating > 0 ? rating.toFixed(1) : "—", icon: Star, color: "bg-yellow-500/10 text-yellow-500" },
    { title: t("vendorDashboard.totalRevenue"), value: `₹${totalRevenue}`, icon: IndianRupee, color: "bg-purple-500/10 text-purple-500" },
  ];

  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StaggerItem key={stat.title} className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
