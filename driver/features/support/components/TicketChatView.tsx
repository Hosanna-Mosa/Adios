import React from "react";
import { Platform, FlatList } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import { ResolveRequestPrompt } from "./ResolveRequestPrompt";
import { ResolvedNotice } from "./ResolvedNotice";
import { SupportChatHeader } from "./SupportChatHeader";
import { SupportMessageBubble } from "./SupportMessageBubble";
import type { SupportTicket } from "../types";
import { MessageComposer } from "@/components/shared/MessageComposer";
import { KeyboardView } from "@/components/ui/KeyboardView";
import { List } from "@/components/ui/List";

/** The open ticket: its thread, and whichever footer the ticket's state calls
 * for — the composer, the resolve prompt, or the resolved notice. */
export function TicketChatView({
  ticket,
  flatListRef,
  topInset,
  bottomInset,
  inputText,
  setInputText,
  submittingReply,
  onBack,
  onSend,
  onReopen,
  onStartNew,
  onResolve,
}: {
  ticket: SupportTicket | null;
  flatListRef: React.RefObject<FlatList | null>;
  topInset: number;
  bottomInset: number;
  inputText: string;
  setInputText: (v: string) => void;
  submittingReply: boolean;
  onBack: () => void;
  onSend: () => void;
  onReopen: () => void;
  onStartNew: () => void;
  onResolve: (approve: boolean) => void;
}) {
  return (
    <KeyboardView
      style={[styles.root, { backgroundColor: Colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <SupportChatHeader
        ticket={ticket}
        paddingTop={topInset}
        onBack={onBack}
      />

      {/* Message List */}
      {ticket && (
        <List
          ref={flatListRef}
          data={ticket.messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <SupportMessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Input Bar */}
      {ticket && ticket.status === "RESOLVED" ? (
        <ResolvedNotice
          paddingBottom={bottomInset + 16}
          onReopen={onReopen}
          onStartNew={onStartNew}
        />
      ) : ticket && ticket.status === "PENDING_RESOLVE" ? (
        <ResolveRequestPrompt
          paddingBottom={bottomInset + 16}
          onApprove={() => onResolve(true)}
          onDecline={() => onResolve(false)}
        />
      ) : (
        <MessageComposer
          placeholder="Type a message to Support..."
          maxLength={400}
          value={inputText}
          onChangeText={setInputText}
          onSend={onSend}
          disabled={submittingReply}
          paddingBottom={bottomInset + 8}
        />
      )}
    </KeyboardView>
  );
}
