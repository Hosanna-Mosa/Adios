import { Utensils, Star, Clock, IndianRupee, TrendingUp, Drumstick } from "lucide-react";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

interface VendorStatsRowProps {
  ordersCount: number;
  menuCount: number;
  isMeatVendor: boolean;
  totalRevenue: number;
}

/**
 * The 4-card stats row on VendorDashboard. Not built on the shared
 * StatCard: each card here has its own icon background/text color
 * (blue/green/yellow/purple) where StatCard hardcodes one fixed color for
 * every icon, and the badge here is an icon+text pill ("+0%" with a
 * TrendingUp icon) where StatCard's badge is plain text only. Reusing
 * StatCard would drop the per-card color coding and the trend icon, a
 * real visible change, so this stays its own component.
 */
export function VendorStatsRow({ ordersCount, menuCount, isMeatVendor, totalRevenue }: VendorStatsRowProps) {
  const stats = [
    { title: "Today's Orders", value: ordersCount.toString(), icon: Clock, color: "bg-blue-500/10 text-blue-500" },
    { title: isMeatVendor ? "Active Meat Items" : "Active Menu Items", value: menuCount.toString(), icon: isMeatVendor ? Drumstick : Utensils, color: "bg-green-500/10 text-green-500" },
    { title: "Average Rating", value: "4.8", icon: Star, color: "bg-yellow-500/10 text-yellow-500" },
    { title: "Total Revenue", value: `₹${totalRevenue}`, icon: IndianRupee, color: "bg-purple-500/10 text-purple-500" },
  ];

  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StaggerItem key={stat.title} className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp className="h-3 w-3" />
              +0%
            </div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
