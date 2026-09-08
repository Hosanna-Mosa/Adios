import React, { useMemo, useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { navigateToNotificationTarget } from "@/utils/deepLink";
import { fadeInUp } from "@/motion/presets";

import { NotificationsHeader } from "@/features/profile/components/NotificationsHeader";
import { NotificationsCenter } from "@/features/profile/components/NotificationsCenter";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { NotificationsBody } from "@/features/profile/components/NotificationsBody";

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  order_status: "receipt",
  chat: "chatbubble-ellipses",
  system: "megaphone",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  if (d.toDateString() === now.toDateString()) return "Today";
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      const data = await customFetch<NotificationItem[]>("/notifications");
      setItems(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchList();
    }, [])
  );

  const handleOpen = async (item: NotificationItem) => {
    if (!item.isRead) {
      setItems((prev) => prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)));
      customFetch(`/notifications/${item._id}/read`, { method: "PATCH" }).catch(() => {});
    }
    navigateToNotificationTarget(item.data);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await customFetch("/notifications/read-all", { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <ScreenShell style={{ paddingTop: insets.top }}>
      <NotificationsHeader
        handleMarkAllRead={handleMarkAllRead}
        styles={styles}
        tokens={tokens}
        unreadCount={unreadCount}
      />

      {loading ? (
        <NotificationsCenter
          accent={accent}
          styles={styles}
        />
      ) : items.length === 0 ? (
        <Animated.View style={styles.center} entering={fadeInUp(0)}>
          <Ionicons name="notifications-off-outline" size={32} color={tokens.muted} />
          <Text style={styles.emptyText}>Nothing here yet. Order and account updates will show up in this list.</Text>
        </Animated.View>
      ) : (
        <NotificationsBody
          CATEGORY_ICON={CATEGORY_ICON}
          formatWhen={formatWhen}
          accent={accent}
          handleOpen={handleOpen}
          insets={insets}
          items={items}
          styles={styles}
          tokens={tokens}
        />
      )}
    </ScreenShell>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ThemeTokens["services"]["food"]) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
    backBtn: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20), backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, alignItems: "center", justifyContent: "center" },
    headerTitle: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(17), color: tokens.text },
    markAllText: { fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(13), color: accent.accent },

    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
    emptyText: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), color: tokens.sec, textAlign: "center", lineHeight: moderateScale(19) },

    row: { flexDirection: "row", gap: 12, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 14, padding: 13 },
    rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    rowTitle: { flex: 0, fontFamily: fontFamilies.body.semibold, fontSize: moderateScale(14), color: tokens.text },
    unreadDot: { width: 6, height: 6, borderRadius: 3 },
    rowBody: { fontFamily: fontFamilies.body.regular, fontSize: moderateScale(13), lineHeight: moderateScale(18), color: tokens.sec, marginTop: 3 },
    rowTime: { fontFamily: fontFamilies.body.medium, fontSize: moderateScale(11), color: tokens.muted, marginTop: 5 },
  });
