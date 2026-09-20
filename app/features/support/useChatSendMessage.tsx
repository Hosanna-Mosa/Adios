import { useEffect } from "react";
import { router } from "expo-router";
import { socketService } from "@/utils/socketService";
import { useDeliveryStore } from "@/contexts/deliveryStore";

// Part 2 of useChat, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useChatSendMessage(currentOrderId: any, driver: any, addChatMessage: any, setUnreadCount: any, setIsChatActive: any, setInputText: any, flatListRef: any) {
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

  return { sendMessage };
}
