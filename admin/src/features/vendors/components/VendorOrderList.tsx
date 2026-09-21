import { ChevronRight, Clock, Package } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { StatusDisplay, VendorOrder } from "../vendorDashboardTypes";

interface VendorOrderListProps {
  orders: VendorOrder[] | undefined;
  isLoading: boolean;
  getStatusDisplay: (status: string) => StatusDisplay;
  onOrderClick: (order: VendorOrder) => void;
}

/** The "Recent Orders" panel (left column) on VendorDashboard. */
export function VendorOrderList({ orders, isLoading, getStatusDisplay, onOrderClick }: VendorOrderListProps) {
  return (
    <FadeIn className="bg-card border border-border rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
          View all <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">No orders yet</h3>
          <p className="text-sm text-muted-foreground max-w-[250px] mt-2">New orders from customers will appear here in real-time.</p>
        </div>
      ) : (
        <StaggerList className="space-y-4">
          {orders.slice(0, 10).map((order) => {
            const display = getStatusDisplay(order.status);
            return (
              <StaggerItem
                key={order._id}
                onClick={() => onOrderClick(order)}
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Order {order._id.startsWith("ORD-") ? order._id : `#${order._id.slice(-6).toUpperCase()}`}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.name || "Anonymous"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">₹{order.totalPrice}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${display.color}`}>{display.text}</span>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerList>
      )}
    </FadeIn>
  );
}
