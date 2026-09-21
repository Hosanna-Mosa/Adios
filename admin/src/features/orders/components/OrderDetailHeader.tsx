import { StatusBadge } from "@/components/shared/StatusBadge";
import { Clock } from "lucide-react";
import type { Order } from "../orderDetailTypes";

interface OrderDetailHeaderProps {
  order: Order;
  onContactDriver: () => void;
}

/** The order-id/status/created-at header + "Contact Driver" button on OrderDetail.tsx. */
export function OrderDetailHeader({ order, onContactDriver }: OrderDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {order._id.startsWith("ORD-") ? order._id : `#${order._id.substring(order._id.length - 6).toUpperCase()}`}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <StatusBadge status={order.status} variant={order.status === "DELIVERED" || order.status === "COMPLETED" ? "delivered" : "transit"} />
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Created: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      <button
        onClick={onContactDriver}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Contact Driver
      </button>
    </div>
  );
}
