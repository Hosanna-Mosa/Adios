import React from "react";

import { useTranslation } from "react-i18next";
import { styles } from "../auth.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export type AuthMode = "signin" | "signup";

/** Sign In / Sign Up switch at the top of the auth form. */
export function AuthModeTabs({
  mode,
  onSwitchMode,
}: {
  mode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.tabRow}>
      <Touchable
        style={[styles.tab, mode === "signin" && styles.tabActive]}
        onPress={() => onSwitchMode("signin")}
      >
        <AppText style={[styles.tabText, mode === "signin" && styles.tabTextActive]}>{t("auth.signIn")}</AppText>
      </Touchable>
      <Touchable
        style={[styles.tab, mode === "signup" && styles.tabActive]}
        onPress={() => onSwitchMode("signup")}
      >
        <AppText style={[styles.tabText, mode === "signup" && styles.tabTextActive]}>{t("auth.signUp")}</AppText>
      </Touchable>
    </Box>
  );
}
