import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { socketService } from "@/utils/socketService";
import { formatCustomerChatMessage } from "@/utils/chatMessages";
import {
  ChatComposer,
  ChatMessageBubble,
  CustomerChatHeader,
  QuickReplyBar,
  TaskAssignmentBanner,
} from "@/features/jobs/components";
import { styles } from "@/features/jobs/chat.styles";

const QUICK_REPLIES = [
  "On my way!",
  "Running late, sorry",
  "At the door",
  "Thank you!",
];

export default function DriverChatScreen() {
  const insets = useSafeAreaInsets();
  const { currentOrder, driverUserId, activeChat, addChatMessage, setUnreadCount, setIsChatActive } = useDriverStore();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [canStartTask, setCanStartTask] = useState(false);
  const isHelper = currentOrder?.serviceType?.toLowerCase() === "helper";

  const handleStartTask = () => {
    socketService.emit("task_started", { orderId: currentOrder?.id });
    router.push("/active-order");
  };

  useEffect(() => {
    setUnreadCount?.(0);
    setIsChatActive?.(true);

    if (currentOrder?.id) {
      socketService.trackOrder(currentOrder.id);
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
  }, [currentOrder?.id]);

  const handleSend = (text = inputText) => {
    if (!text.trim() || !currentOrder) return;

    const messageText = text.trim();
    const tempId = Date.now().toString();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    addChatMessage?.({ text: messageText, from: "driver" as const, id: tempId, time });

    socketService.emit("send_message", {
      orderId: currentOrder.id,
      senderId: driverUserId || "driver",
      role: "DRIVER",
      text: messageText,
      id: tempId,
    });

    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <CustomerChatHeader
        customerName={currentOrder?.customerName || "Customer"}
        paddingTop={insets.top + (Platform.OS === "web" ? 67 : 0) + 12}
        onBack={() => router.back()}
        onCall={() => Linking.openURL(`tel:${currentOrder?.customerPhone || "1234567890"}`)}
      />

      {isHelper && (
        <TaskAssignmentBanner canStartTask={canStartTask} onStartTask={handleStartTask} />
      )}

      <FlatList
        ref={flatListRef}
        data={activeChat || []}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => <ChatMessageBubble message={item} />}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <QuickReplyBar replies={QUICK_REPLIES} onSelect={handleSend} />

      <ChatComposer
        value={inputText}
        onChangeText={setInputText}
        onSend={() => handleSend(inputText)}
        paddingBottom={insets.bottom + 8}
      />
    </KeyboardAvoidingView>
  );
}
