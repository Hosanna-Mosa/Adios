import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppState, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { getPushPermissionStatus, registerForPushNotificationsAsync } from "@/utils/notificationRegister";

/**
 * Shown above the notification list when the OS has notifications switched off
 * for the app — otherwise order and chat alerts just never arrive, with no hint
 * why. It re-checks when the app returns to the foreground, so coming back from
 * Settings with the permission on hides it and registers the device for push.
 */
export function NotificationsPermissionBanner() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const [denied, setDenied] = useState(false);
  const wasDenied = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const status = await getPushPermissionStatus();
      if (cancelled) return;
      if (status === "granted" && wasDenied.current) {
        wasDenied.current = false;
        registerForPushNotificationsAsync();
      }
      if (status === "denied") wasDenied.current = true;
      setDenied(status === "denied");
    };
    check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  if (!denied) return null;

  return (
    <View style={styles.wrap}>
      <Ionicons name="notifications-off-outline" size={20} color={tokens.warning} />
      <View style={styles.textCol}>
        <Text style={styles.title}>{t("app.permissions.notificationsOffTitle")}</Text>
        <Text style={styles.body}>{t("app.permissions.notificationsOffBody")}</Text>
      </View>
      <TouchableOpacity onPress={() => { Linking.openSettings().catch(() => {}); }} hitSlop={10} accessibilityRole="button">
        <Text style={styles.action}>{t("app.permissions.openSettings")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 14,
      borderRadius: radius.md,
      backgroundColor: tokens.warningSkin,
    },
    textCol: { flex: 1, gap: 2 },
    title: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    body: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec },
    action: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.warning, textTransform: "uppercase", letterSpacing: 0.6 },
  });
