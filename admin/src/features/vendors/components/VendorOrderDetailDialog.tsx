import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, MapPin, Phone, ShieldAlert, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { needsAcceptance, PREP_TIME_OPTIONS, type StatusDisplay, type VendorOrder } from "../vendorDashboardTypes";

interface VendorOrderDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: VendorOrder | null;
  getStatusDisplay: (status: string, order?: VendorOrder) => StatusDisplay;
  getOrderItems: (order: VendorOrder) => { name: string; quantity: number; price: number }[];
  onMarkAsReady: (orderId: string) => void;
  onAccept: (orderId: string, prepMinutes: number) => void;
  onReject: (orderId: string) => void;
  isAccepting: boolean;
  isUpdatingStatus: boolean;
}

const READY_ELIGIBLE_STATUSES = ["created", "searching_driver", "driver_assigned", "arrived_pickup"];
const DEFAULT_PREP_MINUTES = 20;

const secondsUntil = (deadline?: string | null) =>
  deadline ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 1000)) : null;
const formatMmSs = (total: number) => `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;

/**
 * The order detail modal: customer/driver info, items, and the vendor's actions —
 * accept (with a prep time) or reject a new food order, then "mark as ready".
 */
export function VendorOrderDetailDialog({
  isOpen, onOpenChange, order, getStatusDisplay, getOrderItems, onMarkAsReady, onAccept, onReject, isAccepting, isUpdatingStatus,
}: VendorOrderDetailDialogProps) {
  const { t } = useTranslation();
  const [prepMinutes, setPrepMinutes] = useState(DEFAULT_PREP_MINUTES);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const awaitingAcceptance = !!order && needsAcceptance(order);
  const canMarkReady =
    !!order && !awaitingAcceptance && !order.foodReadyAt && READY_ELIGIBLE_STATUSES.includes(order.status ? order.status.toLowerCase() : "");
  const busy = isAccepting || isUpdatingStatus;

  // A different order starts from the default prep time, with no half-made reject.
  useEffect(() => {
    setPrepMinutes(DEFAULT_PREP_MINUTES);
    setConfirmingReject(false);
  }, [order?._id]);

  // Seconds left to accept before the order is cancelled automatically.
  const acceptBy = awaitingAcceptance ? order?.restaurantAcceptBy : null;
  const [secondsLeft, setSecondsLeft] = useState<number | null>(() => secondsUntil(acceptBy));
  useEffect(() => {
    setSecondsLeft(secondsUntil(acceptBy));
    if (!acceptBy) return;
    const timer = setInterval(() => setSecondsLeft(secondsUntil(acceptBy)), 1000);
    return () => clearInterval(timer);
  }, [acceptBy]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>{t("vendorDashboard.orderDetails")}</span>
            {order && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${getStatusDisplay(order.status, order).color}`}>{getStatusDisplay(order.status, order).text}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {order && (
          <div className="space-y-6 pt-4">
            <div className="flex justify-between items-center text-sm border-b pb-3 border-border">
              <div>
                <span className="text-muted-foreground">{t("vendorDashboard.orderIdColon")}</span>
                <span className="font-bold text-foreground ml-1 text-primary">{order._id.startsWith("ORD-") ? order._id : `#${order._id.toUpperCase()}`}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">{t("vendorDashboard.placedAtColon")}</span>
                <span className="font-medium text-foreground ml-1">{format(new Date(order.createdAt), "hh:mm a")}</span>
              </div>
            </div>

            {order.restaurantPickupCode && (
              <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-2xl flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span className="font-bold text-foreground">{t("vendorDashboard.restaurantPickupCodeColon")}</span>
                </div>
                <span className="font-extrabold text-xl text-primary tracking-wider bg-primary/10 px-3 py-1 rounded-xl">{order.restaurantPickupCode}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("vendorDashboard.customerInfo")}</h4>
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-2">
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-foreground">{order.user?.name || t("vendorDashboard.anonymous")}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{order.user?.phone || t("vendorDashboard.notAvailable")}</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-snug">
                    {order.stops?.find((s) => s.type === "drop")?.items?.deliveryAddress?.formattedAddress || order.stops?.find((s) => s.type === "drop")?.address || t("vendorDashboard.noDeliveryAddressSpecified")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("vendorDashboard.itemsInOrder")}</h4>
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
                {getOrderItems(order).length === 0 && <div className="text-sm text-muted-foreground text-center py-2">{t("vendorDashboard.noItemsSpecifiedInStops")}</div>}

                <div className="flex justify-between items-center pt-3 mt-2 font-bold text-base text-foreground">
                  <span>{t("vendorDashboard.totalAmount")}</span>
                  <span>₹{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {order.driver ? (
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("vendorDashboard.assignedDriver")}</h4>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.driver.user?.name || t("vendorDashboard.assignedDriverFallback")}</p>
                    <p className="text-xs text-muted-foreground">{order.driver.vehicleType || t("vendorDashboard.deliveryPartner")}</p>
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
                <p className="text-xs text-amber-700 leading-snug">
                  {t(awaitingAcceptance ? "vendorDashboard.acceptToFindDriver" : "vendorDashboard.awaitingDriverAssignment")}
                </p>
              </div>
            )}

            {awaitingAcceptance && (
              <div className="pt-2 space-y-3">
                {confirmingReject ? (
                  <>
                    <p className="text-sm text-foreground text-center leading-snug">{t("vendorDashboard.confirmRejectOrder")}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 h-11 rounded-2xl" onClick={() => setConfirmingReject(false)} disabled={busy}>
                        {t("vendorDashboard.keepOrder")}
                      </Button>
                      <Button variant="destructive" className="flex-1 h-11 rounded-2xl font-bold" onClick={() => onReject(order._id)} disabled={busy}>
                        {t("vendorDashboard.yesRejectOrder")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {secondsLeft !== null && (
                      <p className={`text-sm font-bold text-center ${secondsLeft <= 30 ? "text-red-600" : "text-amber-600"}`}>
                        {secondsLeft > 0
                          ? t("vendorDashboard.acceptWithin", { time: formatMmSs(secondsLeft) })
                          : t("vendorDashboard.acceptTimeUp")}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-foreground text-center">{t("vendorDashboard.prepTimeQuestion")}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {PREP_TIME_OPTIONS.map((minutes) => (
                        <button
                          key={minutes}
                          type="button"
                          onClick={() => setPrepMinutes(minutes)}
                          aria-pressed={prepMinutes === minutes}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                            prepMinutes === minutes ? "bg-primary text-white border-primary" : "bg-muted/30 text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {t("vendorDashboard.prepMinutes", { value: minutes })}
                        </button>
                      ))}
                    </div>
                    <Button
                      onClick={() => onAccept(order._id, prepMinutes)}
                      disabled={busy}
                      className="w-full h-11 text-base font-bold bg-primary hover:bg-primary/95 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/15"
                    >
                      {isAccepting ? (
                        <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="h-5 w-5" />
                          {t("vendorDashboard.acceptReadyIn", { value: prepMinutes })}
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" className="w-full h-10 rounded-2xl text-destructive" onClick={() => setConfirmingReject(true)} disabled={busy}>
                      {t("vendorDashboard.rejectOrder")}
                    </Button>
                  </>
                )}
              </div>
            )}

            {canMarkReady && (
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
                      {t("vendorDashboard.markAsReadyForPickup")}
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
