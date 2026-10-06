import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAlert } from "@/components/ui/AppAlert";
import { type ServiceTokens } from "@/constants/colors";
import { useTokens } from "@/contexts/themeStore";
import type { ChatMessage, SupportTicket } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { getPartnerSupportCategories } from "./categories";
import { createStyles } from "./support-chat.styles";
import { useCreateTicket, useResolveTicket, useSendTicketMessage, useSupportTickets } from "./useSupportTickets";

// State and handlers for app/support-chat.tsx — the customer app's
// useSupportChat, on TanStack Query instead of hand-rolled polling.

export function useSupportChat() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ ticketId?: string }>();
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
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

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
      { title: newTitle.trim(), category: newCategory, message: newMessage.trim() },
      {
        onSuccess: (created) => {
          setNewTitle("");
          setNewMessage("");
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
    creatingTicket: create.isPending,
    flatListRef,
    handleCreateTicket,
    handleSendMessage,
    handleResolve,
    handleReopen,
    startNewChat,
  };
}
