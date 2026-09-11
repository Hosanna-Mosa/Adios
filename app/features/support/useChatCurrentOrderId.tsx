import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { socketService } from "@/utils/socketService";
import { customFetch } from "@/utils/api/custom-fetch";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { RIDE_TYPES, createStyles } from "./useChat.shared";

// Part 1 of useChat, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useChatCurrentOrderId() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const {
    currentOrderId, driver, activeChat, addChatMessage, setUnreadCount, setIsChatActive, serviceType, status,
    setOrderId, setDriver, setServiceType, setChatMessages,
  } = useDeliveryStore();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];

  const isRide = RIDE_TYPES.includes(serviceType?.toLowerCase() || "");
  const isHelper = serviceType?.toLowerCase() === "helper";
  const accent = tokens.services[isRide ? "ride" : isHelper ? "task" : "food"];
  const partnerLabel = isRide ? "Captain" : isHelper ? "Helper" : "Delivery partner";
  const styles = useMemo(() => createStyles(tokens, accent), [theme, isRide, isHelper]);

  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [taskAssigned, setTaskAssigned] = useState(false);

  const handleAssignTask = () => {
    socketService.emit("assign_task_confirmed", { orderId: currentOrderId });
    setTaskAssigned(true);
  };

  // Opened via a deep link (notification tap, or the notification list) with just an
  // orderId — the store won't already have this order's driver/history loaded, so fetch
  // and hydrate it ourselves instead of relying on the normal in-app tracking flow.
  useEffect(() => {
    const deepLinkOrderId = params.orderId;
    if (!deepLinkOrderId || deepLinkOrderId === currentOrderId) return;

    setOrderId(deepLinkOrderId);

    customFetch<any>(`/orders/${deepLinkOrderId}`)
      .then((order) => {
        if (order?.serviceType) setServiceType(order.serviceType);
        if (order?.driver) {
          setDriver({
            id: order.driver._id,
            name: order.driver.name || order.driver.user?.name || "Driver",
            phone: order.driver.phone || order.driver.user?.phone || "",
            vehicle: order.driver.vehicleType || "unknown",
          });
        }
      })
      .catch((err) => console.error("[Chat] Failed to load order for deep link:", err));

    customFetch<any[]>(`/orders/${deepLinkOrderId}/chat`)
      .then((history) => {
        setChatMessages(
          (history || []).map((m) => ({
            id: m._id,
            text: m.text,
            sender: m.role === "driver" ? "driver" : "customer",
            timestamp: m.time,
          }))
        );
      })
      .catch((err) => console.error("[Chat] Failed to load chat history for deep link:", err));
  }, [params.orderId]);

  return { currentOrderId, driver, activeChat, addChatMessage, setUnreadCount, setIsChatActive, status, insets, tokens, isRide, isHelper, accent, partnerLabel, styles, inputText, setInputText, flatListRef, taskAssigned, handleAssignTask };
}
