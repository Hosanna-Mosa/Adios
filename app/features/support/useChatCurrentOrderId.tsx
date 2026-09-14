import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { socketService } from "@/utils/socketService";
import { customFetch } from "@/utils/api/custom-fetch";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { RIDE_TYPES, createStyles, toChatMessage } from "./useChat.shared";

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
  const [loadingHistory, setLoadingHistory] = useState(true);

  const handleAssignTask = () => {
    socketService.emit("assign_task_confirmed", { orderId: currentOrderId });
    setTaskAssigned(true);
  };

  // The screen is reached two ways: pushed from tracking (the store already knows
  // the order) or opened cold from a notification with only an orderId. Both need
  // the same thing — the stored conversation. It used to be fetched on the deep-link
  // path only, so arriving from tracking showed an empty thread until the partner
  // happened to send something new.
  const orderId = params.orderId || currentOrderId;
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoadingHistory(false);
      return;
    }
    if (params.orderId && params.orderId !== currentOrderId) setOrderId(params.orderId);
    if (hydratedFor.current === orderId) return;
    hydratedFor.current = orderId;

    let cancelled = false;
    setLoadingHistory(true);

    // Only the deep-link path is missing the order itself; from tracking this is
    // a cheap confirmation that costs one request.
    customFetch<any>(`/orders/${orderId}`)
      .then((order) => {
        if (cancelled || !order) return;
        if (order.serviceType) setServiceType(order.serviceType);
        if (order.driver) {
          setDriver({
            id: order.driver._id,
            name: order.driver.name || order.driver.user?.name || "Driver",
            phone: order.driver.phone || order.driver.user?.phone || "",
            vehicle: order.driver.vehicleType || "unknown",
            rating: order.driver.rating ?? null,
            ratingCount: order.driver.ratingCount ?? 0,
          });
        }
      })
      .catch((err) => console.error("[Chat] Failed to load order:", err));

    customFetch<any[]>(`/orders/${orderId}/chat`)
      .then((history) => {
        if (cancelled) return;
        const stored = (history || []).map(toChatMessage);
        // Anything that arrived over the socket while this was in flight stays:
        // merged by id, which the server now persists as `clientId`.
        const live = useDeliveryStore.getState().activeChat;
        const seen = new Set(stored.map((m) => m.id));
        setChatMessages([...stored, ...live.filter((m: any) => !seen.has(m.id))]);
      })
      .catch((err) => console.error("[Chat] Failed to load chat history:", err))
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return { currentOrderId: orderId, driver, activeChat, addChatMessage, setUnreadCount, setIsChatActive, status, insets, tokens, isRide, isHelper, accent, partnerLabel, styles, inputText, setInputText, flatListRef, taskAssigned, handleAssignTask, loadingHistory };
}
