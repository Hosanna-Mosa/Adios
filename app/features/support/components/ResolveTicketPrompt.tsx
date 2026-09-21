import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <Modal visible={ticket.status === "PENDING_RESOLVE"} transparent animationType="fade">
      <View style={styles.resolveOverlay}>
        <View style={styles.resolveCard}>
          <Text style={styles.resolveTitle}>{t("app.support.markThisCaseResolved")}</Text>
          <Text style={styles.resolveSub}>{t("app.support.youCanReopenItAnytimeBy")}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.resolveNotYetBtn} onPress={() => handleResolve(false)}>
              <Text style={styles.resolveNotYetText}>{t("app.support.notYet")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resolveYesBtn, { backgroundColor: accent.accent }]} onPress={() => handleResolve(true)}>
              <Text style={[styles.resolveYesText, { color: accent.on }]}>{t("app.support.yesResolved")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
