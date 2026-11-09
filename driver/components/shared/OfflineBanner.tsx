import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, elevation, radius } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { API_URL } from "@/utils/apiUrl";
import { AppText } from "@/components/ui/AppText";
import { PressBox } from "@/components/ui/PressBox";

const CHECK_INTERVAL_MS = 15000;
const PING_TIMEOUT_MS = 6000;
// Room left for a screen header above the banner, so it never covers the back button.
const HEADER_CLEARANCE = 60;

/**
 * Same approach as the customer app's OfflineBanner: no NetInfo is installed,
 * so this pings the version-check endpoint and shows the banner once that
 * ping actually fails. A driver who is offline misses job offers, so they
 * need to know rather than wait on a quiet screen.
 */
export function OfflineBanner() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  const mounted = useRef(true);

  const ping = async () => {
    setChecking(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    try {
      const res = await fetch(`${API_URL}/auth/version-check?platform=android&version=1.0.0`, { signal: controller.signal });
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
        <AppText style={styles.text} numberOfLines={2}>{t("offline.driverMessage")}</AppText>
        <PressBox onPress={ping} disabled={checking} hitSlop={12} accessibilityRole="button" accessibilityLabel={t("offline.retry")}>
          <AppText style={styles.retry}>{checking ? t("offline.checking") : t("offline.retry")}</AppText>
        </PressBox>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 12, right: 12, zIndex: 999 },
  toast: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.text, borderRadius: radius.sm,
    paddingHorizontal: 13, paddingVertical: 11,
    ...elevation.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warningLight, flexShrink: 0 },
  text: { flex: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: Colors.white },
  retry: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, letterSpacing: 0.6, textTransform: "uppercase", color: Colors.primary },
});
