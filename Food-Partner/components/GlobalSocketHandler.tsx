import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/contexts/authStore";
import { useOrderAlertStore } from "@/contexts/orderAlertStore";
import { queryKeys } from "@/queries/keys";
import { invalidateOrderLists } from "@/queries/orders.queries";
import { socketService } from "@/utils/socketService";
import type { ScheduledRequestAlert } from "@/types/models";
import { alertNewOrder, alertScheduledRequest } from "./liveAlerts";

// Mounted once at the root, for the whole signed-in session — the same job
// VendorLayout does for every page of the web vendor panel. A new-order alert
// that only fired on the dashboard would miss every order that arrived while
// the partner was editing the menu, which is exactly when it matters. With the
// app closed, the push sent alongside each event does this job instead.

export function GlobalSocketHandler() {
  const token = useAuthStore((s) => s.token);
  const vendorId = useAuthStore((s) => s.partner?._id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !vendorId) {
      socketService.disconnect();
      useOrderAlertStore.getState().reset();
      return;
    }

    socketService.connect(token);
    socketService.join(vendorId, "VENDOR");

    const onNewOrder = (data: { id?: string; customerName?: string; totalPrice?: number }) => {
      if (data?.id) {
        alertNewOrder(queryClient, vendorId, { orderId: String(data.id), customerName: data.customerName, totalPrice: data.totalPrice });
      } else {
        invalidateOrderLists(queryClient, vendorId);
      }
    };

    // A past order can change too (a late cancellation), so history refreshes as well.
    const onStatusUpdate = (data: { orderId?: string }) => {
      invalidateOrderLists(queryClient, vendorId);
      if (data?.orderId) queryClient.invalidateQueries({ queryKey: queryKeys.order(String(data.orderId)) });
    };

    const onScheduledRequest = (data: ScheduledRequestAlert) => {
      if (data?.requestId) alertScheduledRequest(queryClient, vendorId, data);
      else queryClient.invalidateQueries({ queryKey: queryKeys.scheduled(vendorId) });
    };

    const onTicketUpdate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supportTickets(vendorId) });
    };

    socketService.on("new_order_vendor", onNewOrder);
    socketService.on("order_status_update_vendor", onStatusUpdate);
    socketService.on("scheduled_delivery_request", onScheduledRequest);
    socketService.on("ticket_updated", onTicketUpdate);

    return () => {
      socketService.off("new_order_vendor", onNewOrder);
      socketService.off("order_status_update_vendor", onStatusUpdate);
      socketService.off("scheduled_delivery_request", onScheduledRequest);
      socketService.off("ticket_updated", onTicketUpdate);
    };
  }, [token, vendorId, queryClient]);

  return null;
}
