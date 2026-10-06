import { useMemo, useState } from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { useRespondToScheduledRequest, useScheduledRequests } from "@/queries/orders.queries";
import type { ScheduledRequestStatus } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { createStyles } from "./scheduled.styles";

/** The web panel's Scheduled Orders page: every request, with accept/reject on pending ones. */
export function useScheduledOrders() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const query = useScheduledRequests();
  const respond = useRespondToScheduledRequest();
  const [filter, setFilter] = useState<ScheduledRequestStatus>("pending");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const requests = useMemo(
    () => [...(query.data ?? [])].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()),
    [query.data],
  );
  const counts = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === "pending").length,
      accepted: requests.filter((r) => r.status === "accepted").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    }),
    [requests],
  );

  const answer = (requestId: string, accepted: boolean) => {
    setRespondingId(requestId);
    respond.mutate(
      { requestId, accepted },
      {
        onSuccess: () => toast.show(accepted ? t("scheduled.acceptedToast") : t("scheduled.rejectedToast"), "success"),
        onError: (error) => toast.show(errorMessage(error, t("scheduled.respondFailed")), "error"),
        onSettled: () => setRespondingId(null),
      },
    );
  };

  const refresh = async () => {
    setRefreshing(true);
    await query.refetch().catch(() => {});
    setRefreshing(false);
  };

  return {
    insets,
    tokens,
    styles,
    call: (phone: string) => Linking.openURL(`tel:${phone}`).catch(() => {}),
    filter,
    setFilter,
    visible: requests.filter((r) => r.status === filter),
    counts,
    loading: query.isLoading,
    error: query.isError && requests.length === 0,
    respondingId,
    answer,
    refreshing,
    refresh,
  };
}
