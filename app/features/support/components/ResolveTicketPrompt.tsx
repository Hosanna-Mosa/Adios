import { Modal, Text, TouchableOpacity, View } from "react-native";
import { type ServiceTokens } from "@/constants/colors";
import { type SupportChatStyles } from "@/features/support/support-chat.styles";

// Moved out of app/support-chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  handleResolve: any;
  styles: SupportChatStyles;
  ticket: any;
}

export function ResolveTicketPrompt({
  accent,
  handleResolve,
  styles,
  ticket,
}: Props) {
  return (
    <Modal visible={ticket.status === "PENDING_RESOLVE"} transparent animationType="fade">
      <View style={styles.resolveOverlay}>
        <View style={styles.resolveCard}>
          <Text style={styles.resolveTitle}>Mark this case resolved?</Text>
          <Text style={styles.resolveSub}>You can reopen it anytime by sending a new message — your chat history stays.</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.resolveNotYetBtn} onPress={() => handleResolve(false)}>
              <Text style={styles.resolveNotYetText}>Not yet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resolveYesBtn, { backgroundColor: accent.accent }]} onPress={() => handleResolve(true)}>
              <Text style={[styles.resolveYesText, { color: accent.on }]}>Yes, resolved</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
