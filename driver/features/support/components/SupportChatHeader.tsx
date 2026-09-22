import React from "react";

import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import type { SupportTicket } from "../types";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Chat header showing the agent avatar and the ticket's id and status. */
export function SupportChatHeader({
  ticket,
  paddingTop,
  onBack,
}: {
  ticket: SupportTicket | null;
  paddingTop: number;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const STATUS_LABEL: Record<SupportTicket["status"], string> = {
    OPEN: t("support.statusLabel.open"),
    RESOLVED: t("support.statusLabel.resolved"),
    PENDING_RESOLVE: t("support.statusLabel.pendingResolve"),
  };
  return (
    <Box style={[styles.header, { paddingTop, borderBottomColor: Colors.border }]}>
      <Touchable style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={22} color={Colors.text} />
      </Touchable>
      <Box style={styles.headerCenter}>
        <Box style={[styles.headerAvatar, { backgroundColor: Colors.primaryLight }]}>
          <Feather name="headphones" size={18} color={Colors.primary} />
          {ticket && ticket.status !== "RESOLVED" && <Box style={styles.onlineDot} />}
        </Box>
        {ticket && (
          <Box>
            <AppText style={[styles.headerName, { color: Colors.text }]}>{t("support.partnerSupport")}</AppText>
            <AppText style={styles.headerStatus}>{t("support.ticket")} {ticket.ticketId} • {STATUS_LABEL[ticket.status]}</AppText>
          </Box>
        )}
      </Box>
    </Box>
  );
}
