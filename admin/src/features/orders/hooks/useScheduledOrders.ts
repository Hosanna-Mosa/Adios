import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { scheduleStatusOf, type ScheduledOrder, type ScheduleStatus } from "../scheduledOrdersTypes";

/** All state/query/mutation/pagination logic for ScheduledOrders.tsx (work queue item #18). */
export function useScheduledOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"ALL" | ScheduleStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectingOrder, setRejectingOrder] = useState<ScheduledOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "scheduled-orders"],
    queryFn: () => adminFetch<ScheduledOrder[]>("/orders/scheduled"),
    refetchInterval: 15000,
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "accept" | "reject"; reason?: string }) =>
      adminFetch(`/orders/${id}/schedule`, {
        method: "PATCH",
        body: JSON.stringify(reason ? { action, reason } : { action }),
      }),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scheduled-orders"] });
      toast.success(action === "accept" ? "Scheduled order accepted" : "Scheduled order rejected");
      setRejectingOrder(null);
      setRejectReason("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update the scheduled order");
    },
  });

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    decisionMutation.mutate({
      id: rejectingOrder._id,
      action: "reject",
      reason: rejectReason.trim() || undefined,
    });
  };

  const acceptOrder = (id: string) => decisionMutation.mutate({ id, action: "accept" });

  const handleFilterChange = (value: "ALL" | ScheduleStatus) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const pendingCount = orders.filter((order) => scheduleStatusOf(order) === "pending").length;
  const acceptedCount = orders.filter((order) => scheduleStatusOf(order) === "accepted").length;
  const rejectedCount = orders.filter((order) => scheduleStatusOf(order) === "rejected").length;

  const filteredOrders = orders.filter((order) =>
    statusFilter === "ALL" ? true : scheduleStatusOf(order) === statusFilter
  );

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  return {
    orders,
    isLoading,
    statusFilter,
    handleFilterChange,
    currentPage,
    setCurrentPage,
    rejectingOrder,
    setRejectingOrder,
    rejectReason,
    setRejectReason,
    isDeciding: decisionMutation.isPending,
    decidingId: decisionMutation.variables?.id,
    acceptOrder,
    handleReject,
    pendingCount,
    acceptedCount,
    rejectedCount,
    filteredOrders,
    totalPages,
    safePage,
    paginatedOrders,
  };
}
