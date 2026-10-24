import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { env } from "@/utils/env";

const CHECK_INTERVAL_MS = 15000;
const PING_TIMEOUT_MS = 6000;
// Room left for a screen header above the banner, so it never covers the back button.
const HEADER_CLEARANCE = 60;

/**
 * Same approach as the customer app's OfflineBanner: no NetInfo is installed,
 * so this pings the version-check endpoint and shows the banner once that
 * ping actually fails. While offline, new orders don't reach the outlet, so
 * the partner needs to know instead of waiting on a quiet Orders screen.
 */
export function OfflineBanner() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  // The toast inverts (background is tokens.text), so Retry needs a colour for
  // that surface: light.brand on near-black, light.warning on near-white.
  const retryColor = theme === "dark" ? designTokens.light.warning : tokens.brand;

  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  const mounted = useRef(true);

  const ping = async () => {
    if (!env.apiUrl) return;
    setChecking(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    try {
      const res = await fetch(`${env.apiUrl}/auth/version-check?platform=android&version=1.0.0`, { signal: controller.signal });
      if (mounted.current && res.status < 500) setIsOffline(false);
    } catch {
      if (mounted.current) setIsOffline(true);
    } finally {
      clearTimeout(timer);
      if (mounted.current) setChecking(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    ping();
    const interval = setInterval(ping, CHECK_INTERVAL_MS);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <View style={[styles.wrap, { top: insets.top + HEADER_CLEARANCE }]} pointerEvents="box-none">
      <View style={styles.toast} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <View style={styles.dot} />
        <Text style={styles.text} numberOfLines={2}>{t("offline.partnerMessage")}</Text>
        <TouchableOpacity onPress={ping} disabled={checking} hitSlop={12} accessibilityRole="button" accessibilityLabel={t("offline.retry")}>
          <Text style={[styles.retry, { color: retryColor }]}>{checking ? t("offline.checking") : t("offline.retry")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    wrap: { position: "absolute", left: 12, right: 12, zIndex: 999 },
    toast: {
      flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: tokens.text, borderRadius: radius.sm,
      paddingHorizontal: 13, paddingVertical: 11,
      ...elevation.md,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.warning, flexShrink: 0 },
    text: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.bg },
    retry: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.6, textTransform: "uppercase" },
  });
