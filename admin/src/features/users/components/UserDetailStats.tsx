import { Briefcase, ShoppingBag, ArrowLeft, Truck, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";

interface UserDetailStatsProps {
  totalOrders: number;
  deliveryOrders: number;
  ridesOrders: number;
  helperOrders: number;
  packageDeliveryOrders: number;
}

/** The order stats row on UserDetail: one card per service. */
export function UserDetailStats({ totalOrders, deliveryOrders, ridesOrders, helperOrders, packageDeliveryOrders }: UserDetailStatsProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <ShoppingBag className="h-5 w-5 text-blue-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("users.totalHires")}</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <Truck className="h-5 w-5 text-indigo-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{deliveryOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("users.deliveries")}</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <ArrowLeft className="h-5 w-5 rotate-135 text-green-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{ridesOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("users.ridesHired")}</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <Package className="h-5 w-5 text-amber-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{packageDeliveryOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("service.packageDeliveries")}</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <Briefcase className="h-5 w-5 text-orange-500 mx-auto" />
        <p className="text-2xl font-bold text-foreground">{helperOrders}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("users.helperTasks")}</p>
      </StaggerItem>
    </StaggerList>
  );
}

interface UserActivityStatsProps {
  totalSpent?: number;
  averageOrderValue?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  lastOrderAt?: string | null;
}

/**
 * The spend / reliability / recency row on UserDetail — what an admin actually
 * looks a customer up for, beyond which services they booked.
 */
export function UserActivityStats({ totalSpent, averageOrderValue, completedOrders, cancelledOrders, lastOrderAt }: UserActivityStatsProps) {
  const { t } = useTranslation();
  return (
    <StaggerList className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <p className="text-2xl font-bold text-foreground">₹{(totalSpent ?? 0).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("users.totalSpent")}</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <p className="text-2xl font-bold text-foreground">₹{(averageOrderValue ?? 0).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("users.avgOrder")}</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <p className="text-2xl font-bold text-foreground">{completedOrders ?? 0}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("users.completedStat")}</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <p className="text-2xl font-bold text-foreground">{cancelledOrders ?? 0}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("users.cancelledStat")}</p>
      </StaggerItem>
      <StaggerItem className="bg-card border border-border p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <p className="text-2xl font-bold text-foreground">{lastOrderAt ? new Date(lastOrderAt).toLocaleDateString() : "—"}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("users.lastOrder")}</p>
      </StaggerItem>
    </StaggerList>
  );
}
