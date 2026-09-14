import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  handleAssignTask: any;
  styles: any;
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
