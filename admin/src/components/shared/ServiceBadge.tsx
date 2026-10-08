import { Bike, Package, Route, UtensilsCrossed, Wrench, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { orderServiceKind, orderServiceLabel, type OrderServiceFields, type OrderServiceKind } from "./orderService";

// The service an order belongs to, as a small pill: icon + "Package delivery · Bike".

const LOOK: Record<OrderServiceKind, { icon: LucideIcon; className: string }> = {
  packageDelivery: { icon: Package, className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  ride: { icon: Bike, className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  food: { icon: UtensilsCrossed, className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" },
  courier: { icon: Route, className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" },
  helper: { icon: Wrench, className: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300" },
};

export function ServiceBadge({ order }: { order: OrderServiceFields }) {
  const { t } = useTranslation();
  const { icon: Icon, className } = LOOK[orderServiceKind(order)];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {orderServiceLabel(order, t)}
    </span>
  );
}
