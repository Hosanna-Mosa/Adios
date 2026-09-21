import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type SupportChatStyles } from "@/features/support/support-chat.styles";

// Moved out of app/support-chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  insets: EdgeInsets;
  styles: SupportChatStyles;
}

export function SupportChatLoading({
  accent,
  insets,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.center, { paddingTop: insets.top }]}>
      <ActivityIndicator size="large" color={accent.accent} />
      <Text style={styles.loadingText}>{t("app.support.loadingYourCases")}</Text>
    </View>
  );
}
