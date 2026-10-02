import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import type { LiveOrder } from "../liveOrdersTypes";

/** All state/query/derived-stats logic for LiveOrders.tsx (work queue item #18). */
export function useLiveOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminFetch<LiveOrder[]>("/admin/orders"),
  });

  const activeOrdersCount = orders.filter((o) => ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "PICKED_UP", "searching_driver", "driver_assigned"].includes(o.status)).length;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") return true;
    return o.status === statusFilter;
  });

  return {
    orders,
    isLoading,
    statusFilter,
    setStatusFilter,
    activeOrdersCount,
    filteredOrders,
  };
}
