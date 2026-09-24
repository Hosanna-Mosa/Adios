import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Clock, Phone, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { getStatusStyle, type ScheduledRequest } from "../vendorScheduledOrdersTypes";

interface VendorScheduledOrderItemProps {
  request: ScheduledRequest;
  isResponding: boolean;
  onRespond: (requestId: string, accepted: boolean) => void;
}

/** One scheduled-delivery request card in the VendorScheduledOrders list. */
export function VendorScheduledOrderItem({ request, isResponding, onRespond }: VendorScheduledOrderItemProps) {
  const { t } = useTranslation();
  const status = getStatusStyle(request.status, t);
  const StatusIcon = status.icon;

  return (
    <StaggerItem className="border border-border rounded-2xl p-5 bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {request.requestId}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border inline-flex items-center gap-1 ${status.className}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{request.customerName || t("vendorDashboard.customer")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{request.customerPhone || t("vendorDashboard.notAvailable")}</span>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {format(new Date(request.scheduledFor), "EEE, MMM d · hh:mm a")}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("vendorScheduledOrders.requestedOn", {
              date: format(new Date(request.createdAt), "MMM d, yyyy · hh:mm a"),
              defaultValue: "Requested {{date}}",
            })}
            {request.respondedAt
              ? " · " +
                t("vendorScheduledOrders.respondedOn", {
                  date: format(new Date(request.respondedAt), "MMM d, yyyy · hh:mm a"),
                  defaultValue: "Responded {{date}}",
                })
              : ""}
          </p>
        </div>

        {request.status === "pending" && (
          <div className="flex gap-3 shrink-0">
            <Button
              variant="outline"
              className="h-11 rounded-2xl font-bold min-w-[110px]"
              disabled={isResponding}
              onClick={() => onRespond(request.requestId, false)}
            >
              {t("vendorDashboard.reject")}
            </Button>
            <Button
              className="h-11 rounded-2xl font-bold min-w-[110px] bg-primary hover:bg-primary/95"
              disabled={isResponding}
              onClick={() => onRespond(request.requestId, true)}
            >
              {isResponding ? t("vendorDashboard.saving") : t("vendorDashboard.accept")}
            </Button>
          </div>
        )}
      </div>
    </StaggerItem>
  );
}
