import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import type { ThemeTokens } from "@/constants/colors";
import type { SupportChatStyles } from "../support-chat.styles";

/** Spinner + "Loading your cases…" while the first fetch is in flight. */
export function SupportLoading({ styles, tokens }: { styles: SupportChatStyles; tokens: ThemeTokens }) {
  const { t } = useTranslation();
  return (
    <View style={styles.loading}>
      <FullScreenLoader color={tokens.brand} />
      <Text style={styles.loadingText}>{t("support.loadingCases")}</Text>
    </View>
  );
}
