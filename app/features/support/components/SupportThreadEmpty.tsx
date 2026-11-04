import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

/** A support case with no messages yet — same pattern as the partner chat's ChatEmptyState. */
export function SupportThreadEmpty({ tokens }: { tokens: ThemeTokens }) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Ionicons name="chatbubbles-outline" size={32} color={tokens.muted} />
      <Text style={[styles.text, { color: tokens.sec }]}>{t("app.support.noMessagesYet")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
  text: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, textAlign: "center", paddingHorizontal: 40 },
});
