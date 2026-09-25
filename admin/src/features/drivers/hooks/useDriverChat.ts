import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { AdminDriver, AdminOrderSummary, OrderChatMessage } from "../types";

/**
 * Order Chats dialog state for Drivers.tsx: which driver/order is selected
 * and the messages loaded for it. Split out from useDriversList per the
 * plan's "organize related state logically" rule.
 */
export function useDriverChat() {
  const { t } = useTranslation();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatDriver, setChatDriver] = useState<AdminDriver | null>(null);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<AdminOrderSummary | null>(null);
  const [chatMessages, setChatMessages] = useState<OrderChatMessage[]>([]);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);

  const handleOpenChatModal = (driver: AdminDriver) => {
    setChatDriver(driver);
    setSelectedOrderForChat(null);
    setChatMessages([]);
    setIsChatModalOpen(true);
  };

  const loadOrderChat = async (orderId: string) => {
    setLoadingChatMessages(true);
    try {
      const msgs = await adminFetch<OrderChatMessage[]>(`/admin/orders/${orderId}/chat`);
      setChatMessages(msgs || []);
    } catch (err) {
      toast.error((err as Error)?.message || t("drivers.failedToLoadChatMessages"));
    } finally {
      setLoadingChatMessages(false);
    }
  };

  useEffect(() => {
    if (selectedOrderForChat?._id) {
      loadOrderChat(selectedOrderForChat._id);
    } else {
      setChatMessages([]);
    }
  }, [selectedOrderForChat?._id]);

  return {
    isChatModalOpen,
    setIsChatModalOpen,
    chatDriver,
    selectedOrderForChat,
    setSelectedOrderForChat,
    chatMessages,
    loadingChatMessages,
    handleOpenChatModal,
  };
}
