import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ServiceTokens } from "@/constants/colors";
import { type ChatStyles } from "@/features/support/useChat.shared";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  handleAssignTask: () => void;
  styles: ChatStyles;
}

export function ChatAssignRow({
  accent,
  handleAssignTask,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={[styles.assignRow, { backgroundColor: accent.skin, borderColor: accent.accent }]} onPress={handleAssignTask} activeOpacity={0.85}>
      <View style={[styles.assignIcon, { backgroundColor: accent.accent }]}>
        <Ionicons name="construct" size={14} color={accent.on} />
      </View>
      <Text style={styles.assignText}>{t("app.support.assignTask")}</Text>
      <Text style={[styles.assignSend, { color: accent.accent }]}>SEND</Text>
    </TouchableOpacity>
  );
}
