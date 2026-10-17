import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAlert } from "@/components/ui/AppAlert";
import { type ServiceTokens } from "@/constants/colors";
import { useTokens } from "@/contexts/themeStore";
import { useOrderHistory, useVendorOrders } from "@/queries/orders.queries";
import type { ChatMessage, SupportTicket } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { mergeOrders } from "@/utils/orderWindow";
import { getPartnerSupportCategories } from "./categories";
import { createStyles } from "./support-chat.styles";
import { useCreateTicket, useResolveTicket, useSendTicketMessage, useSupportTickets } from "./useSupportTickets";

// State and handlers for app/support-chat.tsx — the customer app's
// useSupportChat, on TanStack Query instead of hand-rolled polling.

export function useSupportChat() {
  const { t } = useTranslation();
  // ?orderId=… comes from an order's "Get help with this order", pre-selecting it on a new case.
  const params = useLocalSearchParams<{ ticketId?: string; orderId?: string }>();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const accent: ServiceTokens = useMemo(() => ({ accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand }), [tokens]);
  const styles = useMemo(() => createStyles(tokens, accent), [tokens, accent]);

  const query = useSupportTickets(true);
  const create = useCreateTicket();
  const send = useSendTicketMessage();
  const resolve = useResolveTicket();

  const [viewMode, setViewMode] = useState<"cases" | "chat">(params.ticketId ? "chat" : "cases");
  const [ticketId, setTicketId] = useState<string | null>(params.ticketId ?? null);
  const [inputText, setInputText] = useState("");
  // Rebuilt each render so the labels follow a language change.
  const categories = getPartnerSupportCategories();
  const [newCategory, setNewCategory] = useState(categories[0].value);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newOrderId, setNewOrderId] = useState<string | null>(params.orderId ?? null);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  // The orders a new case can be about: today's and the latest from history, plus the
  // one the partner came from when it is older than those.
  const { data: liveOrders } = useVendorOrders();
  const { data: history } = useOrderHistory();
  const orderChoices = useMemo(() => {
    const recent = mergeOrders(liveOrders, history?.pages[0]).slice(0, 6);
    const ids = recent.map((order) => order._id);
    if (params.orderId && !ids.includes(params.orderId)) ids.unshift(params.orderId);
    return ids;
  }, [liveOrders, history, params.orderId]);

  const allTickets = useMemo(() => query.data ?? [], [query.data]);
  // Derived from the list, so a reply pushed over the socket shows up in the open chat.
  const ticket = ticketId ? (allTickets.find((t) => t._id === ticketId) ?? null) : null;

  useEffect(() => {
    if (ticket?.messages.length) {
      const timer = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
      return () => clearTimeout(timer);
    }
  }, [ticket?.messages.length]);

  const openTicket = (target: SupportTicket) => {
    setTicketId(target._id);
    setViewMode("chat");
  };

  const handleCreateTicket = () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      showAlert(t("support.missingDetails"), t("support.addTitleAndDescription"), undefined, "warning");
      return;
    }
    create.mutate(
      { title: newTitle.trim(), category: newCategory, message: newMessage.trim(), ...(newOrderId ? { orderId: newOrderId } : {}) },
      {
        onSuccess: (created) => {
          setNewTitle("");
          setNewMessage("");
          setNewOrderId(null);
          openTicket(created);
        },
        onError: (error) => showAlert(t("support.couldNotSubmit"), errorMessage(error, t("errors.tryAgainMessage")), undefined, "error"),
      },
    );
  };

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text || !ticket) return;
    setInputText("");
    send.mutate(
      { ticketId: ticket._id, text },
      {
        onError: (error) => {
          setInputText(text);
          showAlert(t("support.messageNotSent"), errorMessage(error, t("errors.tryAgainMessage")), undefined, "error");
        },
      },
    );
  };

  const handleResolve = (approve: boolean) => {
    if (!ticket) return;
    resolve.mutate(
      { ticketId: ticket._id, approve },
      { onError: (error) => showAlert(t("errors.somethingWentWrong"), errorMessage(error, t("errors.tryAgainMessage")), undefined, "error") },
    );
  };

  const handleReopen = (target: SupportTicket) => {
    send.mutate(
      { ticketId: target._id, text: t("support.reopenMessage") },
      {
        onSuccess: () => openTicket(target),
        onError: (error) => showAlert(t("errors.somethingWentWrong"), errorMessage(error, t("support.reopenFailed")), undefined, "error"),
      },
    );
  };

  const startNewChat = () => {
    setNewTitle("");
    setNewMessage("");
    setNewOrderId(null);
    setTicketId(null);
    setViewMode("cases");
  };

  return {
    insets,
    tokens,
    accent,
    styles,
    viewMode,
    backToCases: () => setViewMode("cases"),
    loading: query.isLoading,
    allTickets,
    ticket,
    openTicket,
    inputText,
    setInputText,
    submittingReply: send.isPending,
    categories,
    newCategory,
    setNewCategory,
    newTitle,
    setNewTitle,
    newMessage,
    setNewMessage,
    orderChoices,
    newOrderId,
    setNewOrderId,
    creatingTicket: create.isPending,
    flatListRef,
    handleCreateTicket,
    handleSendMessage,
    handleResolve,
    handleReopen,
    startNewChat,
  };
}
