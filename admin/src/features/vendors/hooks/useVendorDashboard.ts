import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { socketService } from "@/lib/socketService";
import { playNewOrderChime } from "@/lib/notificationSound";
import type { ScheduledDeliveryRequest, StatusDisplay, VendorData, VendorOrder } from "../vendorDashboardTypes";

/** All state/query/socket logic for VendorDashboard.tsx (work queue item #7). */
export function useVendorDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const vendorData: VendorData = JSON.parse(localStorage.getItem("vendor_data") || "{}");
  const isMeatVendor = vendorData.role === "meat_vendor";

  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduledRequest, setScheduledRequest] = useState<ScheduledDeliveryRequest | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["vendor-orders", vendorData._id],
    queryFn: () => adminFetch<VendorOrder[]>(`/orders/vendor/${vendorData._id}`),
    enabled: !!vendorData._id,
  });

  const { data: menu } = useQuery({
    queryKey: [isMeatVendor ? "meat-menu" : "vendor-menu", vendorData._id],
    queryFn: () => adminFetch<unknown[]>(isMeatVendor ? `/meat/menu/${vendorData._id}` : `/food/vendor/${vendorData._id}`),
    enabled: !!vendorData._id,
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, accepted }: { requestId: string; accepted: boolean }) =>
      adminFetch(`/orders/scheduled-delivery/${requestId}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ vendorId: vendorData._id, accepted }),
      }),
    onSuccess: (_, variables) => {
      toast.success(variables.accepted ? t("vendorDashboard.scheduledDeliveryAccepted") : t("vendorDashboard.scheduledDeliveryRejected"));
      queryClient.invalidateQueries({ queryKey: ["vendor-scheduled-orders", vendorData._id] });
      setIsScheduleModalOpen(false);
      setScheduledRequest(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || t("vendorDashboard.failedToRespondToScheduledDelivery"));
    },
  });

  const respondToScheduledDelivery = (accepted: boolean) => {
    if (!scheduledRequest?.requestId) return;
    respondMutation.mutate({ requestId: scheduledRequest.requestId, accepted });
  };

  useEffect(() => {
    if (!vendorData._id) return;

    // Connect and Join — VendorLayout (mounted for every /vendor/* page, this
    // one included) already does this and owns the new_order_vendor sound/toast
    // globally, so this page only needs its own status-update and
    // scheduled-delivery handling.
    socketService.connect();
    socketService.join(vendorData._id, "VENDOR");

    // Listen for order status updates
    const handleStatusUpdate = (data: { orderId: string; status: string }) => {
      console.log("[SOCKET] Order status updated:", data);
      queryClient.invalidateQueries({ queryKey: ["vendor-orders", vendorData._id] });

      // If the currently open modal's order is updated, we fetch it or update local state
      if (selectedOrder && selectedOrder._id === data.orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: data.status } : null));
      }
    };

    const handleScheduledDeliveryRequest = (data: ScheduledDeliveryRequest) => {
      playNewOrderChime();
      setScheduledRequest(data);
      setIsScheduleModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ["vendor-scheduled-orders", vendorData._id] });
      toast.info(
        t("vendorDashboard.newScheduledDeliveryRequestFor", {
          when: new Date(data.scheduledFor).toLocaleString(),
          defaultValue: "New scheduled delivery request for {{when}}",
        }),
        { duration: 8000 },
      );
    };

    socketService.on("order_status_update_vendor", handleStatusUpdate);
    socketService.on("scheduled_delivery_request", handleScheduledDeliveryRequest);

    return () => {
      socketService.off("order_status_update_vendor", handleStatusUpdate);
      socketService.off("scheduled_delivery_request", handleScheduledDeliveryRequest);
    };
  }, [vendorData._id, selectedOrder, queryClient, t]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      adminFetch<VendorOrder>(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders", vendorData._id] });
      toast.success(t("vendorDashboard.orderStatusUpdatedSuccessfully"));
      setSelectedOrder(updatedOrder);
    },
    onError: (err: Error) => {
      toast.error(err.message || t("vendorDashboard.failedToUpdateOrderStatus"));
    },
  });

  const markAsReady = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: "picking_items" });
  };

  const totalRevenue = orders?.reduce((acc, order) => acc + (order.totalPrice || 0), 0) || 0;

  // Helper to extract items list from stops
  const getOrderItems = (order: VendorOrder) => {
    const dropStop = order?.stops?.find((s) => s.type === "drop");
    return dropStop?.items?.lines || [];
  };

  // Helper to get formatted status text & colors
  const getStatusDisplay = (status: string): StatusDisplay => {
    const s = status ? status.toLowerCase() : "";
    switch (s) {
      case "created":
      case "searching_driver":
        return { text: t("orderStatus.searchingDriver"), color: "bg-blue-500/10 text-blue-600 border-blue-200" };
      case "driver_assigned":
        return { text: t("orderStatus.driverAssigned"), color: "bg-amber-500/10 text-amber-600 border-amber-200" };
      case "arrived_pickup":
        return { text: t("orderStatus.driverArrived"), color: "bg-violet-500/10 text-violet-600 border-violet-200" };
      case "picking_items":
        return { text: t("orderStatus.preparingPickUp"), color: "bg-pink-500/10 text-pink-600 border-pink-200" };
      case "en_route_delivery":
      case "in_transit":
        return { text: t("orderStatus.outForDelivery"), color: "bg-sky-500/10 text-sky-600 border-sky-200" };
      case "arrived_delivery":
        return { text: t("orderStatus.driverAtCustomer"), color: "bg-purple-500/10 text-purple-600 border-purple-200" };
      case "delivered":
      case "completed":
        return { text: t("orderStatus.delivered"), color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" };
      default:
        return { text: status || t("orderStatus.unknown"), color: "bg-gray-500/10 text-gray-600 border-gray-200" };
    }
  };

  return {
    vendorData,
    isMeatVendor,
    orders,
    ordersLoading,
    menuCount: menu?.length,
    totalRevenue,
    selectedOrder,
    setSelectedOrder,
    isModalOpen,
    setIsModalOpen,
    scheduledRequest,
    setScheduledRequest,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    respondToScheduledDelivery,
    isResponding: respondMutation.isPending,
    markAsReady,
    isUpdatingStatus: updateStatusMutation.isPending,
    getOrderItems,
    getStatusDisplay,
  };
}
