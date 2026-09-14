import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/support-chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  insets: any;
  styles: any;
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
