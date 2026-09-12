import React from "react";

import { Colors } from "@/constants/colors";
import type { SupportTicket } from "../types";
import { ticketStyles as styles } from "./TicketListItem.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** One past or ongoing support case in the sessions list. */
export function TicketListItem({
  ticket,
  onPress,
}: {
  ticket: SupportTicket;
  onPress: () => void;
}) {
  const isOpen = ticket.status === "OPEN" || ticket.status === "PENDING_RESOLVE";

  return (
    <Touchable onPress={onPress} style={styles.card}>
      <Box style={styles.topRow}>
        <Box style={styles.titleWrap}>
          <AppText style={styles.title} numberOfLines={1}>{ticket.title}</AppText>
          <AppText style={styles.meta}>
            ID: {ticket.ticketId} • {ticket.category}
          </AppText>
        </Box>
        <Box
          style={[
            styles.statusPill,
            { backgroundColor: isOpen ? Colors.successLight : Colors.surfaceContainer },
          ]}
        >
          <AppText
            style={[
              styles.statusText,
              { color: isOpen ? Colors.success : Colors.textSecondary },
            ]}
          >
            {ticket.status}
          </AppText>
        </Box>
      </Box>
      <AppText style={styles.preview} numberOfLines={2}>{ticket.message}</AppText>
      <Box style={styles.bottomRow}>
        <AppText style={styles.date}>{new Date(ticket.createdAt).toLocaleDateString()}</AppText>
        <AppText style={styles.continue}>Continue Chat →</AppText>
      </Box>
    </Touchable>
  );
}
