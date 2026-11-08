import { Alert } from "react-native";
import { router } from "expo-router";

import i18n from "@/i18n";
import { API_URL } from "@/utils/apiUrl";
import { useDriverStore } from "./driverStore";

/** Pulls the current job (GET /orders/:id) and applies what changed on the
 * server: a new status (alerting when the order is prepared), or a
 * cancellation, which clears the job and returns to home. */
export async function syncActiveOrder(): Promise<void> {
  const { token, currentOrder } = useDriverStore.getState();
  if (!token || !currentOrder) return;
  const id = String(currentOrder.id);
  const statusAtStart = currentOrder.status;

  const res = await fetch(`${API_URL}/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return;
  const order = await res.json();

  const current = useDriverStore.getState().currentOrder;
  // Job changed, or the driver moved its status while this was out — keep theirs.
  if (!current || String(current.id) !== id || current.status !== statusAtStart) return;

  const status = String(order?.status || "");
  if (!status) return;

  if (status.toLowerCase() === "cancelled") {
    useDriverStore.setState({ currentOrder: null, currentStep: 0 });
    Alert.alert(i18n.t("jobs.orderCancelled"), i18n.t("jobs.activeOrderCancelledByCustomer"));
    router.push("/(tabs)");
    return;
  }

  if (current.status !== status) {
    useDriverStore.setState({ currentOrder: { ...current, status: status as any } });
    if (status.toLowerCase() === "picking_items") {
      Alert.alert(i18n.t("jobs.orderPrepared"), i18n.t("jobs.theOrderIsPreparedAndReadyForPickup"));
    }
  }
}
