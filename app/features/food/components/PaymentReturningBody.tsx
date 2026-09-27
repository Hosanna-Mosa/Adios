import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

/** Shown for the moment the app spends on flavour://payment-result. */
export function PaymentReturningBody() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <View style={styles.root}>
      <ActivityIndicator color={tokens.brand} />
      <Text style={styles.text}>{t("app.payment.returning")}</Text>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, backgroundColor: tokens.bg, paddingHorizontal: 32 },
    text: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: tokens.sec, textAlign: "center" },
  });
