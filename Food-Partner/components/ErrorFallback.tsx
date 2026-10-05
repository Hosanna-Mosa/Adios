import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { EmptyState } from "@/components/ui/EmptyState";

export type ErrorFallbackProps = { error: Error; resetError: () => void };

/** What a crashed screen shows instead of a white page. */
export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = designTokens[useThemeStore((s) => s.theme)];

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg, paddingTop: insets.top }]}>
      <EmptyState
        icon="warning-outline"
        title={t("errors.somethingWentWrong")}
        subtitle={__DEV__ ? error.message : t("errors.tryAgainMessage")}
        actionLabel={t("actions.tryAgain")}
        onAction={resetError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center" },
});
