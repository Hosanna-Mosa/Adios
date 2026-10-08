import { useMemo } from "react";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import { designTokens, type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// Theme, accent and a screen's stylesheet — the same few lines every package delivery screen needs.
// Package delivery screens wear the delivery accent.

export function usePackageDeliveryTheme<S>(createStyles: (tokens: ThemeTokens, accent: ServiceTokens, insets: EdgeInsets) => S) {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.delivery;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const styles = useMemo(() => createStyles(tokens, accent, insets), [theme, insets.top, insets.bottom]);
  return { insets, tokens, accent, styles };
}
