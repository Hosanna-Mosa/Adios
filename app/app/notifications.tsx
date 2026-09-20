import React, { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/services/notifications.service";
import { navigateToNotificationTarget } from "@/utils/deepLink";
import { NotificationsHeader } from "@/features/profile/components/NotificationsHeader";
import { NotificationsCenter } from "@/features/profile/components/NotificationsCenter";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { NotificationsBody } from "@/features/profile/components/NotificationsBody";
import { createStyles } from "@/features/profile/notifications.styles";
import { NotificationsEmptyState } from "@/features/profile/components/NotificationsEmptyState";

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
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme, tokens]);

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      const data = await getNotifications();
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
      markNotificationRead(item._id).catch(() => {});
    }
    navigateToNotificationTarget(item.data);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsRead();
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
        <NotificationsEmptyState styles={styles} tokens={tokens} />
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
