import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designTokens, elevation, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
const CHECK_INTERVAL_MS = 15000;
const PING_TIMEOUT_MS = 6000;
// Room left for a screen header (40pt back chip + its padding) above the banner.
// The banner used to sit right on top of the header and covered the back button
// exactly when an offline user most needed to leave the screen.
const HEADER_CLEARANCE = 60;

/**
 * There's no NetInfo (or any native connectivity module) installed in this
 * app, so this can't get an instant OS-level "you just went offline" event.
 * Instead it periodically pings the real version-check endpoint (the same
 * one already hit on launch) and shows the banner once that ping actually
 * fails — a real, if slightly delayed, reachability signal rather than a
 * fabricated always-on/always-off indicator.
 */
export function OfflineBanner() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [theme, tokens]);
  // This toast always inverts (its background is `tokens.text`, not `tokens.bg`),
  // so Retry needs a color tuned for *that* surface, not the current theme's own
  // brand accent. In light mode the toast sits on a near-black surface, where
  // light.brand already reads at ~5.8:1. In dark mode the toast sits on a
  // near-white surface, where dark.brand (built for dark surfaces) drops to
  // ~1.9:1 — computed via the WCAG relative-luminance formula — so dark mode
  // borrows light.warning instead, which reads at ~4.9:1 on that same near-white
  // surface and stays in the same warm/amber family as the dot above it.
  const retryColor = theme === "dark" ? designTokens.light.warning : tokens.brand;

  const [isOffline, setIsOffline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(new Date());
  const [checking, setChecking] = useState(false);
  const mounted = useRef(true);

  const ping = async () => {
    if (!apiUrl) return;
    setChecking(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    try {
      const res = await fetch(`${apiUrl}/auth/version-check?platform=android&version=1.0.0`, { signal: controller.signal });
      if (!mounted.current) return;
      if (res.ok || res.status < 500) {
        setIsOffline(false);
        setLastOnlineAt(new Date());
      }
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

  const minsAgo = lastOnlineAt ? Math.max(0, Math.round((Date.now() - lastOnlineAt.getTime()) / 60000)) : null;

  return (
    <View style={[styles.wrap, { top: insets.top + HEADER_CLEARANCE }]} pointerEvents="box-none">
      <View style={styles.toast}>
        <View style={styles.dot} />
        <Text style={styles.text} numberOfLines={2}>
          {t("app.OfflineBanner.youaposreOffline")}{minsAgo != null ? ` · ${t("app.OfflineBanner.lastSyncedMinutesAgo", { count: minsAgo })}` : ""}
        </Text>
        <TouchableOpacity onPress={ping} disabled={checking} hitSlop={12} accessibilityRole="button">
          <Text style={[styles.retry, { color: retryColor }]}>{checking ? t("app.OfflineBanner.checking") : t("app.OfflineBanner.retry")}</Text>
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
    // color intentionally omitted — set inline as `retryColor`, since it needs
    // a value from the *other* theme's tokens, not this one.
    retry: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 0.6, textTransform: "uppercase" },
  });
