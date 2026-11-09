import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { orderServiceKind, type OrderServiceKind } from "@/components/shared/orderService";
import type { LiveOrder } from "../liveOrdersTypes";

export const LIVE_ORDERS_PAGE_SIZE = 10;

/** All state/query/derived-stats logic for LiveOrders.tsx (work queue item #18). */
export function useLiveOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [serviceFilter, setServiceFilter] = useState<OrderServiceKind | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminFetch<LiveOrder[]>("/admin/orders"),
  });

  const activeOrdersCount = orders.filter((o) => ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "PICKED_UP", "searching_driver", "driver_assigned"].includes(o.status)).length;

  const query = search.trim().toLowerCase();
  const filteredOrders = orders.filter((o) => {
    if (serviceFilter !== "ALL" && orderServiceKind(o) !== serviceFilter) return false;
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (!query) return true;
    const shortId = o._id.slice(-6);
    return [o._id, shortId, o.user?.name, o.driver?.user?.name, o.status]
      .some((field) => field?.toLowerCase().includes(query));
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / LIVE_ORDERS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = filteredOrders.slice((currentPage - 1) * LIVE_ORDERS_PAGE_SIZE, currentPage * LIVE_ORDERS_PAGE_SIZE);

  // A new search or filter starts back at the first page.
  useEffect(() => setPage(1), [search, statusFilter, serviceFilter]);

  return {
    orders,
    isLoading,
    statusFilter,
    setStatusFilter,
    serviceFilter,
    setServiceFilter,
    activeOrdersCount,
    filteredOrders,
    pagedOrders,
    search,
    setSearch,
    currentPage,
    totalPages,
    setPage,
  };
}
