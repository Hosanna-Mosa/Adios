import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import { SupportTicketListIssueCategory } from "./SupportTicketListIssueCategory";

// Moved out of app/support-chat.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  formatDate: any;
  STATUS_LABEL: any;
  CATEGORIES: any[];
  accent: any;
  allTickets: any[];
  creatingTicket: any;
  handleCreateTicket: any;
  handleReopen: any;
  insets: any;
  newCategory: any;
  newMessage: any;
  newTitle: any;
  setNewCategory: React.Dispatch<React.SetStateAction<any>>;
  setNewMessage: React.Dispatch<React.SetStateAction<any>>;
  setNewTitle: React.Dispatch<React.SetStateAction<any>>;
  setTicket: React.Dispatch<React.SetStateAction<any>>;
  setViewMode: React.Dispatch<React.SetStateAction<any>>;
  styles: any;
  ticket: any;
  tokens: any;
}

export function SupportTicketList(props: Props) {
  const { STATUS_LABEL, accent, allTickets, formatDate, handleReopen, insets, setNewMessage, setNewTitle, setTicket, setViewMode, styles, ticket, tokens } = props;
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
      {allTickets.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
          {allTickets.map((t, idx) => {
            const isResolved = t.status === "RESOLVED";
            const isPending = t.status === "PENDING_RESOLVE";
            const stripeColor = isResolved ? tokens.success : isPending ? tokens.services.task.accent : tokens.warning;
            return (
              <Animated.View key={t._id} entering={staggerListItem(idx)}>
                <TouchableOpacity
                  activeOpacity={isResolved ? 1 : 0.85}
                  onPress={() => { if (!isResolved) { setTicket(t); setViewMode("chat"); } }}
                  style={[styles.caseCard, { borderLeftColor: stripeColor }]}
                >
                  <View style={styles.caseTopRow}>
                    <Text style={[styles.caseEyebrow, { color: stripeColor }]} numberOfLines={1}>{t.category} · #{t.ticketId}</Text>
                    <View style={[styles.caseStatusPill, { backgroundColor: isResolved ? tokens.successSkin : isPending ? tokens.services.task.skin : tokens.warningSkin }]}>
                      <Text style={[styles.caseStatusPillText, { color: isResolved ? tokens.success : isPending ? tokens.services.task.accent : tokens.warning }]}>{STATUS_LABEL[t.status]}</Text>
                    </View>
                  </View>
                  <Text style={styles.caseTitle} numberOfLines={1}>{t.title}</Text>
                  <Text style={styles.caseMeta}>
                    {isResolved ? `Closed ${formatDate(t.updatedAt)}` : `${t.messages.length} message${t.messages.length === 1 ? "" : "s"} · updated ${formatDate(t.updatedAt)}`}
                  </Text>
                  {isResolved && (
                    <View style={styles.caseActionRow}>
                      <TouchableOpacity style={styles.caseActionOutline} onPress={() => handleReopen(t)}>
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
