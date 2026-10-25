import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { subscribeSlowNetwork } from "@/utils/api/slow-network";

const VISIBLE_MS = 3000;
// Don't nag: after a toast hides, ignore slow requests for a while.
const COOLDOWN_MS = 30000;
// Clears the bottom tab bar.
const BOTTOM_CLEARANCE = 90;

/** "Slow network" toast, shown for 3 seconds when an API request takes longer than SLOW_REQUEST_MS. */
export function SlowNetworkToast() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastShownAt = useRef(0);

  useEffect(() => {
    const unsubscribe = subscribeSlowNetwork(() => {
      const now = Date.now();
      if (hideTimer.current || now - lastShownAt.current < VISIBLE_MS + COOLDOWN_MS) return;
      lastShownAt.current = now;
      setVisible(true);
      hideTimer.current = setTimeout(() => {
        hideTimer.current = null;
        setVisible(false);
      }, VISIBLE_MS);
    });
    return () => {
      unsubscribe();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + BOTTOM_CLEARANCE }]} pointerEvents="none">
      <View style={styles.toast}>
        <View style={styles.dot} />
        <Text style={styles.text} numberOfLines={2}>
          {t("app.SlowNetworkToast.message")}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    wrap: { position: "absolute", left: 12, right: 12, zIndex: 998 },
    toast: {
      flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: tokens.text, borderRadius: radius.sm,
      paddingHorizontal: 13, paddingVertical: 11,
      ...elevation.md,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.warning, flexShrink: 0 },
    text: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.bg },
  });
