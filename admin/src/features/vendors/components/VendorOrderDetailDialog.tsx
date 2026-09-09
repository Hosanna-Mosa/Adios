import { format } from "date-fns";
import { Check, MapPin, Phone, ShieldAlert, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { StatusDisplay, VendorOrder } from "../vendorDashboardTypes";

interface VendorOrderDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: VendorOrder | null;
  getStatusDisplay: (status: string) => StatusDisplay;
  getOrderItems: (order: VendorOrder) => { name: string; quantity: number; price: number }[];
  onMarkAsReady: (orderId: string) => void;
  isUpdatingStatus: boolean;
}

const READY_ELIGIBLE_STATUSES = ["created", "searching_driver", "driver_assigned", "arrived_pickup"];

/** The order detail modal: customer/driver info, items, and the vendor's "mark as ready" action. */
export function VendorOrderDetailDialog({ isOpen, onOpenChange, order, getStatusDisplay, getOrderItems, onMarkAsReady, isUpdatingStatus }: VendorOrderDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>Order Details</span>
            {order && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${getStatusDisplay(order.status).color}`}>{getStatusDisplay(order.status).text}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {order && (
          <div className="space-y-6 pt-4">
            <div className="flex justify-between items-center text-sm border-b pb-3 border-border">
              <div>
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-bold text-foreground ml-1 text-primary">{order._id.startsWith("ORD-") ? order._id : `#${order._id.toUpperCase()}`}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">Placed At:</span>
                <span className="font-medium text-foreground ml-1">{format(new Date(order.createdAt), "hh:mm a")}</span>
              </div>
            </div>

            {order.restaurantPickupCode && (
              <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-2xl flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span className="font-bold text-foreground">Restaurant Pickup Code:</span>
                </div>
                <span className="font-extrabold text-xl text-primary tracking-wider bg-primary/10 px-3 py-1 rounded-xl">{order.restaurantPickupCode}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer info</h4>
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-2">
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-foreground">{order.user?.name || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{order.user?.phone || "N/A"}</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-snug">
                    {order.stops?.find((s) => s.type === "drop")?.items?.deliveryAddress?.formattedAddress || order.stops?.find((s) => s.type === "drop")?.address || "No delivery address specified"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items in Order</h4>
              <div className="bg-muted/10 border rounded-2xl p-4 divide-y divide-border/60">
                {getOrderItems(order).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 text-sm first:pt-0 last:pb-0">
                    <div className="flex gap-2">
                      <span className="font-bold text-primary">{item.quantity}x</span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                {getOrderItems(order).length === 0 && <div className="text-sm text-muted-foreground text-center py-2">No items specified in the stops</div>}

                <div className="flex justify-between items-center pt-3 mt-2 font-bold text-base text-foreground">
                  <span>Total Amount</span>
                  <span>₹{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {order.driver ? (
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Driver</h4>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.driver.user?.name || "Assigned Driver"}</p>
                    <p className="text-xs text-muted-foreground">{order.driver.vehicleType || "Delivery Partner"}</p>
                  </div>
                  {order.driver.user?.phone && (
                    <a href={`tel:${order.driver.user.phone}`} className="h-10 w-10 bg-primary/10 hover:bg-primary/20 rounded-xl flex items-center justify-center text-primary transition-colors">
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 leading-snug">Awaiting driver assignment. We'll show the driver details here once they accept this order.</p>
              </div>
            )}

            {READY_ELIGIBLE_STATUSES.includes(order.status ? order.status.toLowerCase() : "") && (
              <div className="pt-2">
                <Button
                  onClick={() => onMarkAsReady(order._id)}
                  disabled={isUpdatingStatus}
                  className="w-full h-11 text-base font-bold bg-primary hover:bg-primary/95 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/15"
                >
                  {isUpdatingStatus ? (
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Mark as Ready for Pickup
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
