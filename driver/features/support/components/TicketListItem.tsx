import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/colors";
import type { SupportTicket } from "../types";
import { ticketStyles as styles } from "./TicketListItem.styles";

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
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{ticket.title}</Text>
          <Text style={styles.meta}>
            ID: {ticket.ticketId} • {ticket.category}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: isOpen ? Colors.successLight : Colors.surfaceContainer },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isOpen ? Colors.success : Colors.textSecondary },
            ]}
          >
            {ticket.status}
          </Text>
        </View>
      </View>
      <Text style={styles.preview} numberOfLines={2}>{ticket.message}</Text>
      <View style={styles.bottomRow}>
        <Text style={styles.date}>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.continue}>Continue Chat →</Text>
      </View>
    </TouchableOpacity>
  );
}
