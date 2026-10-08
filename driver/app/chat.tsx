import React, { useState, useEffect, useRef } from "react";
import { Alert, FlatList, Platform, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { useOrderChat } from "@/features/jobs/hooks/useOrderChat";
import {
  ChatMessageBubble,
  CustomerChatHeader,
  QuickReplyBar,
  TaskAssignmentBanner,
} from "@/features/jobs/components";
import { styles } from "@/features/jobs/chat.styles";
import { MessageComposer } from "@/components/shared/MessageComposer";
import { KeyboardView } from "@/components/ui/KeyboardView";
import { List } from "@/components/ui/List";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { Loader } from "@/components/ui/Loader";
import Colors from "@/constants/colors";

export default function DriverChatScreen() {
  const { t } = useTranslation();
  const QUICK_REPLIES = [
    t("jobs.quickReplyOnMyWay"),
    t("jobs.quickReplyRunningLate"),
    t("jobs.quickReplyAtTheDoor"),
    t("jobs.quickReplyThankYou"),
  ];
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const { currentOrder, activeChat, setUnreadCount, setIsChatActive, token, updateOrderStatus } = useDriverStore();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [fetchedOrder, setFetchedOrder] = useState<{ id: string; customerName: string; customerPhone: string; serviceType?: string } | null>(null);

  // currentOrder isn't persisted (deliberately — it's meant to always come from a
  // fresh fetch), so opening this screen straight from a chat push notification —
  // app cold-started, nothing in memory yet — left currentOrder null and the whole
  // screen non-functional: no header info, and handleSend below bails out with no
  // order to attach the message to. Fall back to fetching the order by the
  // orderId the notification/link carries whenever it isn't already the one loaded.
  const chatOrderId = params.orderId || currentOrder?.id;
  const chatOrder = currentOrder?.id === chatOrderId ? currentOrder : fetchedOrder;

  useEffect(() => {
    if (!chatOrderId || !token || currentOrder?.id === chatOrderId) return;
    let cancelled = false;
    fetch(`${apiUrl}/orders/${chatOrderId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((order) => {
        if (cancelled || !order) return;
        setFetchedOrder({
          id: order._id,
          customerName: order.user?.name || t("jobs.customer"),
          customerPhone: order.user?.phone || "",
          serviceType: order.serviceType,
        });
      })
      .catch((err) => console.error("[Chat] Failed to load order:", err));
    return () => {
      cancelled = true;
    };
  }, [chatOrderId, token, currentOrder?.id]);

  const isHelper = chatOrder?.serviceType?.toLowerCase() === "helper";
  // The "discuss & start task" banner only makes sense for the driver's actual,
  // currently active job — not when viewing an older conversation.
  const isActiveJob = currentOrder?.id === chatOrderId;

  // Thread + task confirmation, polled over REST.
  const { loadingHistory, canStartTask, sendMessage, refresh, refreshing } = useOrderChat(
    chatOrderId,
    isHelper && isActiveJob,
  );

  // Starting the task moves the order; the customer's screen reads that status.
  const handleStartTask = async () => {
    if (!currentOrder?.id) return;
    try {
      await updateOrderStatus?.("IN_PROGRESS" as any);
    } catch (err: any) {
      console.warn("[Chat] Failed to mark task in progress:", err?.message);
    }
    router.push("/active-order");
  };

  useEffect(() => {
    setUnreadCount?.(0);
    setIsChatActive?.(true);
    return () => {
      setIsChatActive?.(false);
    };
  }, [chatOrderId, setUnreadCount, setIsChatActive]);

  const handleSend = (text = inputText) => {
    if (!text.trim() || !chatOrder) return;

    sendMessage(text.trim());
    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <CustomerChatHeader
        customerName={chatOrder?.customerName || t("jobs.customer")}
        paddingTop={insets.top + (Platform.OS === "web" ? 67 : 0) + 12}
        onBack={() => router.back()}
        onRefresh={refresh}
        refreshing={refreshing}
        onCall={() => {
          // Was falling back to a hardcoded placeholder number ("1234567890")
          // whenever the customer's phone hadn't loaded yet, so the driver
          // could actually place a call to a fake number without warning.
          if (!chatOrder?.customerPhone) {
            Alert.alert(t("jobs.noPhoneNumber"), t("jobs.customerPhoneNotAvailable"));
            return;
          }
          Linking.openURL(`tel:${chatOrder.customerPhone}`);
        }}
      />

      {isHelper && isActiveJob && (
        <TaskAssignmentBanner canStartTask={canStartTask} onStartTask={handleStartTask} />
      )}

      <List
        ref={flatListRef}
        data={activeChat || []}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => <ChatMessageBubble message={item} />}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          // "No messages" is only true once the stored thread has been read.
          <Box style={styles.emptyState}>
            {loadingHistory ? (
              <Loader color={Colors.brand} />
            ) : (
              <AppText style={styles.emptyStateText}>
                {t("jobs.chatEmptyState", {
                  value: chatOrder?.customerName || t("jobs.theCustomer"),
                  defaultValue: "Messages with {{value}} will show up here.",
                })}
              </AppText>
            )}
          </Box>
        }
      />

      <QuickReplyBar replies={QUICK_REPLIES} onSelect={handleSend} />

      <MessageComposer
        value={inputText}
        onChangeText={setInputText}
        onSend={() => handleSend(inputText)}
        paddingBottom={insets.bottom + 8}
      />
    </KeyboardView>
  );
}
