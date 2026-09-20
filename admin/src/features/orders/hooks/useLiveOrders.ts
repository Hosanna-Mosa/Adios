import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";
import type { LiveOrder, ManualOrderForm } from "../liveOrdersTypes";

/** All state/query/derived-stats logic for LiveOrders.tsx (work queue item #18). */
export function useLiveOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualOrder, setManualOrder] = useState<ManualOrderForm>({
    customer: "",
    pickup: "",
    dropoff: "",
    deliveryFee: "150"
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminFetch<LiveOrder[]>("/admin/orders"),
  });

  const activeOrdersCount = orders.filter((o) => ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "PICKED_UP", "searching_driver", "driver_assigned"].includes(o.status)).length;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualOrder.customer || !manualOrder.pickup || !manualOrder.dropoff) {
      toast.error("Please fill in all order details.");
      return;
    }
    toast.success(`Manual dispatch initiated for ${manualOrder.customer}! Searching closest driver...`);
    setIsManualOpen(false);
    setManualOrder({ customer: "", pickup: "", dropoff: "", deliveryFee: "150" });
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") return true;
    return o.status === statusFilter;
  });

  return {
    orders,
    isLoading,
    statusFilter,
    setStatusFilter,
    isManualOpen,
    setIsManualOpen,
    manualOrder,
    setManualOrder,
    activeOrdersCount,
    handleManualSubmit,
    filteredOrders,
  };
}
