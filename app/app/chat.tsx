import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Linking, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { socketService } from "@/utils/socketService";
import { customFetch } from "@/utils/api/custom-fetch";
import { useDeliveryStore, OrderStatus } from "@/contexts/deliveryStore";
import { fadeInUp } from "@/motion/presets";
import { ChatInputBar } from "@/features/support/components/ChatInputBar";
import { ChatQuickRepliesRow } from "@/features/support/components/ChatQuickRepliesRow";
import { ChatAssignRow } from "@/features/support/components/ChatAssignRow";
import { ChatHeader } from "@/features/support/components/ChatHeader";

import { ScreenShell } from "@/components/ui/ScreenShell";
import { ChatBody } from "@/features/support/components/ChatBody";
import { ChatBubbleBody } from "@/features/support/components/ChatBubbleBody";

const RIDE_TYPES = ["bike", "auto", "cab", "cab_prime"];

const QUICK_REPLIES = ["On my way", "Waiting at pickup", "My location is as per map", "Message when you're close"];

const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  confirmed: "Order confirmed",
  driver_assigned: "Assigned to you",
  en_route_pickup: "Heading to pickup",
  arrived_pickup: "Arrived at pickup",
  picking_items: "Picking your order",
  en_route_delivery: "On the way",
  arrived_delivery: "Arrived",
  delivered: "Completed",
};

export default function ChatScreen() {
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

  useEffect(() => {
    if (!currentOrderId) return;
    setUnreadCount(0);
    setIsChatActive(true);
    socketService.trackOrder(currentOrderId);

    const onMessage = (msg: any) => {
      const formattedMsg: any = {
        id: msg.id,
        text: msg.text,
        sender: msg.from === "driver" ? "driver" : "customer",
        timestamp: msg.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const currentMessages = useDeliveryStore.getState().activeChat;
      if (!currentMessages.find((m: any) => m.id === formattedMsg.id)) {
        addChatMessage(formattedMsg);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    };

    const onTaskStarted = () => router.push("/tracking");

    socketService.on("receive_message", onMessage);
    socketService.on("task_started", onTaskStarted);

    return () => {
      socketService.off("receive_message", onMessage);
      socketService.off("task_started", onTaskStarted);
      setIsChatActive(false);
    };
  }, [currentOrderId]);

  const sendMessage = (text: string) => {
    if (!text.trim() || !currentOrderId) return;
    const msgId = Date.now().toString();
    const newMsg: any = {
      id: msgId,
      text: text.trim(),
      sender: "customer",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    addChatMessage(newMsg);
    socketService.emit("send_message", { orderId: currentOrderId, role: "USER", text: text.trim(), id: msgId });
    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isUser = item.sender === "customer";
    const showDateDivider = index === 0;
    return (
      <>
        {showDateDivider && <Text style={styles.dateDivider}>Today</Text>}
        <Animated.View entering={fadeInUp(0)} style={[styles.messageRow, isUser ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
          {!isUser && (
            <View style={styles.partnerAvatarSmall}>
              <Ionicons name="person" size={13} color={tokens.sec} />
            </View>
          )}
          <ChatBubbleBody
            isUser={isUser}
            item={item}
            accent={accent}
            styles={styles}
            tokens={tokens}
          />
        </Animated.View>
      </>
    );
  };

  return (
    <ScreenShell keyboardAvoiding>
      <ChatHeader
        Linking={Linking}
        STATUS_LABEL={STATUS_LABEL}
        accent={accent}
        driver={driver}
        insets={insets}
        partnerLabel={partnerLabel}
        status={status}
        styles={styles}
        tokens={tokens}
      />

      <Animated.View entering={fadeInUp(60)} style={styles.safetyBanner}>
        <Ionicons name="shield-checkmark-outline" size={16} color={tokens.warning} />
        <Text style={styles.safetyText}>Keep the conversation in Flavour. Don&apos;t share your PIN with the {partnerLabel.toLowerCase()} before the {isHelper ? "task" : isRide ? "ride" : "order"} starts.</Text>
      </Animated.View>

      <ChatBody
        activeChat={activeChat}
        flatListRef={flatListRef}
        partnerLabel={partnerLabel}
        renderItem={renderItem}
        styles={styles}
        tokens={tokens}
      />

      {isHelper && !taskAssigned && (
        <Animated.View entering={fadeInUp(0)}>
          <ChatAssignRow
            accent={accent}
            handleAssignTask={handleAssignTask}
            styles={styles}
          />
        </Animated.View>
      )}

      <ChatQuickRepliesRow
        QUICK_REPLIES={QUICK_REPLIES}
        sendMessage={sendMessage}
        styles={styles}
      />

      <ChatInputBar
        accent={accent}
        driver={driver}
        inputText={inputText}
        insets={insets}
        partnerLabel={partnerLabel}
        sendMessage={sendMessage}
        setInputText={setInputText}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    header: {
      flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12,
      backgroundColor: tokens.surface, borderBottomWidth: 1, borderBottomColor: tokens.border,
    },
    backBtn: { width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    headerAvatar: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), backgroundColor: tokens.sunken, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    headerName: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(15), color: tokens.text },
    headerStatus: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(12), marginTop: 2 },
    callBtn: { width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(19), alignItems: "center", justifyContent: "center" },

    safetyBanner: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: tokens.warningSkin, marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 12 },
    safetyText: { flex: 1, fontFamily: fontFamilies.body.regular, fontSize: moderateScale(12), lineHeight: moderateScale(17), color: tokens.sec },

    // Without an explicit flex the FlatList sizes to its own content instead
    // of the space left between the safety banner and the quick-reply row —
    // as messages accumulate it pushes the chips and composer off-screen.
    messagesFlatList: { flex: 1 },
    messagesList: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    dateDivider: { textAlign: "center", fontFamily: fontFamilies.body.medium, fontSize: moderateScale(12), color: tokens.sec, marginBottom: 12 },
    messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 10 },
    partnerAvatarSmall: { width: moderateScale(24), height: moderateScale(24), borderRadius: moderateScale(12), backgroundColor: tokens.sunken, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    bubble: { maxWidth: "78%", borderRadius: 16, paddingHorizontal: 13, paddingVertical: 11, gap: 5 },
    bubbleText: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(14), lineHeight: moderateScale(20) },
    bubbleTime: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(11) },

    emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
    emptyStateText: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), color: tokens.sec, textAlign: "center", paddingHorizontal: 40 },

    assignRow: { flexDirection: "row", alignItems: "center", gap: 11, marginHorizontal: 16, marginTop: 8, borderWidth: 1, borderRadius: 12, padding: 11, minHeight: 48 },
    assignIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
    assignText: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.text },
    assignSend: { fontFamily: fontFamilies.body.bold, fontSize: moderateScale(11), letterSpacing: 0.8 },

    quickRepliesRow: { marginTop: 10 },
    quickReplyChip: { borderWidth: 1, borderColor: tokens.borderStrong, backgroundColor: tokens.surface, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, minHeight: 36, justifyContent: "center" },
    quickReplyChipText: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(13), color: tokens.sec },

    inputBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: tokens.surface, borderTopWidth: 1, borderTopColor: tokens.border, marginTop: 10 },
    inputContainer: { flex: 1, backgroundColor: tokens.bg, borderWidth: 1, borderColor: tokens.borderStrong, borderRadius: 22, minHeight: moderateScale(44), maxHeight: 100, paddingHorizontal: 16, justifyContent: "center" },
    textInput: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(15), color: tokens.text, paddingVertical: 10 },
    sendBtn: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22), alignItems: "center", justifyContent: "center" },
  });
