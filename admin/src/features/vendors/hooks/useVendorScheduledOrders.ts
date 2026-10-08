import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { VENDOR_LIVE_REFRESH_MS } from "./useVendorLiveAlerts";
import type { ScheduledRequest } from "../vendorScheduledOrdersTypes";

/** All state/query/mutation logic for VendorScheduledOrders.tsx (work queue item #18). */
export function useVendorScheduledOrders() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const vendorData = JSON.parse(localStorage.getItem("vendor_data") || "{}");
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const { data: requests = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["vendor-scheduled-orders", vendorData._id],
    queryFn: () => adminFetch<ScheduledRequest[]>(`/orders/scheduled-delivery/vendor/${vendorData._id}`),
    enabled: !!vendorData._id,
    refetchInterval: VENDOR_LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
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
      setRespondingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t("vendorScheduledOrders.failedToUpdateScheduledRequest"));
      setRespondingId(null);
    },
  });

  const handleRespond = (requestId: string, accepted: boolean) => {
    setRespondingId(requestId);
    respondMutation.mutate({ requestId, accepted });
  };

  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const acceptedCount = requests.filter((request) => request.status === "accepted").length;

  return {
    requests,
    isLoading,
    isFetching,
    refetch,
    respondingId,
    isResponding: respondMutation.isPending,
    handleRespond,
    pendingCount,
    acceptedCount,
  };
}
