import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { SupportTicketListIssueCategory } from "./SupportTicketListIssueCategory";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type SupportChatStyles } from "@/features/support/support-chat.styles";

// Moved out of app/support-chat.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  formatDate: any;
  STATUS_LABEL: any;
  CATEGORIES: any[];
  accent: ServiceTokens;
  allTickets: any[];
  creatingTicket: any;
  handleCreateTicket: () => void;
  handleReopen: any;
  insets: EdgeInsets;
  newCategory: any;
  newMessage: any;
  newTitle: string;
  setNewCategory: React.Dispatch<React.SetStateAction<any>>;
  setNewMessage: React.Dispatch<React.SetStateAction<any>>;
  setNewTitle: React.Dispatch<React.SetStateAction<any>>;
  setTicket: React.Dispatch<React.SetStateAction<any>>;
  setViewMode: React.Dispatch<React.SetStateAction<any>>;
  styles: SupportChatStyles;
  ticket: any;
  tokens: ThemeTokens;
  /** Support replies the customer hasn't opened yet (see useSupportUnreadReplies). */
  unreadCount: (ticket: any) => number;
}

export function SupportTicketList(props: Props) {
  const { STATUS_LABEL, accent, allTickets, formatDate, handleReopen, insets, setNewMessage, setNewTitle, setTicket, setViewMode, styles, ticket, tokens, unreadCount } = props;
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
      {allTickets.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
          {allTickets.map((item, idx) => {
            const isResolved = item.status === "RESOLVED";
            const isPending = item.status === "PENDING_RESOLVE";
            const stripeColor = isResolved ? tokens.success : isPending ? tokens.services.task.accent : tokens.warning;
            const newReplies = unreadCount(item);
            return (
              <Animated.View key={item._id} entering={staggerListItem(idx)}>
                <TouchableOpacity
                  activeOpacity={isResolved ? 1 : 0.85}
                  onPress={() => { if (!isResolved) { setTicket(item); setViewMode("chat"); } }}
                  style={[styles.caseCard, { borderLeftColor: stripeColor }]}
                >
                  <View style={styles.caseTopRow}>
                    <Text style={[styles.caseEyebrow, { color: stripeColor }]} numberOfLines={1}>{item.category} · #{item.ticketId}</Text>
                    <View style={[styles.caseStatusPill, { backgroundColor: isResolved ? tokens.successSkin : isPending ? tokens.services.task.skin : tokens.warningSkin }]}>
                      <Text style={[styles.caseStatusPillText, { color: isResolved ? tokens.success : isPending ? tokens.services.task.accent : tokens.warning }]}>{STATUS_LABEL[item.status]}</Text>
                    </View>
                  </View>
                  <Text style={styles.caseTitle} numberOfLines={1}>{item.title}</Text>
                  {newReplies > 0 && (
                    <View
                      style={[styles.newReplyBadge, { backgroundColor: accent.skin, borderColor: accent.accent }]}
                      accessibilityLabel={t("app.support.newReplies", { count: newReplies })}
                    >
                      <View style={[styles.newReplyDot, { backgroundColor: accent.accent }]} />
                      <Text style={[styles.newReplyText, { color: accent.accent }]}>{t("app.support.newReplies", { count: newReplies })}</Text>
                    </View>
                  )}
                  <Text style={styles.caseMeta}>
                    {isResolved ? `Closed ${formatDate(item.updatedAt)}` : `${item.messages.length} message${item.messages.length === 1 ? "" : "s"} · updated ${formatDate(item.updatedAt)}`}
                  </Text>
                  {isResolved && (
                    <View style={styles.caseActionRow}>
                      <TouchableOpacity style={styles.caseActionOutline} onPress={() => handleReopen(item)}>
                        <Text style={styles.caseActionOutlineText}>{t("app.support.reopenCase")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.caseActionFilled, { backgroundColor: accent.skin, borderColor: accent.accent }]}
                        onPress={() => { setNewTitle(""); setNewMessage(""); }}
                      >
                        <Text style={[styles.caseActionFilledText, { color: accent.accent }]}>{t("app.support.startNewChat")}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionLabel}>{t("app.support.raiseANewTicket")}</Text>
      <SupportTicketListIssueCategory {...props} />
    </ScrollView>
  );
}
