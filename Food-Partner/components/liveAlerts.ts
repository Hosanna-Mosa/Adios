import { Vibration } from "react-native";
import * as Haptics from "expo-haptics";
import type { QueryClient } from "@tanstack/react-query";
import { useOrderAlertStore } from "@/contexts/orderAlertStore";
import { queryKeys } from "@/queries/keys";
import { invalidateOrderLists } from "@/queries/orders.queries";
import type { ScheduledRequestAlert } from "@/types/models";
import { startOrderRing } from "@/utils/orderRing";

// What happens when a new order or scheduled request arrives while the app is
// open. Polling (LiveOrderWatcher) and a push received in the foreground
// (PushNotificationHandler) both land here, and the alert store's de-duplication
// makes sure one order buzzes and rings once, whichever of the two comes first.

const ALERT_PATTERN = [0, 450, 180, 450];

const buzz = () => {
  Vibration.vibrate(ALERT_PATTERN);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

export function alertNewOrder(
  queryClient: QueryClient,
  vendorId: string,
  order: { orderId: string; customerName?: string; totalPrice?: number },
) {
  invalidateOrderLists(queryClient, vendorId);
  // The banner rings on repeat while it is showing (NewOrderBanner).
  if (useOrderAlertStore.getState().showNewOrder({ ...order, receivedAt: Date.now() })) buzz();
}

export function alertScheduledRequest(queryClient: QueryClient, vendorId: string, request: ScheduledRequestAlert) {
  queryClient.invalidateQueries({ queryKey: queryKeys.scheduled(vendorId) });
  if (useOrderAlertStore.getState().showScheduledRequest(request)) {
    buzz();
    startOrderRing({ loop: false });
  }
}
