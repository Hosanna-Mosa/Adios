import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { socketService } from "@/lib/socketService";
import { toast } from "sonner";
import type { ScheduledRequest } from "../vendorScheduledOrdersTypes";

/** All state/query/mutation/socket logic for VendorScheduledOrders.tsx (work queue item #18). */
export function useVendorScheduledOrders() {
  const queryClient = useQueryClient();
  const vendorData = JSON.parse(localStorage.getItem("vendor_data") || "{}");
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ["vendor-scheduled-orders", vendorData._id],
    queryFn: () => adminFetch<ScheduledRequest[]>(`/orders/scheduled-delivery/vendor/${vendorData._id}`),
    enabled: !!vendorData._id,
    refetchInterval: 15000,
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, accepted }: { requestId: string; accepted: boolean }) =>
      adminFetch(`/orders/scheduled-delivery/${requestId}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ vendorId: vendorData._id, accepted }),
      }),
    onSuccess: (_, variables) => {
      toast.success(variables.accepted ? "Scheduled delivery accepted" : "Scheduled delivery rejected");
      queryClient.invalidateQueries({ queryKey: ["vendor-scheduled-orders", vendorData._id] });
      setRespondingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update scheduled request");
      setRespondingId(null);
    },
  });

  useEffect(() => {
    if (!vendorData._id) return;

    socketService.connect();
    socketService.join(vendorData._id, "VENDOR");

    const handleNewRequest = () => {
      refetch();
    };

    socketService.on("scheduled_delivery_request", handleNewRequest);
    return () => {
      socketService.off("scheduled_delivery_request", handleNewRequest);
    };
  }, [vendorData._id, refetch]);

  const handleRespond = (requestId: string, accepted: boolean) => {
    setRespondingId(requestId);
    respondMutation.mutate({ requestId, accepted });
  };

  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const acceptedCount = requests.filter((request) => request.status === "accepted").length;

  return {
    requests,
    isLoading,
    respondingId,
    isResponding: respondMutation.isPending,
    handleRespond,
    pendingCount,
    acceptedCount,
  };
}
