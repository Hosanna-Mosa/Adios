import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import type { ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import type { AuthStyles } from "../auth.styles";

interface Props {
  canApply: boolean;
  openApply: () => void;
  styles: AuthStyles;
  tokens: ThemeTokens;
}

/** "Become a partner" (when the partner website is configured) and the security note. */
export function LoginFooter({ canApply, openApply, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <>
      {canApply ? (
        <Animated.View entering={fadeInUp(140)} style={styles.footer}>
          <Text style={styles.footerText}>{t("auth.newPartner")}</Text>
          <Button title={t("auth.applyOnWebsite")} variant="link" onPress={openApply} style={styles.centerLink} />
        </Animated.View>
      ) : null}
      <View style={styles.trust}>
        <Ionicons name="shield-checkmark-outline" size={14} color={tokens.muted} />
        <Text style={styles.trustText}>{t("auth.secureNote")}</Text>
      </View>
    </>
  );
}
