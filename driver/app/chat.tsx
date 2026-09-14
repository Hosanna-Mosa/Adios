import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";
import { socketService } from "@/utils/socketService";
import { formatCustomerChatMessage, formatStoredChatMessage } from "@/utils/chatMessages";
import Constants from "expo-constants";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;

const QUICK_REPLIES = [
  "On my way!",
  "Running late, sorry",
  "At the door",
  "Thank you!",
];

export default function DriverChatScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const { currentOrder, driverUserId, activeChat, addChatMessage, setUnreadCount, setIsChatActive, token, setChatMessages, updateOrderStatus } = useDriverStore();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [canStartTask, setCanStartTask] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
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
          customerName: order.user?.name || "Customer",
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

  // Starting the task has to move the order, not just fire a socket event: the
  // customer's tracking screen reads the order status, so a socket-only start left
  // their timeline stuck on "Helper assigned" for the whole job — and was lost
  // entirely if their chat screen happened to be closed.
  const handleStartTask = async () => {
    if (!currentOrder?.id) return;
    try {
      await updateOrderStatus?.("IN_PROGRESS" as any);
    } catch (err: any) {
      console.warn("[Chat] Failed to mark task in progress:", err?.message);
    }
    socketService.emit("task_started", { orderId: currentOrder.id });
    router.push("/active-order");
  };

  // The conversation lives on the server; the store only holds what arrived over
  // the socket this session. Without this the driver opened chat on an order they
  // had already been messaging about and saw an empty thread.
  useEffect(() => {
    if (!chatOrderId || !token) {
      setLoadingHistory(false);
      return;
    }
    let cancelled = false;
    setLoadingHistory(true);

    fetch(`${apiUrl}/orders/${chatOrderId}/chat`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((history: any[]) => {
        if (cancelled) return;
        const stored = (history || []).map(formatStoredChatMessage).filter(Boolean) as any[];
        const live = useDriverStore.getState().activeChat || [];
        const seen = new Set(stored.map((m) => m.id));
        setChatMessages?.([...stored, ...live.filter((m: any) => !seen.has(m.id))]);
      })
      .catch((err) => console.error("[Chat] Failed to load chat history:", err))
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatOrderId, token]);

  useEffect(() => {
    setUnreadCount?.(0);
    setIsChatActive?.(true);

    if (chatOrderId) {
      socketService.trackOrder(chatOrderId);
    }

    const handleReceiveMessage = (data: any) => {
      const formattedMsg = formatCustomerChatMessage(data);
      if (!formattedMsg) return;

      const currentMessages = useDriverStore.getState().activeChat;
      if (!currentMessages.find((m: any) => m.id === formattedMsg.id)) {
        addChatMessage?.(formattedMsg);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    };

    const handleAssignTaskConfirmed = () => {
      setCanStartTask(true);
    };

    socketService.on("receive_message", handleReceiveMessage);
    socketService.on("assign_task_confirmed", handleAssignTaskConfirmed);

    return () => {
      socketService.off("receive_message", handleReceiveMessage);
      socketService.off("assign_task_confirmed", handleAssignTaskConfirmed);
      setIsChatActive?.(false);
    };
  }, [chatOrderId]);

  const handleSend = (text = inputText) => {
    if (!text.trim() || !chatOrder) return;

    const messageText = text.trim();
    const tempId = Date.now().toString();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    addChatMessage?.({ text: messageText, from: "driver" as const, id: tempId, time });

    socketService.emit("send_message", {
      orderId: chatOrder.id,
      senderId: driverUserId || "driver",
      role: "DRIVER",
      text: messageText,
      id: tempId,
    });

    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isDriver = item.from === "driver";

    return (
      <View
        style={[
          styles.messageRow,
          isDriver ? styles.messageRowUser : styles.messageRowDriver,
        ]}
      >
        {!isDriver && (
          <View style={styles.driverAvatar}>
            <Feather name="user" size={14} color={Colors.textSecondary} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isDriver ? styles.bubbleUser : styles.bubbleDriver,
          ]}
        >
          <Text style={isDriver ? styles.bubbleTextUser : styles.bubbleTextDriver}>
            {item.text}
          </Text>
          <Text style={isDriver ? styles.timeUser : styles.timeDriver}>
            {item.time || ""}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Feather name="user" size={20} color={Colors.textSecondary} />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerName}>{chatOrder?.customerName || "Customer"}</Text>
            <Text style={styles.headerStatus}>Customer · Online</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => {
            // Was falling back to a hardcoded placeholder number ("1234567890")
            // whenever the customer's phone hadn't loaded yet, so the driver
            // could actually place a call to a fake number without warning.
            if (!chatOrder?.customerPhone) {
              Alert.alert("No phone number", "The customer's phone number isn't available for this order.");
              return;
            }
            Linking.openURL(`tel:${chatOrder.customerPhone}`);
          }}
        >
          <Feather name="phone" size={20} color={Colors.brand} />
        </TouchableOpacity>
      </View>

      {isHelper && isActiveJob && (
        <View style={{ backgroundColor: Colors.successLight, padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.successLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.success }}>Discuss Task Details</Text>
            <Text style={{ fontSize: 11, color: Colors.success }}>{canStartTask ? "Customer has assigned the task! You can start now." : "Wait for the customer to assign the task."}</Text>
          </View>
          <TouchableOpacity 
            style={{ backgroundColor: canStartTask ? Colors.success : Colors.textMuted, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
            disabled={!canStartTask}
            onPress={handleStartTask}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Start Task</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={activeChat || []}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          // "No messages" is only true once the stored thread has been read.
          <View style={styles.emptyState}>
            {loadingHistory ? (
              <ActivityIndicator color={Colors.brand} />
            ) : (
              <Text style={styles.emptyStateText}>
                Messages with {chatOrder?.customerName || "the customer"} will show up here.
              </Text>
            )}
          </View>
        }
      />

      <View style={styles.quickRepliesContainer}>
        <FlatList
          data={QUICK_REPLIES}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickReplyChip}
              onPress={() => handleSend(item)}
            >
              <Text style={styles.quickReplyText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={300}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => handleSend(inputText)}
          disabled={!inputText.trim()}
        >
          <View style={{ transform: [{ rotate: "45deg" }] }}>
            <Feather name="send" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  headerName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerStatus: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: "600",
  },
  callBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.brandSkin,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowDriver: {
    justifyContent: "flex-start",
  },
  driverAvatar: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
  },
  bubbleUser: {
    backgroundColor: Colors.brand,
    borderBottomRightRadius: 6,
  },
  bubbleDriver: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleTextUser: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
    lineHeight: 18,
  },
  bubbleTextDriver: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
    lineHeight: 18,
  },
  timeUser: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    alignSelf: "flex-end",
  },
  timeDriver: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "500",
    alignSelf: "flex-end",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  quickRepliesContainer: {
    paddingVertical: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  quickRepliesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickReplyChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickReplyText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
  },
});
