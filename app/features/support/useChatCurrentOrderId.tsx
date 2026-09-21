import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { socketService } from "@/utils/socketService";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { RIDE_TYPES, createStyles } from "./useChat.shared";
import { getOrder, getOrderChat } from "@/services/orders.service";

// Split out of useChat so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useChatCurrentOrderId() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const currentOrderId = useDeliveryStore((s) => s.currentOrderId);
  const driver = useDeliveryStore((s) => s.driver);
  const activeChat = useDeliveryStore((s) => s.activeChat);
  const addChatMessage = useDeliveryStore((s) => s.addChatMessage);
  const setUnreadCount = useDeliveryStore((s) => s.setUnreadCount);
  const setIsChatActive = useDeliveryStore((s) => s.setIsChatActive);
  const serviceType = useDeliveryStore((s) => s.serviceType);
  const status = useDeliveryStore((s) => s.status);
  const setOrderId = useDeliveryStore((s) => s.setOrderId);
  const setDriver = useDeliveryStore((s) => s.setDriver);
  const setServiceType = useDeliveryStore((s) => s.setServiceType);
  const setChatMessages = useDeliveryStore((s) => s.setChatMessages);
  const theme = useThemeStore((s) => s.theme);
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

    getOrder(deepLinkOrderId)
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

    getOrderChat(deepLinkOrderId)
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
