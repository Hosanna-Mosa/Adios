import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  partnerLabel: any;
  styles: any;
  tokens: any;
}

export function ChatEmptyState({
  partnerLabel,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={32} color={tokens.muted} />
      <Text style={styles.emptyStateText}>{t("app.support.messagesWithVarWillShowUpHere", { value: partnerLabel.toLowerCase() })}</Text>
    </View>
  );
}
