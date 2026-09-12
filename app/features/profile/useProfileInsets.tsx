import React, { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { createStyles } from "./profile.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { useAppTabBarHeight } from "@/components/AppTabBar";
import { getUnreadCount } from "@/services/notifications.service";
import { getProfile } from "@/services/users.service";
import { getOrders } from "@/services/orders.service";

// Split out of useProfile so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useProfileInsets() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [loading, setLoading] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const [securityVisible, setSecurityVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      getUnreadCount()
        .then((res) => setUnreadCount(res?.unreadCount || 0))
        .catch(() => {});
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      if (data) setUser(data);
      try {
        const ordersData = await getOrders();
        if (ordersData && Array.isArray(ordersData)) {
          setOrdersCount(ordersData.length);
          setTotalSpent(ordersData.reduce((sum, o) => sum + (o.totalPrice || 0), 0));
        }
      } catch (orderErr) {
        console.warn("Failed to fetch user orders:", orderErr);
      }
    } catch (err: any) {
      // A dead session is handled centrally: customFetch's 401 interceptor
      // clears the store and redirects once, so this must not navigate too.
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { insets, tabBarHeight, user, logout, setUser, theme, toggleTheme, tokens, accent, styles, loading, setLoading, ordersCount, totalSpent, unreadCount, securityVisible, setSecurityVisible, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, changingPassword, setChangingPassword, signingOutAll, setSigningOutAll };
}
