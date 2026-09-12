import React, { useCallback, useState } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { navigateToNotificationTarget } from "@/utils/deepLink";
import { NotificationRow, NotificationsEmpty, NotificationsHeader, NotificationsLoading } from "@/features/profile/components";
import { styles } from "@/features/profile/notifications.styles";
import type { NotificationItem } from "@/features/profile/utils/notifications";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { List } from "@/components/ui/List";
import { Box } from "@/components/ui/Box";

export default function DriverNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useDriverStore();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const fetchList = async () => {
    try {
      const res = await fetch(`${apiUrl}/notifications`, { headers: authHeaders() });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchList();
    }, [])
  );

  const handleOpen = async (item: NotificationItem) => {
    if (!item.isRead) {
      setItems((prev) => prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)));
      fetch(`${apiUrl}/notifications/${item._id}/read`, { method: "PATCH", headers: authHeaders() }).catch(() => {});
    }
    navigateToNotificationTarget(item.data);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch(`${apiUrl}/notifications/read-all`, { method: "PATCH", headers: authHeaders() });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <Box style={[styles.root, { paddingTop: insets.top }]}>
      <NotificationsHeader
        unreadCount={unreadCount}
        onBack={() => router.back()}
        onMarkAllRead={handleMarkAllRead}
      />

      {loading ? (
        <NotificationsLoading />
      ) : items.length === 0 ? (
        <NotificationsEmpty message="Nothing here yet. Job and account updates will show up in this list." />
      ) : (
        <List
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 24, gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NotificationRow item={item} onPress={() => handleOpen(item)} />
          )}
        />
      )}
    </Box>
  );
}
