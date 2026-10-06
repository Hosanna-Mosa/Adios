import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ThemeTokens } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import type { SupportTicket } from "@/types/models";
import { formatRelativeDate } from "@/utils/format";
import { categoryLabel } from "../categories";
import type { SupportChatStyles } from "../support-chat.styles";

interface Props {
  tickets: SupportTicket[];
  onOpen: (ticket: SupportTicket) => void;
  onReopen: (ticket: SupportTicket) => void;
  onStartNew: () => void;
  unreadCount: (ticket: SupportTicket) => number;
  styles: SupportChatStyles;
  tokens: ThemeTokens;
}

const STATUS: Record<SupportTicket["status"], { key: string; tone: BadgeTone }> = {
  OPEN: { key: "support.status.open", tone: "warning" },
  PENDING_RESOLVE: { key: "support.status.pendingResolve", tone: "info" },
  RESOLVED: { key: "support.status.resolved", tone: "success" },
};

/** The partner's support cases — the customer app's case cards (status stripe, unread badge). */
export function SupportCaseList({ tickets, onOpen, onReopen, onStartNew, unreadCount, styles, tokens }: Props) {
  const { t } = useTranslation();
  if (!tickets.length) return null;
  const stripe: Record<SupportTicket["status"], string> = { OPEN: tokens.warning, PENDING_RESOLVE: tokens.info, RESOLVED: tokens.success };

  return (
    <View style={styles.casesContent}>
      {tickets.map((item, idx) => {
        const isResolved = item.status === "RESOLVED";
        const newReplies = unreadCount(item);
        return (
          <Animated.View key={item._id} entering={staggerListItem(idx)}>
            <Card
              bordered
              elevationLevel="none"
              onPress={isResolved ? undefined : () => onOpen(item)}
              accessibilityLabel={item.title}
              style={[styles.caseCard, { borderLeftColor: stripe[item.status] }]}
            >
              <View style={styles.caseTopRow}>
                <Text style={[styles.caseEyebrow, { color: stripe[item.status] }]} numberOfLines={1}>
                  {categoryLabel(item.category)} · #{item.ticketId}
                </Text>
                <Badge label={t(STATUS[item.status].key)} tone={STATUS[item.status].tone} />
              </View>
              <Text style={styles.caseTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {newReplies > 0 ? (
                <View style={styles.newReply}>
                  <Badge label={t("support.newReplies", { count: newReplies })} tone="brand" dot />
                </View>
              ) : null}
              <Text style={styles.caseMeta}>
                {isResolved
                  ? t("support.closedOn", { date: formatRelativeDate(item.updatedAt) })
                  : t("support.caseMeta", { count: item.messages.length, date: formatRelativeDate(item.updatedAt) })}
              </Text>
              {isResolved ? (
                <View style={styles.caseActions}>
                  <Button title={t("support.reopenCase")} variant="secondary" size="sm" onPress={() => onReopen(item)} style={styles.flex} />
                  <Button title={t("support.startNewChat")} size="sm" onPress={onStartNew} style={styles.flex} />
                </View>
              ) : null}
            </Card>
          </Animated.View>
        );
      })}
    </View>
  );
}
