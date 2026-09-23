import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StaggerList } from "@/components/motion/StaggerList";
import { VendorScheduledOrderItem } from "./VendorScheduledOrderItem";
import type { ScheduledRequest } from "../vendorScheduledOrdersTypes";

interface VendorScheduledOrderListProps {
  isLoading: boolean;
  requests: ScheduledRequest[];
  respondingId: string | null;
  isResponding: boolean;
  onRespond: (requestId: string, accepted: boolean) => void;
}

/** The loading/empty/list states for the scheduled-order requests on VendorScheduledOrders. */
export function VendorScheduledOrderList({ isLoading, requests, respondingId, isResponding, onRespond }: VendorScheduledOrderListProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("vendorScheduledOrders.loadingScheduledOrders")}</p>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <CalendarClock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">{t("vendorScheduledOrders.noScheduledOrdersYet")}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            {t("vendorScheduledOrders.laterDeliveryRequestsAppearHere")}
          </p>
        </div>
      ) : (
        <StaggerList className="space-y-4">
          {requests.map((request) => (
            <VendorScheduledOrderItem
              key={request.requestId}
              request={request}
              isResponding={respondingId === request.requestId && isResponding}
              onRespond={onRespond}
            />
          ))}
        </StaggerList>
      )}
    </div>
  );
}
