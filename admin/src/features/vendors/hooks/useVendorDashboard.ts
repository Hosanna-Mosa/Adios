import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { VENDOR_LIVE_REFRESH_MS } from "./useVendorLiveAlerts";
import type { ScheduledRequest } from "../vendorScheduledOrdersTypes";
import { needsAcceptance, type ScheduledDeliveryRequest, type StatusDisplay, type VendorData, type VendorOrder } from "../vendorDashboardTypes";

/** All state/query/polling logic for VendorDashboard.tsx (work queue item #7). */
export function useVendorDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const vendorData: VendorData = JSON.parse(localStorage.getItem("vendor_data") || "{}");
  const isMeatVendor = vendorData.role === "meat_vendor";

  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduledRequest, setScheduledRequest] = useState<ScheduledDeliveryRequest | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const {
    data: orders,
    isLoading: ordersLoading,
    isFetching: ordersFetching,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["vendor-orders", vendorData._id],
    queryFn: () => adminFetch<VendorOrder[]>(`/orders/vendor/${vendorData._id}`),
    enabled: !!vendorData._id,
    refetchInterval: VENDOR_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  // Same key/endpoint as useVendorScheduledOrders and VendorLayout's
  // useVendorLiveAlerts (which owns the chime + toast for a new request);
  // this page additionally pops the accept/reject dialog for it.
  const {
    data: scheduledRequests,
    isFetching: scheduledFetching,
    refetch: refetchScheduled,
  } = useQuery({
    queryKey: ["vendor-scheduled-orders", vendorData._id],
    queryFn: () => adminFetch<ScheduledRequest[]>(`/orders/scheduled-delivery/vendor/${vendorData._id}`),
    enabled: !!vendorData._id,
    refetchInterval: VENDOR_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });

  const { data: menu } = useQuery({
    queryKey: [isMeatVendor ? "meat-menu" : "vendor-menu", vendorData._id],
    queryFn: () => adminFetch<unknown[]>(isMeatVendor ? `/meat/menu/${vendorData._id}` : `/food/vendor/${vendorData._id}`),
    enabled: !!vendorData._id,
  });

  // The outlet's own profile, for its real rating (the stats card used to show
  // a hardcoded "4.8"). Vendor tokens carry the Vendor/MeatCenter _id.
  const { data: profile } = useQuery({
    queryKey: ["vendor-profile", vendorData._id],
    queryFn: () => adminFetch<{ rating?: number }>("/vendors/me"),
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

  // Keep the open order dialog in step with each refreshed list — what the
  // order_status_update_vendor socket event used to patch in.
  useEffect(() => {
    if (!orders) return;
    setSelectedOrder((prev) => {
      if (!prev) return prev;
      const latest = orders.find((o) => o._id === prev._id);
      if (!latest) return prev;
      if (latest.status === prev.status && (latest.cancelReason ?? null) === (prev.cancelReason ?? null)) return prev;
      return { ...prev, status: latest.status, cancelReason: latest.cancelReason };
    });
  }, [orders]);

  // Open the accept/reject dialog for a pending request not seen on the
  // previous read. The first read only seeds what has been seen, so opening
  // the dashboard doesn't pop a dialog for requests that were already there.
  const seenRequestIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!scheduledRequests) return;
    if (!seenRequestIds.current) {
      seenRequestIds.current = new Set(scheduledRequests.map((r) => r.requestId));
      return;
    }
    const seen = seenRequestIds.current;
    const fresh = scheduledRequests.filter((r) => !seen.has(r.requestId));
    fresh.forEach((r) => seen.add(r.requestId));
    const newest = fresh
      .filter((r) => r.status === "pending")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (!newest) return;
    setScheduledRequest({
      requestId: newest.requestId,
      customerName: newest.customerName,
      customerPhone: newest.customerPhone,
      scheduledFor: newest.scheduledFor,
    });
    setIsScheduleModalOpen(true);
  }, [scheduledRequests]);

  const refresh = () => {
    refetchOrders();
    refetchScheduled();
  };

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

  // A food order: accepting with a prep time is what starts the driver search.
  const acceptMutation = useMutation({
    mutationFn: ({ orderId, prepMinutes }: { orderId: string; prepMinutes: number }) =>
      adminFetch<VendorOrder>(`/orders/${orderId}/restaurant-accept`, {
        method: "POST",
        body: JSON.stringify({ prepMinutes }),
      }),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders", vendorData._id] });
      toast.success(t("vendorDashboard.orderAcceptedFindingDriver"));
      setSelectedOrder(updatedOrder);
    },
    onError: (err: Error) => {
      toast.error(err.message || t("vendorDashboard.failedToAcceptOrder"));
    },
  });

  const acceptOrder = (orderId: string, prepMinutes: number) => {
    acceptMutation.mutate({ orderId, prepMinutes });
  };

  const rejectOrder = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: "CANCELLED" });
  };

  const totalRevenue = orders?.reduce((acc, order) => acc + (order.totalPrice || 0), 0) || 0;

  // Helper to extract items list from stops
  const getOrderItems = (order: VendorOrder) => {
    const dropStop = order?.stops?.find((s) => s.type === "drop");
    return dropStop?.items?.lines || [];
  };

  // Helper to get formatted status text & colors. Pass the order to show the
  // food-order states (new / preparing / ready) the status alone can't.
  const getStatusDisplay = (status: string, order?: VendorOrder): StatusDisplay => {
    const s = status ? status.toLowerCase() : "";
    if (order && needsAcceptance(order)) {
      return { text: t("orderStatus.newOrder"), color: "bg-orange-500/10 text-orange-600 border-orange-200" };
    }
    if (s === "cancelled" && order?.cancelReason === "restaurant_timeout") {
      return { text: t("orderStatus.cancelledNotAccepted"), color: "bg-red-500/10 text-red-600 border-red-200" };
    }
    if (order?.dispatchMode === "broadcast" && s === "searching_driver") {
      return order.foodReadyAt
        ? { text: t("orderStatus.readyFindingDriver"), color: "bg-pink-500/10 text-pink-600 border-pink-200" }
        : { text: t("orderStatus.preparingFindingDriver"), color: "bg-blue-500/10 text-blue-600 border-blue-200" };
    }
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
    refresh,
    isRefreshing: ordersFetching || scheduledFetching,
    menuCount: menu?.length,
    totalRevenue,
    rating: typeof profile?.rating === "number" ? profile.rating : null,
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
    acceptOrder,
    rejectOrder,
    isAccepting: acceptMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    getOrderItems,
    getStatusDisplay,
  };
}
