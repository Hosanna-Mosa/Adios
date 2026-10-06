import { useMemo, useState } from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { useAcceptOrder, useMarkOrderReady, useRejectOrder, useVendorOrder } from "@/queries/orders.queries";
import { errorMessage } from "@/utils/errorMessage";
import {
  canMarkOrderReady,
  customerOf,
  DEFAULT_PREP_MINUTES,
  deliveryAddress,
  driverOf,
  needsAcceptance,
  orderItems,
} from "@/utils/orderStatus";
import { createStyles } from "./orderDetail.styles";

/** One order: details, the kitchen's actions (accept / reject / mark as ready), and call shortcuts. */
export function useOrderDetail(orderId: string) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const query = useVendorOrder(orderId);
  const markReady = useMarkOrderReady();
  const accept = useAcceptOrder();
  const reject = useRejectOrder();
  const [prepMinutes, setPrepMinutes] = useState(DEFAULT_PREP_MINUTES);
  const order = query.data;

  const acceptOrder = () => {
    if (!order) return;
    accept.mutate(
      { orderId: order._id, prepMinutes },
      {
        onSuccess: () => toast.show(t("orderDetail.accepted"), "success"),
        onError: (error) => toast.show(errorMessage(error, t("orderDetail.acceptFailed")), "error"),
      },
    );
  };

  const confirmReject = () => {
    if (!order) return;
    showAlert(t("orderDetail.confirmRejectTitle"), t("orderDetail.confirmRejectMessage"), [
      { text: t("actions.cancel"), style: "cancel" },
      {
        text: t("orderDetail.rejectOrder"),
        style: "destructive",
        onPress: () =>
          reject.mutate(order._id, {
            onSuccess: () => toast.show(t("orderDetail.rejected"), "success"),
            onError: (error) => toast.show(errorMessage(error, t("orderDetail.rejectFailed")), "error"),
          }),
      },
    ]);
  };

  const confirmReady = () => {
    if (!order) return;
    showAlert(t("orderDetail.confirmReadyTitle"), t("orderDetail.confirmReadyMessage"), [
      { text: t("actions.cancel"), style: "cancel" },
      {
        text: t("orderDetail.markReady"),
        onPress: () =>
          markReady.mutate(order._id, {
            onSuccess: () => toast.show(t("orderDetail.markedReady"), "success"),
            onError: (error) => toast.show(errorMessage(error, t("orderDetail.markReadyFailed")), "error"),
          }),
      },
    ]);
  };

  const call = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => toast.show(t("errors.cannotOpenDialer"), "error"));
  };

  return {
    insets,
    tokens,
    styles,
    order,
    loading: query.isLoading && !order,
    error: query.isError && !order,
    refetch: query.refetch,
    refreshing: query.isRefetching,
    items: order ? orderItems(order) : [],
    customer: order ? customerOf(order) : null,
    driver: order ? driverOf(order) : null,
    hasDriver: !!order?.driver,
    address: order ? deliveryAddress(order) : "",
    canMarkReady: canMarkOrderReady(order),
    markingReady: markReady.isPending,
    confirmReady,
    needsAcceptance: needsAcceptance(order),
    prepMinutes,
    setPrepMinutes,
    acceptOrder,
    accepting: accept.isPending,
    confirmReject,
    rejecting: reject.isPending,
    call,
  };
}
