import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import type { SupportTicket } from "../types";

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
  return (
    <View style={[styles.header, { paddingTop, borderBottomColor: Colors.border }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={22} color={Colors.text} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <View style={[styles.headerAvatar, { backgroundColor: Colors.primaryLight }]}>
          <Feather name="headphones" size={18} color={Colors.primary} />
          {ticket && ticket.status !== "RESOLVED" && <View style={styles.onlineDot} />}
        </View>
        {ticket && (
          <View>
            <Text style={[styles.headerName, { color: Colors.text }]}>Partner Support</Text>
            <Text style={styles.headerStatus}>Ticket {ticket.ticketId} • {ticket.status}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
