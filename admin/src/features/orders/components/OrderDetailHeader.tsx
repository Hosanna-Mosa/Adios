import { StatusBadge } from "@/components/shared/StatusBadge";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Order } from "../orderDetailTypes";
import { adminOrderStatusLabel } from "../adminOrderStatus";

interface OrderDetailHeaderProps {
  order: Order;
  /** The assigned driver's phone; the "Contact Driver" call link only renders when there is one. */
  driverPhone?: string;
}

/** The order-id/status/created-at header + "Contact Driver" call link on OrderDetail.tsx. */
export function OrderDetailHeader({ order, driverPhone }: OrderDetailHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {order._id.startsWith("ORD-") ? order._id : `#${order._id.substring(order._id.length - 6).toUpperCase()}`}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <StatusBadge status={adminOrderStatusLabel(order.status, t)} variant={order.status === "DELIVERED" || order.status === "COMPLETED" ? "delivered" : "transit"} />
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {t("orders.createdColon", { time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), defaultValue: "Created: {{time}}" })}
          </span>
        </div>
      </div>
      {driverPhone && (
        <a
          href={`tel:${driverPhone.replace(/[^\d+]/g, "")}`}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {t("orders.contactDriver")}
        </a>
      )}
    </div>
  );
}
